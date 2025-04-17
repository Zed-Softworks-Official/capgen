import { clerkClient, getAuth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { type NextRequest, NextResponse } from 'next/server'
import { env } from '~/env'
import { redis } from '~/server/redis'

import { stripe } from '~/server/stripe'

export async function GET(req: NextRequest) {
    const user = getAuth(req)
    if (!user.userId) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    let stripeCustomerId: string | null = await redis.get(`stripe:user:${user.userId}`)
    if (!stripeCustomerId) {
        const clerk = await clerkClient()
        const userData = await clerk.users.getUser(user.userId)

        const newCustomer = await stripe.customers.create({
            email: userData.emailAddresses[0]?.emailAddress,
            name: `${userData.firstName} ${userData.lastName}`,
            metadata: {
                clerkId: user.userId,
            },
        })

        await redis.set(`stripe:user:${user.userId}`, newCustomer.id)
        stripeCustomerId = newCustomer.id
    }

    const checkout = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: 'subscription',
        success_url: 'https://capgen.io/success',
        return_url: 'https://capgen.io/home',
        line_items: [
            {
                price: env.STRIPE_PRICE_ID,
                quantity: 1,
            },
        ],
        subscription_data: {
            trial_period_days: 7,
        },
    })

    if (!checkout.url) return new NextResponse('Internal Error', { status: 500 })
    return redirect(checkout.url)
}
