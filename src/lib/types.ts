export type CapGenTranscript = Record<string, Line[]>

export type Captions = {
    speakers: Speaker[]
    transcript: CapGenTranscript
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

export type RedisBaseKey = 'user' | 'customer'

export type TrialData = {
    currentlyInTrial: boolean
    trialEndsAt: number
    trialStartedAt: number
}
