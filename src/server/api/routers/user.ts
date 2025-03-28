import { createTRPCRouter, protectedProcedure } from '../trpc'

export const userRouter = createTRPCRouter({
    checkUserSubscription: protectedProcedure.mutation(async ({ ctx }) => {
        return true
    }),
})
