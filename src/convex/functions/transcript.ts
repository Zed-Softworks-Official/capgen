import { v } from 'convex/values'

import { internalMutation, query } from '../_generated/server'
import { internal } from '../_generated/api'
import { action } from '../_generated/server'
import type { Line } from '~/lib/types'

export const transcribeAudio = action({
    args: {
        filename: v.string(),
        filetype: v.union(v.literal('audio'), v.literal('video')),
        audioUrl: v.string(),
        speakerLabels: v.boolean(),
        speakerCount: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error('Unauthorized')
        }

        const data = await ctx.runAction(internal.functions.jobs.startTranscription, {
            audioUrl: args.audioUrl,
            speakerCount: args.speakerCount ?? 0,
            speakerLabels: args.speakerLabels,
            userId: identity.subject,
        })

        if (!data) {
            throw new Error('Failed to start transcription')
        }

        const transcript = data.results.channels.reduce(
            (acc, channel) => {
                return channel.alternatives.reduce((innerAcc, alternative) => {
                    if (!alternative.paragraphs?.paragraphs) return innerAcc

                    return alternative.paragraphs.paragraphs.reduce(
                        (paragraphAcc, paragraph) => {
                            if (!paragraph.sentences) return paragraphAcc

                            const speakerId = paragraph.speaker?.toString() ?? '0'

                            // Initialize the speaker's array if it doesn't exist
                            if (!paragraphAcc[speakerId]) {
                                paragraphAcc[speakerId] = []
                            }

                            // Add each sentence to the speaker's array
                            paragraph.sentences.forEach((sentence) => {
                                paragraphAcc[speakerId]?.push({
                                    text: sentence.text,
                                    start: sentence.start,
                                    end: sentence.end,
                                    speakerId: speakerId,
                                })
                            })

                            return paragraphAcc
                        },
                        innerAcc
                    )
                }, acc)
            },
            {} as Record<string, Line[]>
        )

        const speakers = Object.keys(transcript).map((speakerId) => ({
            id: speakerId,
            name: speakerId,
            color: `#${Math.floor(Math.random() * 16777215)
                .toString(16)
                .padStart(6, '0')}`,
        }))

        await ctx.runMutation(internal.functions.transcript.setTranscript, {
            filename: args.filename,
            filetype: args.filetype,
            audioUrl: args.audioUrl,
            speakerCount: data.metadata.channels,
            userId: identity.subject,
            duration: data.metadata.duration,
            speakers: speakers,
            transcript: transcript,
            requestId: data.metadata.request_id,
        })

        const requestId = data.metadata.request_id as string

        return { received: true, requestId }
    },
})

export const setTranscript = internalMutation({
    args: {
        filename: v.string(),
        filetype: v.union(v.literal('audio'), v.literal('video')),
        audioUrl: v.string(),
        speakerCount: v.number(),
        userId: v.string(),
        duration: v.number(),
        speakers: v.array(
            v.object({
                id: v.string(),
                name: v.string(),
                color: v.string(),
            })
        ),
        transcript: v.record(
            v.string(),
            v.array(
                v.object({
                    text: v.string(),
                    start: v.number(),
                    end: v.number(),
                    speakerId: v.string(),
                })
            )
        ),
        requestId: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert('captions', {
            data: {
                speakers: args.speakers,
                transcript: args.transcript,
            },
            speakerCount: args.speakerCount,
            duration: args.duration,
            audioUrl: args.audioUrl,
            file: {
                name: args.filename,
                type: args.filetype,
            },
            userId: args.userId,
            requestId: args.requestId,
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

export const getTranscriptByRequestId = query({
    args: {
        requestId: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error('Unauthorized')
        }

        return await ctx.db
            .query('captions')
            .filter((q) => q.eq(q.field('requestId'), args.requestId))
            .first()
    },
})
