'use client'

import { useStore } from '@tanstack/react-store'
import { useForm } from '@tanstack/react-form'

import { stateStore, workflowStore } from '~/lib/store'
import type { Speaker } from '~/lib/types'
import { transcript } from '~/lib/test'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { z } from 'zod'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../ui/accordion'
import { Switch } from '../ui/switch'
import { cn } from '~/lib/utils'
import { Button } from '../ui/button'
import { ArrowLeft, Download, Pause, Play, Users } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { useEffect, useRef, useState } from 'react'
import { Checkbox } from '../ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

export function CaptionSettings() {
    const { transcript, speakers } = useStore(workflowStore)

    const [selectedSpeakers, setSelectedSpeakers] = useState<string[]>(
        speakers.map((speaker) => speaker.id)
    )

    const handleSpeakerToggle = (speakerId: string) => {
        setSelectedSpeakers((prev) =>
            prev.includes(speakerId)
                ? prev.filter((id) => id !== speakerId)
                : [...prev, speakerId]
        )
    }

    return (
        <main className="flex-1">
            <div className="container mx-auto px-4 py-10">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center">
                        <Button
                            variant={'ghost'}
                            size={'icon'}
                            onClick={() =>
                                stateStore.setState((prev) => ({
                                    ...prev,
                                    uploading: true,
                                    processing: false,
                                }))
                            }
                            className="mr-2 cursor-pointer"
                        >
                            <ArrowLeft className="size-5" />
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold">Caption Settings</h2>
                            <p className="text-muted-foreground">
                                Choose which speakers to include in your cpations
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <Card className="border-primary/20 overflow-hidden shadow-lg">
                            <div className="from-purple/5 to-violet/5 pointer-events-none absolute inset-0 bg-gradient-to-br"></div>
                            <CardContent className="relative p-6">
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Users className="text-primary mr-2 size-5" />
                                        <h2 className="text-xl font-medium">Speakers</h2>
                                    </div>
                                    <div className="flex items-center">
                                        <Button
                                            variant={'outline'}
                                            size={'sm'}
                                            onClick={() =>
                                                setSelectedSpeakers(
                                                    speakers.map((speaker) => speaker.id)
                                                )
                                            }
                                            className="border-primary/30 hover:bg-primary/10"
                                        >
                                            Select All
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {speakers.map((speaker) => (
                                        <div
                                            key={speaker.id}
                                            className="hover:bg-accent/50 hover:border-primary/20 flex items-center gap-4 rounded-lg border border-transparent p-4 transition-colors"
                                        >
                                            <Checkbox
                                                id={speaker.id}
                                                checked={selectedSpeakers.includes(
                                                    speaker.id
                                                )}
                                                onCheckedChange={() =>
                                                    handleSpeakerToggle(speaker.id)
                                                }
                                            />
                                            <div
                                                className="size-4 rounded-full"
                                                style={{ backgroundColor: speaker.color }}
                                            ></div>
                                            <Label
                                                htmlFor={speaker.id}
                                                className="flex-1 cursor-pointer"
                                            >
                                                Speaker {speaker.name}
                                            </Label>
                                            <SpeakerPreview speaker={speaker} />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card className="border-primary/20 overflow-hidden shadow-lg">
                            <div className="from-purple/5 to-violet/5 pointer-events-none absolute inset-0 bg-gradient-to-br"></div>
                            <CardContent className="relative p-6">
                                <h2 className="mb-4 flex items-center text-xl font-medium">
                                    <span className="bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">
                                        Preview
                                    </span>
                                </h2>
                                <div className="bg-accent/30 border-primary/10 mb-6 h-64 overflow-y-auto rounded-lg border p-4">
                                    {speakers
                                        .filter((s) => selectedSpeakers.includes(s.id))
                                        .map((speaker, idx) => (
                                            <div
                                                key={`preview-${speaker.id}`}
                                                className="mb-4"
                                            >
                                                {speaker.sample && (
                                                    <div className="mb-2">
                                                        <span
                                                            className="font-medium"
                                                            style={{
                                                                color: speaker.color,
                                                            }}
                                                        >
                                                            {speaker.name}:
                                                        </span>{' '}
                                                        <span>{speaker.sample.text}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                    {selectedSpeakers.length === 0 && (
                                        <div className="text-muted-foreground py-10 text-center">
                                            No speakers selected
                                        </div>
                                    )}
                                </div>

                                <Button
                                    className="group relative w-full overflow-hidden"
                                    onClick={() => {
                                        console.log('download')
                                    }}
                                    disabled={selectedSpeakers.length === 0}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-100 transition-opacity group-hover:opacity-90"></div>
                                    <span className="relative flex items-center">
                                        <Download className="mr-2 h-4 w-4" /> Download SRT
                                    </span>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    )
}

function SpeakerPreview(props: { speaker: Speaker }) {
    const { audio } = useStore(workflowStore)

    const [isPlaying, setIsPlaying] = useState(false)
    const [audioUrl, setAudioUrl] = useState<string | null>(audio)

    const audioRef = useRef<HTMLAudioElement>(null)

    const togglePlayback = () => {
        if (!audioRef.current || !audioUrl) return

        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.currentTime = props.speaker.sample.start
            void audioRef.current.play()

            const duration =
                (props.speaker.sample.end - props.speaker.sample.start) * 1000

            setTimeout(() => {
                if (audioRef.current) {
                    audioRef.current.pause()
                    setIsPlaying(false)
                }
            }, duration)
        }

        setIsPlaying(!isPlaying)
    }

    useEffect(() => {
        if (!audioRef.current) return

        const handleEnded = () => setIsPlaying(false)
        audioRef.current.addEventListener('ended', handleEnded)

        return () => {
            audioRef.current?.removeEventListener('ended', handleEnded)
        }
    }, [])

    return (
        <TooltipProvider>
            {audioUrl && <audio ref={audioRef} src={audioUrl} />}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={'ghost'}
                        size={'icon'}
                        className={cn(
                            'relative size-8 rounded-full',
                            isPlaying && 'bg-primary/20'
                        )}
                        onClick={togglePlayback}
                        disabled={!audioUrl}
                    >
                        {isPlaying && (
                            <span className="bg-primary/10 absolute inset-0 animate-ping rounded-full opacity-75"></span>
                        )}
                        {isPlaying ? (
                            <Pause className="size-4" />
                        ) : (
                            <Play className="size-4" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Play Sample</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
