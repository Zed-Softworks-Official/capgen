'use client'

import { useStore } from '@tanstack/react-store'
import ReactPlayer from 'react-player'

import { editorStore } from '~/lib/store'

export function Properties() {
    const { video } = useStore(editorStore)

    if (!video) {
        return null
    }

    return (
        <div className="flex h-full w-full flex-col items-center justify-center">
            <ReactPlayer url={URL.createObjectURL(video)} controls />
        </div>
    )
}
