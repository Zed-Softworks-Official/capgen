import { getAuth } from '@clerk/nextjs/server'
import { CustomerPortal } from '@polar-sh/nextjs'
import { env } from '~/env'
import { polar } from '~/server/polar'

export const GET = CustomerPortal({
    accessToken: env.POLAR_ACESS_TOKEN,
    server: env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    getCustomerId: async (req) => {
        const auth = getAuth(req)
        if (!auth.userId) {
            throw new Error('Unauthorized')
        }

        const customer = await polar.customers.getExternal({
            externalId: auth.userId,
        })

        return customer.id
    },
})
