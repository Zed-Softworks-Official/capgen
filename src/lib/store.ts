import { Store } from '@tanstack/react-store'

type WorkflowStoreType = {
    currentState: 'choose-file' | 'processing' | 'finished'
    progress: {
        value: number
        message: string
    }
    file: {
        uploadedData: File
        uploadedType: 'video' | 'audio'
        audioUrl?: string
    } | null
    options: {
        separateSpeakers: boolean
    } | null
    requestId: string | null
}

export const workflowStore = new Store<WorkflowStoreType>({
    currentState: 'choose-file',
    progress: {
        value: 0,
        message: 'Choosing a file',
    },
    file: null,
    options: null,
    requestId: null,
})
