import { clerkClient, getAuth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { env } from '~/env'
import { tryCatch } from '~/lib/try-catch'
import { polar } from '~/server/polar'

export async function GET(req: NextRequest) {
    const auth = getAuth(req)
    if (!auth.userId) {
        return redirect('/')
    }

    const clerk = await clerkClient()
    const user = await clerk.users.getUser(auth.userId)
    let { data: customer, error: customerError } = await tryCatch(
        polar.customers.getExternal({
            externalId: auth.userId,
        })
    )

    if (customerError) {
        console.error(customerError)
    }

    // if (customer) {
    //     const subscription = await polar.subscriptions.list({
    //         customerId: customer.id,
    //         active: true,
    //         productId: env.POLAR_PRODUCT_ID,
    //     })

    //     if (subscription.result.items.length > 0) {
    //         return redirect('/')
    //     }
    // }

    if (!customer) {
        const newCustomerData = await polar.customers.create({
            name: user.fullName as string,
            email: user.emailAddresses[0]?.emailAddress as string,
            externalId: auth.userId,
        })

        customer = newCustomerData
    }

    const checkout = await polar.checkouts.create({
        productId: env.POLAR_PRODUCT_ID,
        customerId: customer.id,
        customerExternalId: auth.userId,
    })

    return redirect(checkout.url)
}
