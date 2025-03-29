import { Webhook } from 'svix'

import { headers } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import type { WebhookEvent, WebhookEventType } from '@clerk/nextjs/server'

import { waitUntil } from '@vercel/functions'

import { env } from '~/env'
import { tryCatch } from '~/lib/try-catch'
import { getRedisKey, redis } from '~/server/redis'
import type { TrialData } from '~/lib/types'
import { polar } from '~/server/polar'

const allowedEvents = ['user.created'] as WebhookEventType[]

async function processEvent(event: WebhookEvent) {
    if (!allowedEvents.includes(event.type)) return
    if (event.type !== 'user.created') return

    const { id, email_addresses, first_name, last_name } = event.data

    await polar.customers.create({
        name: `${first_name} ${last_name}`,
        email: email_addresses[0]?.email_address ?? '',
        externalId: id,
        metadata: {
            currentlyInTrial: true,
            trialStartedAt: Date.now() / 1000,
            trialEndsAt: Date.now() / 1000 + 7 * 24 * 60 * 60,
        } as TrialData,
    })
}

export async function POST(req: NextRequest) {
    const headerPayload = await headers()
    const svixId = headerPayload.get('svix-id')
    const svixTimestamp = headerPayload.get('svix-timestamp')
    const svixSignature = headerPayload.get('svix-signature')

    if (!svixId || !svixTimestamp || !svixSignature) {
        return new NextResponse('Missing svix headers', { status: 400 })
    }

    const payload = (await req.json()) as unknown
    const body = JSON.stringify(payload)

    async function doEventProcessing() {
        if (
            typeof svixId !== 'string' ||
            typeof svixTimestamp !== 'string' ||
            typeof svixSignature !== 'string'
        ) {
            return new NextResponse('[CLERK_WEBHOOK] Invalid svix headers', {
                status: 400,
            })
        }

        const wh = new Webhook(env.CLERK_WEBHOOK_SECRET)
        const event = wh.verify(body, {
            id: svixId,
            timestamp: svixTimestamp,
            signature: svixSignature,
        }) as WebhookEvent

        waitUntil(processEvent(event))
    }

    const { error } = await tryCatch(doEventProcessing())

    if (error) {
        console.error('[CLERK_WEBHOOK] Error processing event', error)
    }

    return NextResponse.json({ received: true })
}
