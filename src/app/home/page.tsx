import { RedirectToSignIn } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'

import { env } from '~/env'

import { tryCatch } from '~/lib/try-catch'
import type { TrialData } from '~/lib/types'

import { polar } from '~/server/polar'
import { redis } from '~/server/redis'

import Workflow from './workflow'

async function getSubscription(userId: string) {
    'use cache'

    const trialData = await redis.get<TrialData>(`subscription:${userId}`)

    if (trialData?.currentlyInTrial) {
        return 'trial' as const
    }

    const customer = await polar.customers.getExternal({
        externalId: userId,
    })

    if (!customer) {
        console.error('[POLAR] Customer not found', customer)
        throw new Error('Customer not found!')
    }

    const subscriptions = await polar.subscriptions.list({
        customerId: customer.id,
        limit: 1,
        active: true,
        productId: env.POLAR_PRODUCT_ID,
    })

    const subscriptionData = subscriptions.result.items[0]
    if (!subscriptionData) {
        return null
    }

    return subscriptionData
}

export default async function UploadPage() {
    const user = await currentUser()
    if (!user) {
        return <RedirectToSignIn />
    }

    const { data: subscription, error: subscriptionError } = await tryCatch(
        getSubscription(user.id)
    )

    if (subscriptionError) {
        console.error('[POLAR] Error fetching subscription', subscriptionError)
        return notFound()
    }

    if (!subscription) {
        return redirect('/api/subscribe')
    }

    return <Workflow />
}
