'use node'

import { v } from 'convex/values'
import { clerkClient } from '@clerk/nextjs/server'
import { verifyKey } from '@unkey/api'

import { internalAction } from '../_generated/server'
import { tryCatch } from '~/lib/try-catch'
import { client } from '~/server/deepgram'

import { unkey } from '~/server/unkey'

import { env } from '~/env'

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
        const apiKey = user.privateMetadata.unkeyApiKey as string | undefined

        if (!apiKey) {
            throw new Error('No API Key has been set!')
        }

        const { result, error: verifyError } = await verifyKey({
            apiId: env.UNKEY_API_ID,
            key: apiKey,
            remaining: {
                cost: 0,
            },
        })

        if (verifyError) {
            console.error(verifyError)
            throw new Error('Invalid API Key')
        }

        if (!result.valid) {
            console.error(result)
            throw new Error('Unauthorized request')
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
                    punctuate: false,
                }
            )
        )

        if (error || !data?.result) {
            console.error(data)
            throw new Error('Failed start transcription job')
        }

        await unkey.keys.updateRemaining({
            keyId: user.privateMetadata.keyId as string,
            op: 'decrement',
            value: Math.floor(data.result.metadata.duration),
        })

        return data.result
    },
})
