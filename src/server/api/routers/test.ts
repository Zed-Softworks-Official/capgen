import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const testRouter = createTRPCRouter({
    hello: publicProcedure.query(() => {
        return 'Hello, world!'
    }),
})
