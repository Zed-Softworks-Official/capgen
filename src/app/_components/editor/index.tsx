'use client'

import { useStore } from '@tanstack/react-store'

import { VideoDropzone } from './video-dropzone'
import { editorStore } from '~/lib/store'
import { Properties } from './properties'

export function Editor() {
    const { video } = useStore(editorStore)

    if (!video) {
        return <VideoDropzone />
    }

    return <Properties />
}
