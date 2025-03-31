import { z } from 'zod'
import { tryCatch } from '~/lib/try-catch'
import type { Captions, Line, Speaker } from '~/lib/types'
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

            const captions: Captions = {
                speakers: data.utterances!.reduce((acc, curr) => {
                    if (!acc.find((s) => s.id === curr.speaker)) {
                        acc.push({
                            id: curr.speaker,
                            name: curr.speaker,
                            color: `#${Math.floor(Math.random() * 16777215)
                                .toString(16)
                                .padStart(6, '0')}`,
                        })
                    }
                    return acc
                }, [] as Speaker[]),
                transcript: data.utterances!.reduce(
                    (acc, curr) => {
                        if (!acc[curr.speaker]) {
                            acc[curr.speaker] = []
                        }

                        acc[curr.speaker]!.push({
                            text: curr.text,
                            start: curr.start,
                            end: curr.end,
                            speakerId: curr.speaker,
                        })
                        return acc
                    },
                    {} as Record<string, Line[]>
                ),
                duration: data.audio_duration,
            }

            return {
                data: captions,
                error: null,
            }
        }),

    generateSrt: protectedProcedure
        .input(
            z.object({
                transcriptId: z.string(),
                includedSpeakers: z.array(z.string()),
            })
        )
        .mutation(async ({ input }) => {
            const { data, error } = await tryCatch(
                client.transcripts.subtitles(input.transcriptId, 'srt')
            )

            if (error || !data) {
                return {
                    error: new Error('Failed to generate srt'),
                    data: null,
                }
            }

            return {
                data,
                error: null,
            }
        }),
})
