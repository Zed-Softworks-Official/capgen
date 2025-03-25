'use client'

import { useStore } from '@tanstack/react-store'

import { Dropzone } from './dropzone'

import { editorStore } from '~/lib/store'
import { Processing } from './processing'
import { VideoPlayer } from './video-player'

export function Editor() {
    const { video, progress } = useStore(editorStore)

    if (!video) {
        return <Dropzone />
    }

    if (progress.value !== 100) {
        return <Processing />
    }

    return <VideoPlayer />
}
