import type Stripe from 'stripe'
import { waitUntil } from '@vercel/functions'
import { NextResponse, type NextRequest } from 'next/server'

import { env } from '~/env'
import { tryCatch } from '~/lib/try-catch'
import { stripe } from '~/server/stripe'
import { syncStripeToRedis } from '~/lib/sync'

const allowedEvents: Stripe.Event.Type[] = [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'customer.subscription.paused',
    'customer.subscription.resumed',
    'customer.subscription.pending_update_applied',
    'customer.subscription.pending_update_expired',
    'customer.subscription.trial_will_end',
    'invoice.paid',
    'invoice.payment_failed',
    'invoice.payment_action_required',
    'invoice.upcoming',
    'invoice.marked_uncollectible',
    'invoice.payment_succeeded',
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'payment_intent.canceled',
]

async function processEvent(event: Stripe.Event) {
    if (!allowedEvents.includes(event.type)) return
    const { customer: customerId } = event.data.object as {
        customer: string
    }

    if (typeof customerId !== 'string') {
        throw new Error('[STRIPE HOOK] Customer ID is not a string')
    }

    return await syncStripeToRedis(customerId)
}

export async function POST(req: NextRequest) {
    const body = (await req.json()) as string
    const signature = req.headers.get('stripe-signature')

    async function doEventProcessing() {
        if (typeof signature !== 'string') {
            throw new Error('[STRIPE HOOK] No signature found')
        }

        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            env.STRIPE_WEBHOOK_SECRET
        )
        waitUntil(processEvent(event))
    }

    const { error } = await tryCatch(doEventProcessing())
    if (error) {
        console.error('[STRIPE HOOK] Error processing event', error)
    }

    return NextResponse.json({ received: true })
}
