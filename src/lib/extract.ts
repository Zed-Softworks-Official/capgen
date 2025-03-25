import { FFmpeg, type FileData } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { err, ok } from 'neverthrow'

import { tryCatch } from './try-catch'

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
