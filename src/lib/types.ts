import type { Transcript } from 'assemblyai'

export type Speaker = {
    id: string
    name: string
    color: string
    sample: {
        start: number
        end: number
        text: string
    }
}

export type WorkflowState = {
    currentFile: {
        data: File
        type: 'video' | 'audio'
    } | null
    audioFile: File | null
    progress: {
        value: number
        message: string
    }
    transcript: Transcript | null
    speakers: Speaker[]
    generateSpeakerLabels: boolean
}

export type TrialData = {
    trialStartedAt: number
    trialEndsAt: number
    currentlyInTrial: boolean
}

export type RedisBaseKey = 'user'
