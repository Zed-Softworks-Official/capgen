import { clerkClient } from '@clerk/nextjs/server'
import { Webhooks } from '@polar-sh/nextjs'

import { env } from '~/env'
import { polar } from '~/server/polar'

export const POST = Webhooks({
    webhookSecret: env.POLAR_WEBHOOK_SECRET,
    onSubscriptionCreated: async ({ data }) => {
        if (!data.customer.externalId) return

        const clerk = await clerkClient()
        await clerk.users.updateUserMetadata(data.customer.externalId, {
            publicMetadata: {
                timeLimit: 10 * 3600,
            },
        })

        await polar.customers.update({
            id: data.customerId,
            customerUpdate: {
                metadata: {
                    currentlyInTrial: false,
                },
            },
        })
    },
    onSubscriptionUpdated: async ({ data }) => {
        if (!data.customer.externalId) return
        const clerk = await clerkClient()

        switch (data.status) {
            case 'active': {
                await clerk.users.updateUserMetadata(data.customer.externalId, {
                    publicMetadata: {
                        timeLimit: 10 * 3600,
                    },
                })
                break
            }
            default: {
                await clerk.users.updateUserMetadata(data.customer.externalId, {
                    publicMetadata: {
                        timeLimit: 3600,
                    },
                })
                break
            }
        }
    },
})
