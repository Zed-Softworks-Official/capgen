'use client'

import { useStore } from '@tanstack/react-store'
import ReactPlayer from 'react-player'

import { editorStore } from '~/lib/store'

export function VideoPlayer() {
    const { video, audio } = useStore(editorStore)

    if (!video) {
        return null
    }

    return (
        <div className="flex h-full w-full flex-col items-center justify-center">
            <ReactPlayer url={URL.createObjectURL(video)} controls />
            <audio src={URL.createObjectURL(new Blob([audio!]))} controls />
        </div>
    )
}
