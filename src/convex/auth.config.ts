import { env } from '~/env'

export default {
    providers: [
        {
            domain: env.CLERK_DOMAIN,
            applicationID: 'convex',
        },
    ],
}
