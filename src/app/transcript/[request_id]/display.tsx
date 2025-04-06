'use client'

import { usePreloadedQuery, type Preloaded } from 'convex/react'
import { Users } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Button } from '~/app/_components/ui/button'
import { Card, CardContent } from '~/app/_components/ui/card'
import { Checkbox } from '~/app/_components/ui/checkbox'
import { Label } from '~/app/_components/ui/label'
import type { api } from '~/convex/_generated/api'
import type { CapGenTranscript } from '~/lib/types'

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

    return (
        <>
            {/* {audioUrl && <audio ref={audioRef} src={audioUrl} />} */}
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
                                        {/* <SpeakerPreview
                                            speaker={speaker}
                                            audioRef={audioRef}
                                        /> */}
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

                            {/* <DownloadButton selectedSpeakers={selectedSpeakers} /> */}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
