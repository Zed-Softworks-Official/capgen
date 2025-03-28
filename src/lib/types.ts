import type { Transcript } from 'assemblyai'

export type Speaker = {
    id: string
    name: string
    textColor: string
    borderColor: string | null
    includeInCaption: boolean
}

export type Caption = {
    text: string
    start: number
    end: number
    duration: number
    speaker: Speaker
}

export type WorkflowState = {
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
    captions: Caption[] | null
}
