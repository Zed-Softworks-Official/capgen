import type { FileData } from '@ffmpeg/ffmpeg'
import { Store } from '@tanstack/react-store'

export const editorStore = new Store({
    video: null as File | null,
    audio: null as FileData | undefined | null,
})
