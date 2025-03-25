import { Store } from '@tanstack/react-store'
import type { Transcript } from 'assemblyai'

type WorkflowState = {
    currentFile: {
        data: File
        type: 'video' | 'audio'
    } | null
    progress: {
        value: number
        message: string
    }
    transcript: {
        data: Transcript
        srt: string
    } | null
    editing: boolean
}

export const workflowStore = new Store<WorkflowState>({
    currentFile: null,
    progress: {
        value: 0,
        message: 'Splitting Audio',
    },
    transcript: null,
    editing: false,
})

export function updateProgress(opts: { value: number; message: string }) {
    workflowStore.setState((state) => ({
        ...state,
        progress: opts,
    }))
}
