import { getAuth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { redis } from '~/server/redis'
import { stripe } from '~/server/stripe'

export async function GET(req: NextRequest) {
    const user = getAuth(req)
    if (!user.userId) {
        return redirect('/home')
    }

    const customerId = await redis.get<string>(`stripe:user:${user.userId}`)
    if (!customerId) {
        return redirect('/home')
    }

    const customerPortal = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: 'https://capgen.io/home',
    })

    return redirect(customerPortal.url)
}
