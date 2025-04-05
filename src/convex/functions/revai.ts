'use node'

import { v } from 'convex/values'
import { clerkClient } from '@clerk/nextjs/server'

import { internalAction } from '../_generated/server'
import { client } from '~/server/revai'
import { tryCatch } from '~/lib/try-catch'

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
        const unkeyApiKey = user.privateMetadata.unkeyApiKey as string | undefined

        if (!unkeyApiKey) {
            throw new Error('Unauthorized')
        }

        const { data, error } = await tryCatch(
            client.submitJob({
                source_config: {
                    url: args.audioUrl,
                },
                skip_diarization: !args.speakerLabels,
                notification_config: {
                    url: 'https://9fc3-76-167-149-110.ngrok-free.app',
                    auth_headers: {
                        Authorization: `Bearer ${unkeyApiKey}`,
                    },
                },
            })
        )

        if (error || !data?.id) {
            console.error(error)
        }

        return data?.id
    },
})
