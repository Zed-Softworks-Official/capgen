import { z } from 'zod'
import { tryCatch } from '~/lib/try-catch'
import type { Speaker } from '~/lib/types'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { client } from '~/server/assemblyai'

export const transcriptRouter = createTRPCRouter({
    transcribeAudio: protectedProcedure
        .input(
            z.object({
                audioURL: z.string(),
                speakerLabels: z.boolean(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { data, error } = await tryCatch(
                client.transcripts.transcribe({
                    audio: input.audioURL,
                    speaker_labels: input.speakerLabels,
                })
            )

            if (error || !data) {
                return {
                    error: new Error('Failed to transcribe audio'),
                    data: null,
                }
            }

            const speakers = data.utterances?.map(
                (u) =>
                    ({
                        id: u.speaker,
                        name: u.speaker,
                        color: `#${Math.floor(Math.random() * 16777215)
                            .toString(16)
                            .padStart(6, '0')}`,
                        sample: {
                            start: u.start,
                            end: u.end,
                            text: u.text,
                        },
                    }) as Speaker
            )

            return {
                data: {
                    transcript: data,
                    speakers,
                },
                error: null,
            }
        }),

    generateSrt: protectedProcedure
        .input(
            z.object({
                transcriptId: z.string(),
                maxCharsPerCaption: z.number(),
                includedSpeakers: z.array(z.string()),
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

            const srt = await client.transcripts.subtitles(input.transcriptId, 'srt')

            return {
                data: srt,
                error: null,
            }
        }),
})
