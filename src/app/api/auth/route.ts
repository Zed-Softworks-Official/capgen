import { Webhook } from 'svix'

import { headers } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import {
    clerkClient,
    type WebhookEvent,
    type WebhookEventType,
} from '@clerk/nextjs/server'

import { waitUntil } from '@vercel/functions'

import { env } from '~/env'
import { tryCatch } from '~/lib/try-catch'
import { unkey } from '~/server/unkey'

const allowedEvents = ['user.created'] as WebhookEventType[]

async function processEvent(event: WebhookEvent) {
    if (!allowedEvents.includes(event.type)) return
    if (event.type !== 'user.created') return

    const { id, email_addresses, first_name, last_name, created_at } = event.data

    // Create API KEY
    const apiKey = await unkey.keys.create({
        apiId: env.UNKEY_API_ID,
        externalId: id,
        name: `${first_name} ${last_name}`,
        environment: env.NODE_ENV,
        refill: {
            amount: 1 * 3600,
            interval: 'monthly',
            refillDay: new Date(created_at).getDay(),
        },
        remaining: 1 * 3600,
    })

    if (apiKey.error) {
        console.error('[CLERK_WEBHOOK] Error creating Unkey API Key', apiKey.error)

        return
    }

    // Store the API Key somewhere
    const clerk = await clerkClient()
    await clerk.users.updateUserMetadata(id, {
        privateMetadata: {
            keyId: apiKey.result.keyId,
            unkeyApiKey: apiKey.result.key,
        },
    })
}

export async function POST(req: NextRequest) {
    const headerPayload = await headers()
    const svixId = headerPayload.get('svix-id')
    const svixTimestamp = headerPayload.get('svix-timestamp')
    const svixSignature = headerPayload.get('svix-signature')

    if (!svixId || !svixTimestamp || !svixSignature) {
        return new NextResponse('[CLERK_WEBHOOK] Missing svix headers', {
            status: 400,
        })
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
            'svix-id': svixId,
            'svix-timestamp': svixTimestamp,
            'svix-signature': svixSignature,
        }) as WebhookEvent

        waitUntil(processEvent(event))
    }

    const { error } = await tryCatch(doEventProcessing())

    if (error) {
        console.error('[CLERK_WEBHOOK] Error processing event', error)
    }

    return NextResponse.json({ received: true })
}
