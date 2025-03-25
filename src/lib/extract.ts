import { FFmpeg, type FileData } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { err, ok } from 'neverthrow'

import { tryCatch } from './try-catch'
import { editorStore, updateProgress } from './store'
import { uploadFiles } from './uploadthing'

type ExtractionOpts = {
    video: File
    logAction: (message: string) => void
}

export async function extractAudioFromVideo({ video, logAction }: ExtractionOpts) {
    const ffmpeg = new FFmpeg()

    ffmpeg.on('log', ({ message }) => {
        logAction(message)
    })

    const { error: loadError } = await tryCatch(ffmpeg.load())
    if (loadError) {
        return err(new Error('Unable to load file'))
    }

    const { error: writeError } = await tryCatch(
        ffmpeg.writeFile('input.mp4', await fetchFile(video))
    )
    if (writeError) {
        return err(new Error('Failed to write to virtual fs'))
    }

    const { error: execError } = await tryCatch(
        ffmpeg.exec([
            '-i',
            'input.mp4',
            '-map',
            '0:a',
            '-c:a',
            'libmp3lame',
            '-b:a',
            '192k',
            'output.mp3',
        ])
    )
    if (execError) {
        return err(new Error('Failed to transcode video file'))
    }

    const { data: audioData, error: readError } = await tryCatch(
        ffmpeg.readFile('output.mp3')
    )
    if (readError) {
        return err(new Error('Failed to read transcoded file'))
    }

    if (!audioData) {
        return err(new Error('Something seriously went wrong here'))
    }

    return ok({ audioData })
}

export async function uploadAudioFile(audioData: FileData) {
    updateProgress({
        value: 25,
        message: 'Uploading audio file',
    })

    const audioBlob = new Blob([audioData])
    const audioFile = new File([audioBlob], 'input.mp3')

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
    })
}
