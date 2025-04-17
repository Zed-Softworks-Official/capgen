import { redis } from '~/server/redis'
import { stripe } from '~/server/stripe'

import type { StripeSubData } from './types'
import { unkey } from '~/server/unkey'
import { clerkClient } from '@clerk/nextjs/server'

export async function syncStripeToRedis(customerId: string) {
    const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 1,
        status: 'active',
        expand: ['data.default_payment_method'],
    })

    if (!subscriptions.data[0]) {
        const subData = { status: 'none' } as const
        await redis.set<StripeSubData>(`stripe:customer:${customerId}`, subData)
        await syncStripeToUnkey(customerId, subData)
        return subData
    }

    const subscription = subscriptions.data[0]
    const subData = {
        subscriptionId: subscription.id,
        status: subscription.status,
        priceId: subscription.items.data[0]?.price.id,
        currentPeriodStart: subscription.items.data[0]?.current_period_start,
        currentPeriodEnd: subscription.items.data[0]?.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        paymentMethod:
            subscription.default_payment_method &&
            typeof subscription.default_payment_method !== 'string'
                ? {
                      brand: subscription.default_payment_method.card?.brand ?? null,
                      last4: subscription.default_payment_method.card?.last4 ?? null,
                  }
                : null,
    } satisfies StripeSubData

    await redis.set<StripeSubData>(`stripe:customer:${customerId}`, subData)
    await syncStripeToUnkey(customerId, subData)
    return subData
}

async function syncStripeToUnkey(customerId: string, subData: StripeSubData) {
    const customer = await stripe.customers.retrieve(customerId)
    const clerk = await clerkClient()

    if (customer.deleted || typeof customer.metadata.clerkId !== 'string') return
    const user = await clerk.users.getUser(customer.metadata.clerkId)
    if (typeof user.privateMetadata.keyId !== 'string') return

    const currentKeyStatus = await unkey.keys.get({
        keyId: user.privateMetadata.keyId,
    })
    if (currentKeyStatus.error) return

    let amount = subData.status === 'trialing' ? 3600 : 3600 * 10
    let remaining = currentKeyStatus.result.remaining
    if (subData.status === 'none') {
        amount = 0
        remaining = 0
    }

    await unkey.keys.update({
        keyId: user.privateMetadata.keyId,
        refill: {
            amount,
            interval: 'monthly',
        },
        remaining,
    })
}
