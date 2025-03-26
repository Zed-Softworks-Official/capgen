'use client'

import { useEffect, useRef } from 'react'
import { useStore } from '@tanstack/react-store'
import { toast } from 'sonner'

import { updateProgress, workflowStore } from '~/lib/store'
import { uploadAudioFile } from '~/lib/uploadthing'
import { Progress } from '~/app/_components/ui/progress'

import { extractAudioFromVideo } from '~/lib/extract'
import { tryCatch } from '~/lib/try-catch'
import { api } from '~/trpc/react'

export function Processing() {
    const { progress, currentFile } = useStore(workflowStore)

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
                transcript: {
                    data: res.data.transcript,
                    srt: res.data.srt,
                },
                editing: true,
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
            message: 'Uploading audio file',
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
            message: 'Analyzing audio',
        })

        transcribeAudio.mutate({
            audioURL: uploadedData.value.url,
        })
    })

    return (
        <div className="flex w-full max-w-xl flex-col items-center justify-center gap-4">
            <Progress value={progress.value} />
            <span>{progress.message}</span>
        </div>
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
