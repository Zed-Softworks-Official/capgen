import { getAuth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'

const f = createUploadthing()

const auth = (req: NextRequest) => {
    const { userId } = getAuth(req)
    if (!userId) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw new UploadThingError('Unauthorized')
    }

    return { userId }
}

export const capgenFileRouter = {
    audioUploader: f({
        audio: {
            maxFileSize: '2GB',
            maxFileCount: 1,
        },
    })
        .middleware(({ req }) => auth(req))
        .onUploadComplete(async ({ metadata, file }) => {
            return { uploadedBy: metadata.userId }
        }),
} satisfies FileRouter

export type CapGenFileRouter = typeof capgenFileRouter
