'use node'

import { v } from 'convex/values'
import { clerkClient } from '@clerk/nextjs/server'

import { action, internalAction } from '../_generated/server'
import { tryCatch } from '~/lib/try-catch'
import { client } from '~/server/deepgram'
import { unkey } from '~/server/unkey'

export const startTranscription = internalAction({
    args: {
        audioUrl: v.string(),
        speakerLabels: v.boolean(),
        speakerCount: v.number(),
        userId: v.string(),
    },
    handler: async (_, args) => {
        const clerk = await clerkClient()
        const user = await clerk.users.getUser(args.userId)

        const keyId = user.privateMetadata.keyId as string | undefined

        if (!keyId) {
            throw new Error('Unauthorized')
        }

        const { data, error } = await tryCatch(
            client.listen.prerecorded.transcribeUrl(
                {
                    url: args.audioUrl,
                },
                {
                    model: 'nova-3',
                    smart_format: true,
                    language: 'en',
                    diarize: args.speakerLabels,
                    paragraphs: true,
                    utterances: true,
                }
            )
        )

        if (error || !data?.result) {
            console.error(data)
            throw new Error('Failed start transcription job')
        }

        await unkey.keys.updateRemaining({
            keyId,
            op: 'decrement',
            value: data.result.metadata.duration,
        })

        return data.result
    },
})

export const reduceApiUsage = action({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error('Unauthorized')
        }

        const clerk = await clerkClient()
        const user = await clerk.users.getUser(identity.subject)

        const keyId = user.privateMetadata.keyId as string | undefined
        if (!keyId) {
            console.error('No Key ID')
            throw new Error('No Key ID')
        }

        console.log(keyId)

        const result = await unkey.keys.updateRemaining({
            keyId,
            op: 'decrement',
            value: 10,
        })

        console.log(result)
    },
})
