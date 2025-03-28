import { z } from 'zod'
import { tryCatch } from '~/lib/try-catch'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { client } from '~/server/assemblyai'

export const transcriptRouter = createTRPCRouter({
    transcribeAudio: protectedProcedure
        .input(
            z.object({
                audioURL: z.string(),
                speakerLabels: z.boolean().optional(),
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

            return {
                data,
                error: null,
            }
        }),

    generateSrt: protectedProcedure
        .input(
            z.object({
                transcriptId: z.string(),
                maxCharsPerCaption: z.number(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { data, error } = await tryCatch(
                client.transcripts.subtitles(input.transcriptId, 'srt')
            )

            if (error || !data) {
                return {
                    error: new Error('Failed to generate srt'),
                    data: null,
                }
            }

            const srt = await client.transcripts.subtitles(
                input.transcriptId,
                'srt',
                input.maxCharsPerCaption
            )

            return {
                data: srt,
                error: null,
            }
        }),
})
