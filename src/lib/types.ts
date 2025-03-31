export type CapGenTrascript = Record<string, Line[]>

export type Captions = {
    speakers: Speaker[]
    transcript: CapGenTrascript
    duration?: number | null
}

export type Line = {
    text: string
    start: number
    end: number
    speakerId: string
}

export type Speaker = {
    id: string
    name: string
    color: string
}

export type WorkflowState = {
    currentFile: {
        data: File
        type: 'video' | 'audio'
    } | null
    audioFile: string | File | null
    progress: {
        value: number
        message: string
    }
    transcript: CapGenTrascript | null
    speakers: Speaker[]
    generateSpeakerLabels: boolean
}

export type TrialData = {
    trialStartedAt: number
    trialEndsAt: number
    currentlyInTrial: boolean
}

export type RedisBaseKey = 'user'
