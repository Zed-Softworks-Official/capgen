import { v } from 'convex/values'

import { internalMutation, query } from '../_generated/server'
import { internal } from '../_generated/api'
import { action } from '../_generated/server'

export const transcribeAudio = action({
    args: {
        filename: v.string(),
        audioUrl: v.string(),
        speakerLabels: v.boolean(),
        speakerCount: v.optional(v.number()),
        wordsPerCaption: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error('Unauthorized')
        }

        const jobId = await ctx.runAction(internal.functions.revai.startTranscription, {
            audioUrl: args.audioUrl,
            speakerCount: args.speakerCount ?? 0,
            speakerLabels: args.speakerLabels,
            userId: identity.subject,
        })

        if (!jobId) {
            throw new Error('No Job ID')
        }

        void ctx.runMutation(internal.functions.transcript.setTranscript, {
            jobId,
            filename: args.filename,
            audioUrl: args.audioUrl,
            speakerCount: args.speakerCount ?? 0,
            userId: identity.subject,
        })

        return { received: true }
    },
})

export const setTranscript = internalMutation({
    args: {
        jobId: v.string(),
        filename: v.string(),
        audioUrl: v.string(),
        speakerCount: v.number(),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert('captions', {
            jobId: args.jobId,
            data: {
                speakers: [],
                transcript: {},
            },
            speakerCount: args.speakerCount,
            duration: 0,
            audioUrl: args.audioUrl,
            file: {
                name: args.filename,
                type: 'audio',
            },
            userId: args.userId,
        })
    },
})

export const getRecentTranscripts = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error('Unauthorized')
        }

        const results = await ctx.db
            .query('captions')
            .filter((q) => q.eq(q.field('userId'), identity.subject))
            .filter((q) => {
                const now = new Date()
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

                return q.gte(q.field('_creationTime'), firstDayOfMonth.getTime())
            })
            .order('desc')
            .collect()

        return results
    },
})
