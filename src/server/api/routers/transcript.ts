import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const transcriptRouter = createTRPCRouter({
    getTranscript: protectedProcedure
        .input(
            z.object({
                audioURL: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            console.log(input)
        }),
})
