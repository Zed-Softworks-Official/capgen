import type { ReactAction } from 'convex/react'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import type { api } from '~/convex/_generated/api'

import { extractAudioFromVideo } from '~/lib/extract'
import { workflowStore } from '~/lib/store'
import { tryCatch } from '~/lib/try-catch'
import { uploadAudioFile } from '~/lib/uploadthing'

type TranscribeActionType = ReactAction<typeof api.functions.transcript.transcribeAudio>

export function useProcessFile(
    file: File | undefined,
    transcribeAudio: TranscribeActionType
) {
    const processedRef = useRef<boolean>(false)

    useEffect(() => {
        if (!file || processedRef.current) return

        processedRef.current = true
        void processFile(file, transcribeAudio)
    }, [file])
}

async function processFile(file: File, transcribeAudio: TranscribeActionType) {
    let extractionResult = null
    if (file.type.includes('video')) {
        workflowStore.setState((state) => ({
            ...state,
            progress: {
                value: 0,
                message: 'Extracting audio from video...',
            },
        }))

        extractionResult = await extractAudioFromVideo({
            video: file,
            logAction: (message) => {
                console.log(message)
            },
        })

        if (extractionResult.isErr()) {
            toast.error(extractionResult.error.message)
            return
        }
    }

    workflowStore.setState((state) => ({
        ...state,
        progress: {
            value: 33,
            message: 'Uploading audio file...',
        },
    }))

    const { data: uploadedData, error: uploadError } = await tryCatch(
        uploadAudioFile(extractionResult?.value.audioData ?? file)
    )

    if (!uploadedData?.isOk() || uploadError) {
        toast.error('Failed to upload audio file')
        return
    }

    workflowStore.setState((state) => ({
        ...state,
        file: {
            ...state.file!,
            audioUrl: uploadedData.value.url,
        },
        progress: {
            value: 66,
            message: 'Analyzing audio...',
        },
    }))

    const transcript = await transcribeAudio({
        audioUrl: uploadedData.value.url,
        filename: file.name,
        filetype: file.type.includes('video') ? 'video' : 'audio',
        speakerLabels: workflowStore.state.options?.separateSpeakers ?? true,
    })

    workflowStore.setState((state) => ({
        ...state,
        progress: {
            value: 100,
            message: 'Transcription complete',
        },
        currentState: 'finished',
        requestId: transcript.requestId,
    }))
}
