import { action } from '~/convex/_generated/server'

import type { TrialData } from '~/lib/types'

import { env } from '~/env'
import { polar } from '~/server/polar'

export const checkUserSubscription = action({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error('Unauthorized')
        }

        const userId = identity.subject

        const customer = await polar.customers.getExternal({
            externalId: userId,
        })

        const metadata = customer.metadata as TrialData
        if (
            metadata.currentlyInTrial &&
            metadata.trialEndsAt > Math.floor(Date.now() / 1000)
        ) {
            return {
                value: true,
                message: null,
            }
        } else if (
            metadata.currentlyInTrial &&
            metadata.trialEndsAt < Math.floor(Date.now() / 1000)
        ) {
            return {
                value: false,
                message: 'Your trial has expired',
            }
        }

        const subscription = await polar.subscriptions.list({
            customerId: customer.id,
            active: true,
            productId: env.POLAR_PRODUCT_ID,
        })

        if (subscription.result.items.length > 0) {
            return {
                value: true,
                message: null,
            }
        }

        return {
            value: false,
            message: 'You are not subscribed to the service',
        }
    },
})
