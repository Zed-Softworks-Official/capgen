'use node'

import { v } from 'convex/values'
import { clerkClient } from '@clerk/nextjs/server'

import { internalAction } from '../_generated/server'
import { tryCatch } from '~/lib/try-catch'
import { client } from '~/server/deepgram'

import { verifyKey } from '@unkey/api'
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
        })

        if (verifyError) {
            throw new Error('Invalid API Key')
        }

        if (!result.valid) {
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
                }
            )
        )

        if (error || !data?.result) {
            console.error(data)
            throw new Error('Failed start transcription job')
        }

        return data.result
    },
})
