'use client'

import { useStore } from '@tanstack/react-store'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { Progress } from '~/app/_components/ui/progress'
import { extractAudioFromVideo, uploadAudioFile } from '~/lib/extract'

import { editorStore, updateProgress } from '~/lib/store'
import { tryCatch } from '~/lib/try-catch'
import { api } from '~/trpc/react'

export function Processing() {
    const { progress, video } = useStore(editorStore)

    const getTranscript = api.transcript.getTranscript.useMutation({
        onSuccess: () => {
            console.log('Successfully uploaded')
        },
        onError: (e) => {
            toast.error(e.message)
        },
    })

    const processFile = async (videoFile: File) => {
        const extractionResult = await extractAudioFromVideo({
            video: videoFile,
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
    }

    useEffect(() => {
        if (!video || progress.value !== 0) return

        // Track that we've started processing to prevent duplicate processing
        updateProgress({
            value: 1,
            message: 'Starting processing...',
        })

        void processFile(video)
    }, [video])

    return (
        <div>
            <Progress value={progress.value} />
            <span>{progress.message}</span>
        </div>
    )
}
