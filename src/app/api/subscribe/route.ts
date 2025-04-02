import { Checkout } from '@polar-sh/nextjs'

import { env } from '~/env'

export const GET = Checkout({
    accessToken: env.POLAR_ACESS_TOKEN,
    server: env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    successUrl: 'https://capgen.io/success',
})
