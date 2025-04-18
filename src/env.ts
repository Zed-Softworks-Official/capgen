import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
    /**
     * Specify your server-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars.
     */
    server: {
        NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

        CLERK_SECRET_KEY: z.string(),
        CLERK_WEBHOOK_SECRET: z.string(),
        CLERK_DOMAIN: z.string(),

        UNKEY_ROOT_KEY: z.string(),
        UNKEY_API_ID: z.string(),

        UPLOADTHING_TOKEN: z.string(),

        STRIPE_SECRET_KEY: z.string(),
        STRIPE_PRICE_ID: z.string(),
        STRIPE_WEBHOOK_SECRET: z.string(),

        UPSTASH_REDIS_REST_URL: z.string(),
        UPSTASH_REDIS_REST_TOKEN: z.string(),

        DEEPGRAM_API_KEY: z.string(),

        CONVEX_DEPLOYMENT: z.string().optional(),
    },

    /**
     * Specify your client-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars. To expose them to the client, prefix them with
     * `NEXT_PUBLIC_`.
     */
    client: {
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
        NEXT_PUBLIC_CONVEX_URL: z.string(),
    },

    /**
     * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
     * middlewares) or client-side so we need to destruct manually.
     */
    runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,

        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
        CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
        CLERK_DOMAIN: process.env.CLERK_DOMAIN,
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,

        UNKEY_ROOT_KEY: process.env.UNKEY_ROOT_KEY,
        UNKEY_API_ID: process.env.UNKEY_API_ID,

        UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,

        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,

        CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
        NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,

        DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY,
    },
    /**
     * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
     * useful for Docker builds.
     */
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    /**
     * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
     * `SOME_VAR=''` will throw an error.
     */
    emptyStringAsUndefined: true,
})
