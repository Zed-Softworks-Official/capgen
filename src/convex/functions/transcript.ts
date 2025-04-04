import { v } from 'convex/values'

import { mutation } from '~/convex/_generated/server'
import { tryCatch } from '~/lib/try-catch'
import { client } from '~/server/assemblyai'

export const transcribeAudio = mutation({
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

        const { data, error } = await tryCatch(
            client.transcripts.submit({
                audio: args.audioUrl,
                speaker_labels: args.speakerLabels,
                speakers_expected: args.speakerCount,
            })
        )

        if (error || !data?.id) {
            throw new Error('Failed start transcription job')
        }

        await ctx.db.insert('captions', {
            jobId: data.id,
            data: {
                speakers: [],
                transcript: {},
            },
            speakerCount: args.speakerCount ?? 0,
            duration: 0,
            audioUrl: args.audioUrl,
            file: {
                name: args.filename,
                type: 'audio',
            },
            createdAt: Date.now(),
            userId: identity.subject,
        })

        return { received: true }
    },
})
