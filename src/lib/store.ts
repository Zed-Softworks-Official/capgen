import { Store } from '@tanstack/react-store'

import type { WorkflowState } from './types'

export const workflowStore = new Store<WorkflowState>({
    currentFile: null,
    audio: null,
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

export function updateProgress(opts: { value: number; message: string }) {
    workflowStore.setState((state) => ({
        ...state,
        progress: opts,
    }))
}
