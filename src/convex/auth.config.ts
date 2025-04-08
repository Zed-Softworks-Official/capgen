import { env } from '~/env'

const config = {
    providers: [
        {
            domain: env.CLERK_DOMAIN,
            applicationID: 'convex',
        },
    ],
}

export default config
