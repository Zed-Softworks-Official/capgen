import { Polar } from '@polar-sh/sdk'
import { env } from '~/env'

export const polar = new Polar({
    server: env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    accessToken: env.POLAR_ACESS_TOKEN,
})
