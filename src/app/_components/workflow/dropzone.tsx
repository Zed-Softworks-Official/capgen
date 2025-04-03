'use client'

import { useStore } from '@tanstack/react-store'
import { useDropzone } from 'react-dropzone'
import { Mic, Settings, Upload, Video, Wand2 } from 'lucide-react'
import { toast } from 'sonner'

import { stateStore, workflowStore } from '~/lib/store'
import { Card, CardContent } from '../ui/card'
import { cn } from '~/lib/utils'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { useState } from 'react'
import { api } from '~/trpc/react'
import { Input } from '../ui/input'

export function Dropzone() {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 1) {
                toast.error('Please upload only one video')
                return
            }

            const file = acceptedFiles[0]
            if (!file) {
                return
            }

            if (file.type.startsWith('video/')) {
                updateCurrentFile({ file, type: 'video' })
            } else {
                updateCurrentFile({ file, type: 'audio' })
            }
        },
        onDropRejected() {
            toast.error('Please upload a valid video')
        },
        accept: {
            'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
            'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.flac'],
        },
    })

    return (
        <div {...getRootProps()} className="mx-auto max-w-2xl">
            <Card className="bg-background/50 border-primary/30 hover:border-primary cursor-pointer overflow-hidden border-2 border-dashed shadow-lg transition-colors duration-200 ease-in-out">
                <CardContent className="relative p-6">
                    <div
                        className={cn(
                            'flex flex-col items-center justify-center rounded-lg px-6 py-10 transition-all',
                            isDragActive
                                ? 'bg-primary-10 scale-[0.99]'
                                : 'bg-background/50'
                        )}
                    >
                        <input {...getInputProps()} />
                        <DropText />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function DropText() {
    const { currentFile } = useStore(workflowStore)

    const [separateSpeakers, setSeparateSpeakers] = useState(true)
    const [wordsPerCaption, setWordsPerCaption] = useState(7)

    const checkUserSubscription = api.user.checkUserSubscription.useMutation({
        onSuccess: (res) => {
            if (!res.value) {
                toast.error(res.message)
                return
            }

            stateStore.setState(() => ({
                uploading: false,
                processing: true,
            }))
        },
        onError: () => {
            toast.error('Error verifying subscription')
        },
    })

    if (currentFile) {
        return (
            <div className="w-full">
                <div className="bg-accent/40 mb-6 flex items-center rounded-lg p-4">
                    <div className="from-purple/20 to-violet/20 mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br p-1">
                        <div className="bg-background flex h-full w-full items-center justify-center rounded-full">
                            {currentFile?.type.startsWith('video/') ? (
                                <Video className="text-primary h-5 w-5" />
                            ) : (
                                <Mic className="text-primary h-5 w-5" />
                            )}
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium">{currentFile.data.name}</p>
                        <p className="text-muted-foreground text-sm">
                            {(currentFile.data.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation()

                            workflowStore.setState((state) => ({
                                ...state,
                                currentFile: null,
                            }))
                        }}
                        className="text-destructive hover:text-destructive/90"
                    >
                        Remove
                    </Button>
                </div>

                <div className="mt-6 space-y-6">
                    <div className="bg-accent/40 flex items-center justify-between rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <Settings className="text-primary h-5 w-5" />
                            <Label
                                htmlFor="separate-speakers"
                                className="text-sm font-medium"
                            >
                                Separate speakers
                            </Label>
                        </div>
                        <Switch
                            id="separate-speakers"
                            checked={separateSpeakers}
                            onCheckedChange={(checked) => {
                                setSeparateSpeakers(checked)

                                workflowStore.setState((state) => ({
                                    ...state,
                                    generateSpeakerLabels: checked,
                                }))
                            }}
                            onClick={(e) => {
                                e.stopPropagation()
                            }}
                        />
                    </div>

                    {/* <div className="bg-accent/40 flex items-center justify-between rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            
                            <Label
                                htmlFor="words-per-caption"
                                className="text-sm font-medium"
                            >
                                Words per caption
                            </Label>
                        </div>
                        <Input
                            id="words-per-caption"
                            type="number"
                            value={wordsPerCaption}
                            onChange={(e) => setWordsPerCaption(e.target.valueAsNumber)}
                        />
                    </div> */}

                    <Button
                        className="group relative w-full cursor-pointer overflow-hidden"
                        disabled={checkUserSubscription.isPending}
                        onClick={(e) => {
                            e.stopPropagation()

                            checkUserSubscription.mutate()
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-100 transition-opacity group-hover:opacity-90"></div>
                        <span className="relative flex items-center">
                            <Wand2 className="mr-2 h-4 w-4" /> Generate Captions
                        </span>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="from-purple/20 to-violet/20 mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br p-1">
                <div className="bg-background flex h-full w-full items-center justify-center rounded-full">
                    <Upload className="text-primary h-8 w-8" />
                </div>
            </div>
            <h3 className="mb-2 text-xl font-medium">
                Drag & drop your audio or video file
            </h3>
            <p className="text-muted-foreground mb-6 text-sm">
                Supports MP3, WAV, MP4, MOV and other formats
            </p>
        </>
    )
}

function updateCurrentFile(opts: { file: File; type: 'video' | 'audio' }) {
    workflowStore.setState((state) => ({
        ...state,
        currentFile: {
            data: opts.file,
            type: opts.type,
        },
    }))
}
