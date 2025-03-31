import { Store } from '@tanstack/react-store'

import type { WorkflowState } from './types'

export const workflowStore = new Store<WorkflowState>({
    currentFile: null,
    audioFile: null,
    progress: {
        value: 0,
        message: 'Splitting Audio...',
    },
    transcript: null,
    speakers: [],
    generateSpeakerLabels: true,
})

export const stateStore = new Store({
    uploading: true,
    processing: false,
})

export const audioPreviewStore = new Store({
    audioUrl: null as string | null,
    isPlaying: false,
    currentSample: null,
})

export function updateProgress(opts: { value: number; message: string }) {
    workflowStore.setState((state) => ({
        ...state,
        progress: opts,
    }))
}
