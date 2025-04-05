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
                speaker_channels_count: args.speakerCount,
                notification_config: {
                    url: 'https://capgen.io/api/transcript',
                    auth_headers: {
                        Authorization: `Bearer ${unkeyApiKey}`,
                    },
                },
            })
        )

        if (error || !data?.id) {
            throw new Error('Failed start transcription job')
        }

        return data.id
    },
})
