'use client'

import { useStore } from '@tanstack/react-store'
import { useForm } from '@tanstack/react-form'

import { Mic, Settings, Upload, Video, Wand2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'

import { workflowStore } from '~/lib/store'
import { cn } from '~/lib/utils'

import { Card, CardContent } from '~/app/_components/ui/card'
import { Button } from '~/app/_components/ui/button'
import { Label } from '~/app/_components/ui/label'
import { Switch } from '~/app/_components/ui/switch'

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
                        <DropForm />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function DropForm() {
    const { file } = useStore(workflowStore)

    const form = useForm({
        defaultValues: {
            separateSpeakers: true,
        },
        onSubmit: (data) => {
            workflowStore.setState((state) => ({
                ...state,
                currentState: 'processing',
                options: {
                    separateSpeakers: data.value.separateSpeakers,
                },
            }))
        },
    })

    if (file) {
        return (
            <div className="w-full">
                <div className="bg-accent/40 mb-6 flex items-center rounded-lg p-4">
                    <div className="from-purple/20 to-violet/20 mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br p-1">
                        <div className="bg-background flex h-full w-full items-center justify-center rounded-full">
                            {file?.uploadedType.startsWith('video/') ? (
                                <Video className="text-primary h-5 w-5" />
                            ) : (
                                <Mic className="text-primary h-5 w-5" />
                            )}
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium">{file.uploadedData.name}</p>
                        <p className="text-muted-foreground text-sm">
                            {(file.uploadedData.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation()

                            workflowStore.setState((state) => ({
                                ...state,
                                file: null,
                            }))
                        }}
                        className="text-destructive hover:text-destructive/90"
                    >
                        Remove
                    </Button>
                </div>

                <form className="mt-6 space-y-6">
                    <form.Field name="separateSpeakers">
                        {(field) => (
                            <div className="bg-accent/40 flex items-center justify-between rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <Settings className="text-primary size-5" />
                                    <Label
                                        htmlFor={field.name}
                                        className="text-sm font-medium"
                                    >
                                        Separate speakers
                                    </Label>
                                </div>
                                <Switch
                                    id={field.name}
                                    checked={field.state.value}
                                    onCheckedChange={field.handleChange}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                    }}
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting]}
                    >
                        {([canSubmit, isSubmitting]) => (
                            <Button
                                type="submit"
                                className="group relative w-full cursor-pointer overflow-hidden"
                                disabled={!canSubmit || isSubmitting}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()

                                    void form.handleSubmit()
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-100 transition-opacity group-hover:opacity-90"></div>
                                <span className="relative flex items-center">
                                    <Wand2 className="mr-2 size-4" /> Generate Captions
                                </span>
                            </Button>
                        )}
                    </form.Subscribe>
                </form>
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
        file: {
            uploadedData: opts.file,
            uploadedType: opts.type,
        },
    }))
}
