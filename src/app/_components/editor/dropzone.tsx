'use client'

import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'

import { editorStore } from '~/lib/store'
import { extractAudioFromVideo } from '~/lib/extract'

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

            updateVideo(file)
        },
        onDropRejected(fileRejections, event) {
            toast.error('Please upload a valid video')
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
        <div className="flex flex-col items-center gap-4">
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
