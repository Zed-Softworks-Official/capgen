'use client'

import Link from 'next/link'
import { usePreloadedQuery, type Preloaded } from 'convex/react'
import { ArrowLeft, Pause, Play, Users } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import { Button } from '~/app/_components/ui/button'
import { Card, CardContent } from '~/app/_components/ui/card'
import { Checkbox } from '~/app/_components/ui/checkbox'
import { Label } from '~/app/_components/ui/label'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '~/app/_components/ui/tooltip'
import type { api } from '~/convex/_generated/api'

import type { CapGenTranscript, Speaker } from '~/lib/types'
import { cn } from '~/lib/utils'
import { DownloadButton } from './download'
import { notFound } from 'next/navigation'
import { workflowStore } from '~/lib/store'

export function TranscriptDisplay(props: {
    preloadedQuery: Preloaded<typeof api.functions.transcript.getTranscriptByRequestId>
}) {
    const transcript = usePreloadedQuery(props.preloadedQuery)
    const audioRef = useRef<HTMLAudioElement>(null)

    const [selectedSpeakers, setSelectedSpeakers] = useState<string[]>(
        transcript?.data.speakers.map((speaker) => speaker.id) ?? []
    )

    const fullTranscript = useMemo(() => {
        const segments = Object.values(transcript?.data.transcript ?? {}).flat()
        return segments.sort((a, b) => a.start - b.start)
    }, [transcript])

    const handleSpeakerToggle = (speakerId: string) => {
        setSelectedSpeakers((prev) =>
            prev.includes(speakerId)
                ? prev.filter((id) => id !== speakerId)
                : [...prev, speakerId]
        )
    }

    if (!transcript) {
        return notFound()
    }

    return (
        <>
            {transcript?.audioUrl && <audio ref={audioRef} src={transcript.audioUrl} />}
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
                                                transcript?.data.speakers.map(
                                                    (speaker) => speaker.id
                                                ) ?? []
                                            )
                                        }
                                        className="border-primary/30 hover:bg-primary/10 cursor-pointer"
                                    >
                                        Select All
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {transcript?.data.speakers.map((speaker) => (
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
                                        <SpeakerPreview
                                            speaker={speaker}
                                            audioRef={audioRef}
                                            audioUrl={transcript?.audioUrl}
                                            transcript={transcript?.data.transcript}
                                        />
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
                                {fullTranscript
                                    .filter((line) =>
                                        selectedSpeakers.includes(line.speakerId)
                                    )
                                    .map((line) => (
                                        <div
                                            key={`preview-${line.speakerId}-${line.start}`}
                                            className="mb-4"
                                        >
                                            {line.text && (
                                                <div className="mb-2">
                                                    <span
                                                        className="font-medium"
                                                        style={{
                                                            color: transcript?.data.speakers.find(
                                                                (s) =>
                                                                    s.id ===
                                                                    line.speakerId
                                                            )?.color,
                                                        }}
                                                    >
                                                        {line.speakerId}:
                                                    </span>{' '}
                                                    <span>{line.text}</span>
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

                            <DownloadButton
                                selectedSpeakers={selectedSpeakers}
                                transcript={transcript.data.transcript}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}

function SpeakerPreview(props: {
    audioUrl: string | undefined
    audioRef: React.RefObject<HTMLAudioElement | null>
    speaker: Speaker
    transcript: CapGenTranscript
}) {
    const [isPlaying, setIsPlaying] = useState(false)

    const togglePlayback = async () => {
        if (!props.audioRef.current || !props.audioUrl) return
        const sample = props.transcript?.[props.speaker.id]?.[0]

        if (isPlaying) {
            props.audioRef.current.pause()
            setIsPlaying(false)
        } else {
            props.audioRef.current.pause()
            props.audioRef.current.currentTime = (sample?.start ?? 0) / 1000
            const duration = (sample?.end ?? 0) - (sample?.start ?? 0)

            await props.audioRef.current.play()

            setTimeout(() => {
                props.audioRef.current?.pause()
                setIsPlaying(false)
            }, duration)
        }

        setIsPlaying(!isPlaying)
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={'ghost'}
                        size={'icon'}
                        className={cn(
                            'relative size-9 rounded-full',
                            isPlaying && 'bg-primary/20'
                        )}
                        onClick={togglePlayback}
                        disabled={!props.audioUrl}
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

export function BackButton() {
    return (
        <Button variant={'ghost'} size={'icon'} className="mr-2 cursor-pointer" asChild>
            <Link
                href={'/home'}
                prefetch={true}
                onClick={() =>
                    workflowStore.setState(() => ({
                        currentState: 'choose-file',
                        file: null,
                        options: {
                            separateSpeakers: true,
                            punctuate: true,
                        },
                        progress: {
                            value: 0,
                            message: 'Extracting audio from video...',
                        },
                        requestId: null,
                    }))
                }
            >
                <ArrowLeft className="size-5" />
            </Link>
        </Button>
    )
}
