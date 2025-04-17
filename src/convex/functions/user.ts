import { action } from '~/convex/_generated/server'

import type { StripeSubData } from '~/lib/types'
import { redis } from '~/server/redis'

export const checkUserSubscription = action({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error('Unauthorized')
        }

        const userId = identity.subject
        const customerId = await redis.get<string>(`stripe:user:${userId}`)
        const subData = await redis.get<StripeSubData>(`stripe:customer:${customerId}`)

        if (subData?.status === 'none') {
            return {
                value: false,
                message: 'You are not subscribed to the service',
            }
        }

        return {
            value: true,
            message: null,
        }
    },
})
