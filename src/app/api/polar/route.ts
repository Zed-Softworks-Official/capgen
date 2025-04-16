import { clerkClient } from '@clerk/nextjs/server'
import { Webhooks } from '@polar-sh/nextjs'

import { env } from '~/env'
import { redis } from '~/server/redis'
import { unkey } from '~/server/unkey'

export const POST = Webhooks({
    webhookSecret: env.POLAR_WEBHOOK_SECRET,
    onSubscriptionCreated: async ({ data }) => {
        if (!data.customer.externalId) return

        const clerk = await clerkClient()
        const user = await clerk.users.getUser(data.customer.externalId)

        await redis.del(`subscription:${user.id}`)

        await unkey.keys.update({
            keyId: user.privateMetadata.keyId as string,
            refill: {
                amount: 10 * 3600,
                interval: 'monthly',
                refillDay: new Date().getDate(),
            },
            remaining: 10 * 3600,
        })
    },
    onSubscriptionUpdated: async ({ data }) => {
        if (!data.customer.externalId) return
        const clerk = await clerkClient()
        const user = await clerk.users.getUser(data.customer.externalId)

        switch (data.status) {
            case 'active':
                {
                    await unkey.keys.update({
                        keyId: user.privateMetadata.keyId as string,
                        refill: {
                            amount: 10 * 3600,
                            interval: 'monthly',
                        },
                        remaining: 10 * 3600,
                    })
                }
                break
            default:
                {
                    await unkey.keys.update({
                        keyId: user.privateMetadata.keyId as string,
                        refill: {
                            amount: 3600,
                            interval: 'monthly',
                        },
                        remaining: 3600,
                    })
                }
                break
        }
    },
})
