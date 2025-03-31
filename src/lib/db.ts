import Dexie, { type EntityTable } from 'dexie'
import type { Captions } from './types'

type RecentCaptions = {
    id: string
    captions: Captions
    speakerCount: number
    duration: number
    audioUrl: string
    file: {
        name: string
        type: 'video' | 'audio'
    }
    createdAt: number
}

const db = new Dexie('capgen') as Dexie & {
    recents: EntityTable<RecentCaptions, 'id'>
}

db.version(1).stores({
    recents: '++id, createdAt, speakerCount, duration, audioUrl, file.name, file.type',
})

export { db }
