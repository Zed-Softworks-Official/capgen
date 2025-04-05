// import { clerkClient } from '@clerk/nextjs/server'
// import { z } from 'zod'
// import { tryCatch } from '~/lib/try-catch'
// import type { Captions, Line, Speaker } from '~/lib/types'
// import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
// import { client } from '~/server/assemblyai'

// export const transcriptRouter = createTRPCRouter({
//     transcribeAudio: protectedProcedure
//         .input(
//             z.object({
//                 filename: z.string(),
//                 audioURL: z.string(),
//                 speakerLabels: z.boolean(),
//                 speakerCount: z.number().optional(),
//                 wordsPerCaption: z.number().optional(),
//             })
//         )
//         .mutation(async ({ ctx, input }) => {
//             const { data, error } = await tryCatch(
//                 client.transcripts.transcribe({
//                     audio: input.audioURL,
//                     speaker_labels: input.speakerLabels,
//                     speakers_expected: input.speakerCount,
//                 })
//             )

//             if (error || !data?.utterances) {
//                 return {
//                     error: new Error('Failed to transcribe audio'),
//                     data: null,
//                 }
//             }

//             const captions: Captions = {
//                 speakers: data.utterances.reduce((acc, curr) => {
//                     if (!acc.find((s) => s.id === curr.speaker)) {
//                         acc.push({
//                             id: curr.speaker,
//                             name: curr.speaker,
//                             color: `#${Math.floor(Math.random() * 16777215)
//                                 .toString(16)
//                                 .padStart(6, '0')}`,
//                         })
//                     }
//                     return acc
//                 }, [] as Speaker[]),
//                 transcript: data.utterances.reduce(
//                     (acc, curr) => {
//                         if (!acc[curr.speaker]) {
//                             acc[curr.speaker] = []
//                         }

//                         const words = curr.text.split(/\s+/)
//                         const wordsPerCaption = input.wordsPerCaption ?? words.length

//                         // Split text into chunks based on wordsPerCaption
//                         for (let i = 0; i < words.length; i += wordsPerCaption) {
//                             const chunk = words.slice(i, i + wordsPerCaption).join(' ')
//                             const chunkDuration = curr.end - curr.start

//                             // Calculate proportional start and end times for the chunk
//                             const chunkStart =
//                                 i === 0
//                                     ? curr.start
//                                     : curr.start + chunkDuration * (i / words.length)
//                             const chunkEnd =
//                                 i + wordsPerCaption >= words.length
//                                     ? curr.end
//                                     : curr.start +
//                                       chunkDuration *
//                                           ((i + wordsPerCaption) / words.length)

//                             acc[curr.speaker]?.push({
//                                 text: chunk,
//                                 start: chunkStart,
//                                 end: chunkEnd,
//                                 speakerId: curr.speaker,
//                             })
//                         }

//                         return acc
//                     },
//                     {} as Record<string, Line[]>
//                 ),
//                 duration: data.audio_duration,
//             }

//             const clerk = await clerkClient()
//             const user = await clerk.users.getUser(ctx.auth.userId)
//             await clerk.users.updateUserMetadata(ctx.auth.userId, {
//                 publicMetadata: {
//                     timeUsed:
//                         (user.publicMetadata.timeUsed as number) +
//                         (captions.duration ?? 0),
//                     recentFiles: [
//                         ...(user.publicMetadata.recentFiles as {
//                             filename: string
//                             duration: number
//                             createdAt: number
//                         }[]),
//                         {
//                             filename: input.filename,
//                             duration: captions.duration ?? 0,
//                             createdAt: Date.now(),
//                         },
//                     ],
//                 },
//             })

//             return {
//                 data: captions,
//                 error: null,
//             }
//         }),

//     generateSrt: protectedProcedure
//         .input(
//             z.object({
//                 transcriptId: z.string(),
//                 includedSpeakers: z.array(z.string()),
//             })
//         )
//         .mutation(async ({ input }) => {
//             const { data, error } = await tryCatch(
//                 client.transcripts.subtitles(input.transcriptId, 'srt')
//             )

//             if (error || !data) {
//                 return {
//                     error: new Error('Failed to generate srt'),
//                     data: null,
//                 }
//             }

//             return {
//                 data,
//                 error: null,
//             }
//         }),
// })
