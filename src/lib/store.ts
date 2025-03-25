import type { FileData } from '@ffmpeg/ffmpeg'
import { Store } from '@tanstack/react-store'

export const editorStore = new Store({
    video: null as File | null,

    progress: {
        value: 0,
        message: 'Splitting Audio',
    },
})

export function updateProgress(opts: { value: number; message: string }) {
    editorStore.setState((state) => ({
        ...state,
        progress: opts,
    }))
}

export const notificationStore = new Store({
    toastId: null as string | number | null,
})
