import type { FileData } from '@ffmpeg/ffmpeg'
import { err, ok } from 'neverthrow'
import { generateReactHelpers, generateUploadDropzone } from '@uploadthing/react'

import type { CapGenFileRouter } from '~/app/api/uploadthing/core'
import { tryCatch } from './try-catch'

const { uploadFiles } = generateReactHelpers<CapGenFileRouter>()

export const UploadDropzone = generateUploadDropzone<CapGenFileRouter>()

export async function uploadAudioFile(audioData: FileData | File) {
    let audioFile: File
    if (audioData instanceof File) {
        audioFile = audioData
    } else {
        const audioBlob = new Blob([audioData])
        audioFile = new File([audioBlob], 'input.mp3')
    }

    const { data: res, error: uploadError } = await tryCatch(
        uploadFiles('audioUploader', {
            files: [audioFile],
        })
    )
    if (uploadError) {
        return err(new Error('Error uploading file'))
    }

    const uploadedData = res?.at(0)
    if (!uploadedData) {
        return err(new Error('Error uploading file'))
    }

    return ok({
        url: uploadedData.ufsUrl,
        filename: uploadedData.name,
        size: uploadedData.size,
        file: audioFile,
    })
}
