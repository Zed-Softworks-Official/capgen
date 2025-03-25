import { z } from 'zod'
import { tryCatch } from '~/lib/try-catch'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { client } from '~/server/assemblyai'

export const transcriptRouter = createTRPCRouter({
    transcribeAudio: protectedProcedure
        .input(
            z.object({
                audioURL: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { data, error } = await tryCatch(
                client.transcripts.transcribe({
                    audio: input.audioURL,
                    speaker_labels: true,
                })
            )

            if (error || !data) {
                return {
                    error: new Error('Failed to transcribe audio'),
                    data: null,
                }
            }

            const srt = await client.transcripts.subtitles(data.id, 'srt')

            return {
                data: {
                    transcript: data,
                    srt,
                },
                error: null,
            }
        }),
})
