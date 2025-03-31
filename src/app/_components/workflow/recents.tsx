'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { formatDistanceToNow, formatDuration } from 'date-fns'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import {
    CheckCircle2,
    Clock,
    Download,
    Eye,
    FileAudio,
    FileVideo,
    MoreVertical,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

import { db } from '~/lib/db'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { stateStore, workflowStore } from '~/lib/store'

export function Recents() {
    const recents = useLiveQuery(() => db.recents.toArray())

    if (!recents || recents.length === 0) {
        return (
            <Card className="border-primary/20">
                <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No Recent transcriptions</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-primary/20">
            <CardHeader className="flex items-center gap-2 text-xl">
                <CardTitle className="flex items-center gap-2">
                    <Clock className="text-primary size-5" />
                    Recent Transcriptions
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-border/30 divide-y">
                    {recents.map((transcription) => (
                        <div
                            key={transcription.id}
                            className="hover:bg-accent/30 flex items-center justify-between p-4 transition-colors duration-200 ease-in-out"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 rounded-full p-2">
                                    {transcription.file.type === 'video' ? (
                                        <FileVideo className="text-primary size-5" />
                                    ) : (
                                        <FileAudio className="text-primary size-5" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-medium">
                                        {transcription.file.name}
                                    </h3>
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        <span>
                                            {formatDistanceToNow(
                                                transcription.createdAt,
                                                { addSuffix: true }
                                            )}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {formatDuration(
                                                {
                                                    seconds: Math.floor(
                                                        transcription.duration
                                                    ),
                                                },
                                                { format: ['minutes', 'seconds'] }
                                            )}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {transcription.speakerCount} speaker
                                            {transcription.speakerCount !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="border-green-500/20 bg-green-500/10 text-green-500"
                                >
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Completed
                                </Badge>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-primary/10 rounded-full"
                                    //   onClick={() => handleDownload(transcription.id)}
                                >
                                    <Download className="h-4 w-4" />
                                    <span className="sr-only">Download</span>
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full"
                                        >
                                            <MoreVertical className="size-4" />
                                            <span className="sr-only">Open menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                stateStore.setState(() => ({
                                                    processing: false,
                                                    uploading: false,
                                                }))

                                                workflowStore.setState((prev) => ({
                                                    ...prev,
                                                    transcript:
                                                        transcription.captions.transcript,
                                                    speakers:
                                                        transcription.captions.speakers,
                                                    audioFile: transcription.audioUrl,
                                                }))
                                            }}
                                        >
                                            <Eye className="mr-2 size-4" />
                                            View
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
