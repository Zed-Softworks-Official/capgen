'use client'

import { useEffect, useRef } from 'react'
import { useStore } from '@tanstack/react-store'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { stateStore, updateProgress, workflowStore } from '~/lib/store'
import { uploadAudioFile } from '~/lib/uploadthing'
import { Progress } from '~/app/_components/ui/progress'

import { extractAudioFromVideo } from '~/lib/extract'
import { tryCatch } from '~/lib/try-catch'
import { api } from '~/trpc/react'

export function Processing() {
    const { progress, currentFile, generateSpeakerLabels } = useStore(workflowStore)

    const transcribeAudio = api.transcript.transcribeAudio.useMutation({
        onSuccess: (res) => {
            if (res.error) {
                toast.error(res.error.message)
                return
            }

            updateProgress({
                value: 100,
                message: 'Transcription complete',
            })

            workflowStore.setState((state) => ({
                ...state,
                transcript: res.data.transcript,
                speakers: res.data.speakers ?? [],
            }))

            stateStore.setState((state) => ({
                ...state,
                processing: false,
            }))
        },
        onError: (e) => {
            toast.error(e.message)
        },
    })

    useProcessFile(currentFile?.data, async (file: File) => {
        let extractionResult = null
        if (file.type.includes('video')) {
            extractionResult = await extractAudioFromVideo({
                video: file,
                logAction: (message) => {
                    console.log(message)
                },
            })

            if (!extractionResult.isOk()) {
                toast.error(extractionResult.error.message)
                return
            }
        }

        updateProgress({
            value: 33,
            message: 'Uploading audio file...',
        })

        const { data: uploadedData, error: uploadError } = await tryCatch(
            uploadAudioFile(extractionResult?.value.audioData ?? file)
        )

        if (!uploadedData?.isOk() || uploadError) {
            toast.error('Failed to upload audio file')
            return
        }

        updateProgress({
            value: 66,
            message: 'Analyzing audio...',
        })

        transcribeAudio.mutate({
            audioURL: uploadedData.value.url,
            speakerLabels: generateSpeakerLabels,
        })

        workflowStore.setState((state) => ({
            ...state,
            audio: uploadedData.value.url,
        }))
    })

    return (
        <main className="flex flex-1 items-center justify-center p-10">
            <div className="w-full max-w-md">
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="mb-2 text-2xl font-bold">Processing Your Audio</h2>
                        <p className="text-muted-foreground">
                            Please wait while we generate your captions
                        </p>
                    </div>

                    <div className="mb-6 flex items-center justify-center">
                        <div className="relative">
                            <div className="absolute -inset-3 animate-pulse rounded-full bg-gradient-to-r from-purple-600 to-violet-600 opacity-30 blur"></div>
                            <Loader2 className="text-primary relative size-12 animate-spin" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Progress value={progress.value} className="w-full" />
                        <span className="w-full">{progress.message}</span>
                    </div>

                    <p className="text-muted-foreground mt-6 text-center text-sm">
                        This may take a few minutes depending on the length of your audio
                        file
                    </p>
                </div>
            </div>
        </main>
    )
}

function useProcessFile(
    currentFile: File | undefined,
    cb: (file: File) => Promise<void>
) {
    const processedRef = useRef<boolean>(false)

    useEffect(() => {
        if (!currentFile || processedRef.current) return

        processedRef.current = true
        void cb(currentFile)
    }, [currentFile, cb])
}
