'use client'

import { useEffect, useRef } from 'react'
import { useStore } from '@tanstack/react-store'
import { toast } from 'sonner'

import { updateProgress, workflowStore } from '~/lib/store'
import { uploadAudioFile } from '~/lib/uploadthing'
import { Progress } from '../ui/progress'

import { extractAudioFromVideo } from '~/lib/extract'
import { tryCatch } from '~/lib/try-catch'
import { api } from '~/trpc/react'

export function Processing() {
    const { progress, currentFile } = useStore(workflowStore)

    const getTranscript = api.transcript.getTranscript.useMutation({
        onSuccess: () => {
            console.log('Successfully uploaded')
        },
        onError: (e) => {
            toast.error(e.message)
        },
    })

    useProcessFile(currentFile?.data, async (file: File) => {
        const extractionResult = await extractAudioFromVideo({
            video: file,
            logAction: (message) => {
                console.log(message)
            },
        })
        if (!extractionResult.isOk()) {
            toast.error(extractionResult.error.message)
            return
        }

        const { data: uploadedData, error: uploadError } = await tryCatch(
            uploadAudioFile(extractionResult.value.audioData)
        )
        if (!uploadedData?.isOk() || uploadError) {
            toast.message('Failed to upload audio file')
            return
        }

        updateProgress({
            value: 50,
            message: 'Analyzing audio',
        })
        getTranscript.mutate({
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
