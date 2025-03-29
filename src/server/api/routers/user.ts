import { polar } from '~/server/polar'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

import type { TrialData } from '~/lib/types'
import { env } from '~/env'

export const userRouter = createTRPCRouter({
    checkUserSubscription: protectedProcedure.mutation(async ({ ctx }) => {
        const customer = await polar.customers.getExternal({
            externalId: ctx.auth.userId,
        })

        const metadata = customer.metadata as TrialData
        if (metadata.currentlyInTrial && metadata.trialEndsAt > Date.now() / 1000) {
            return {
                value: true,
                message: null,
            }
        } else if (
            metadata.currentlyInTrial &&
            metadata.trialEndsAt < Date.now() / 1000
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
    }),
})
