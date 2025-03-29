import { getAuth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { env } from '~/env'
import { polar } from '~/server/polar'

export async function GET(req: NextRequest) {
    const auth = getAuth(req)
    if (!auth.userId) {
        return redirect('/')
    }

    const customer = await polar.customers.getExternal({
        externalId: auth.userId,
    })

    const subscription = await polar.subscriptions.list({
        customerId: customer.id,
        active: true,
        productId: env.POLAR_PRODUCT_ID,
    })

    if (subscription.result.items.length > 0) {
        return redirect('/')
    }

    const checkout = await polar.checkouts.create({
        productId: env.POLAR_PRODUCT_ID,
        customerId: customer.id,
        customerExternalId: auth.userId,
    })

    return redirect(checkout.url)
}
