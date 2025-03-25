import { Store } from '@tanstack/react-store'

type WorkflowState = {
    currentFile: {
        data: File
        type: 'video' | 'audio'
    } | null
    progress: {
        value: number
        message: string
    }
}

export const workflowStore = new Store<WorkflowState>({
    currentFile: null,
    progress: {
        value: 0,
        message: 'Splitting Audio',
    },
})

export function updateProgress(opts: { value: number; message: string }) {
    workflowStore.setState((state) => ({
        ...state,
        progress: opts,
    }))
}
