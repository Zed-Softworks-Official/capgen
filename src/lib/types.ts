import type { Transcript } from 'assemblyai'

export type Speaker = {
    id: string
    name: string
}

export type WorkflowState = {
    currentFile: {
        data: File
        type: 'video' | 'audio'
    } | null
    audio: File | null
    progress: {
        value: number
        message: string
    }
    transcript: Transcript | null
}

export type TrialData = {
    trialStartedAt: number
    trialEndsAt: number
    currentlyInTrial: boolean
}

export type RedisBaseKey = 'trial'
