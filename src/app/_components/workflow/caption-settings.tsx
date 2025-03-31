'use client'

import { toast } from 'sonner'
import { useStore } from '@tanstack/react-store'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Download, Pause, Play, Users } from 'lucide-react'

import { stateStore, workflowStore } from '~/lib/store'
import type { Speaker } from '~/lib/types'
import { cn } from '~/lib/utils'

import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

import { api } from '~/trpc/react'

export function CaptionSettings() {
    const { speakers, transcript, audioFile } = useStore(workflowStore)

    const audioRef = useRef<HTMLAudioElement>(null)
    const { audioUrl } = useAudioUrl(audioFile, audioRef)

    const [selectedSpeakers, setSelectedSpeakers] = useState<string[]>(
        speakers.map((speaker) => speaker.id)
    )

    const fullTranscript = useMemo(() => {
        const segments = Object.values(transcript ?? {}).flat()
        return segments.sort((a, b) => a.start - b.start)
    }, [transcript])

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
                            onClick={() => {
                                stateStore.setState((prev) => ({
                                    ...prev,
                                    uploading: true,
                                    processing: false,
                                }))

                                workflowStore.setState((prev) => ({
                                    ...prev,
                                    transcript: null,
                                    currentFile: null,
                                    audio: null,
                                }))
                            }}
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

                {audioUrl && <audio ref={audioRef} src={audioUrl} />}
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
                                            <SpeakerPreview
                                                speaker={speaker}
                                                audioUrl={audioUrl}
                                                audioRef={audioRef}
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
                                                                color: speakers.find(
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

                                {/* <DownloadButton selectedSpeakers={selectedSpeakers} /> */}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    )
}

// function DownloadButton(props: { selectedSpeakers: string[] }) {
//     const generateSrt = api.transcript.generateSrt.useMutation({
//         onSuccess: (res) => {
//             if (res.error) {
//                 toast.error('Failed to generate srt')
//                 return
//             }

//             const blob = new Blob([res.data], { type: 'text/srt' })
//             const url = URL.createObjectURL(blob)
//             const a = document.createElement('a')
//             a.href = url
//             a.download = 'transcript.srt'
//             a.click()
//         },
//     })

//     return (
//         <Button
//             className="group relative w-full cursor-pointer overflow-hidden"
//             onClick={() => {
//                 console.log('Downloading srt')
//                 // if (!props.transcriptId) {
//                 //     toast.error('No transcript id found')
//                 //     return
//                 // }

//                 // generateSrt.mutate({
//                 //     transcriptId: props.transcriptId,
//                 //     maxCharsPerCaption: 100,
//                 //     includedSpeakers: props.selectedSpeakers,
//                 // })
//             }}
//             disabled={props.selectedSpeakers.length === 0 || generateSrt.isPending}
//         >
//             <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-100 transition-opacity group-hover:opacity-90"></div>
//             <span className="relative flex items-center">
//                 <Download className="mr-2 h-4 w-4" /> Download SRT
//             </span>
//         </Button>
//     )
// }

function SpeakerPreview(props: {
    speaker: Speaker
    audioUrl: string | null
    audioRef: React.RefObject<HTMLAudioElement | null>
}) {
    const [isPlaying, setIsPlaying] = useState(false)

    const { transcript } = useStore(workflowStore)

    const togglePlayback = async () => {
        if (!props.audioRef.current || !props.audioUrl) return
        const sample = transcript?.[props.speaker.id]?.[0]

        if (isPlaying) {
            props.audioRef.current.pause()
            setIsPlaying(false)
        } else {
            props.audioRef.current.pause()
            props.audioRef.current.currentTime = sample?.start ?? 0
            const duration = (sample?.end ?? 0) - (sample?.start ?? 0)

            await props.audioRef.current.play()
            setIsPlaying(true)

            setTimeout(() => {
                setIsPlaying(false)
                props.audioRef.current?.pause()
            }, duration)
        }
    }

    return (
        <TooltipProvider>
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

function useAudioUrl(
    audioFile: string | File | null,
    audioRef: React.RefObject<HTMLAudioElement | null>
) {
    const [audioUrl, setAudioUrl] = useState<string | null>(null)

    useEffect(() => {
        if (!audioFile) {
            setAudioUrl(null)
            return
        }

        if (typeof audioFile === 'string') {
            setAudioUrl(audioFile)
            return
        }

        const url = URL.createObjectURL(audioFile)
        setAudioUrl(url)

        return () => {
            URL.revokeObjectURL(url)
        }
    }, [audioFile])

    useEffect(() => {
        if (audioRef.current && audioUrl) {
            audioRef.current.load()
        }
    }, [audioUrl])

    return { audioUrl }
}
