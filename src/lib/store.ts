import { Store } from '@tanstack/react-store'

import type { WorkflowState } from './types'

export const workflowStore = new Store<WorkflowState>({
    currentFile: null,
    progress: {
        value: 0,
        message: 'Splitting Audio',
    },
    transcript: null,
    srt: null,
    editing: false,
    captions: null,
})

export function updateProgress(opts: { value: number; message: string }) {
    workflowStore.setState((state) => ({
        ...state,
        progress: opts,
    }))
}
