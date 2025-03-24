'use client'

import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'

import { editorStore } from '~/lib/store'
import { extractAudioFromVideo } from '~/lib/extract'

export function VideoDropzone() {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 1) {
                return
            }

            const file = acceptedFiles[0]
            if (!file) {
                return
            }

            updateVideo(file)
            extractAudio(file)
        },
        accept: {
            'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
        },
    })

    return (
        <div
            {...getRootProps()}
            className="border-input hover:bg-accent flex h-96 w-full max-w-xl flex-col items-center justify-center gap-4 rounded-md border border-dashed p-4 transition-colors duration-200 ease-in-out"
        >
            <input {...getInputProps()} />
            <DropText isDragActive={isDragActive} />
        </div>
    )
}

function DropText(props: { isDragActive: boolean }) {
    if (props.isDragActive) {
        return <p>Drop the video here</p>
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <Upload className="size-6" />
            <p>Drag and drop a video here, or click to select a video</p>
        </div>
    )
}

function updateVideo(video: File) {
    editorStore.setState((state) => ({
        ...state,
        video,
    }))
}

async function extractAudio(video: File) {
    const { audioData, error } = await extractAudioFromVideo({
        video,
        logAction: (message) => console.log(message),
    })

    if (error) {
        console.error(error)
    }

    editorStore.setState((state) => ({
        ...state,
        audio: audioData,
    }))
}
