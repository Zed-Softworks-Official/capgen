import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    captions: defineTable({
        userId: v.string(),
        jobId: v.string(),
        data: v.object({
            speakers: v.array(
                v.object({
                    id: v.string(),
                    name: v.string(),
                    color: v.string(),
                })
            ),
            transcript: v.record(
                v.string(),
                v.object({
                    text: v.string(),
                    start: v.number(),
                    end: v.number(),
                    speakderId: v.string(),
                })
            ),
        }),
        speakerCount: v.number(),
        duration: v.number(),
        audioUrl: v.string(),
        file: v.object({
            name: v.string(),
            type: v.union(v.literal('video'), v.literal('audio')),
        }),
        createdAt: v.number(),
    }),
})
