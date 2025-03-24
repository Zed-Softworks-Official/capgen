'use client'

import { useStore } from '@tanstack/react-store'

import { VideoDropzone } from './video-uploader'
import { VideoPlayer } from './video-player'

import { editorStore } from '~/lib/store'

export function Editor() {
    const { video } = useStore(editorStore)

    if (!video) {
        return <VideoDropzone />
    }

    return <VideoPlayer />
}
