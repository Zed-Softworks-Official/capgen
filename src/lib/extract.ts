import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

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
        return { error: loadError }
    }

    const { error: writeError } = await tryCatch(
        ffmpeg.writeFile('input.mp4', await fetchFile(video))
    )
    if (writeError) {
        return { error: writeError }
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
        return { error: execError }
    }

    const { data: audioData, error: readError } = await tryCatch(
        ffmpeg.readFile('output.mp3')
    )
    if (readError) {
        return { error: readError }
    }

    return { audioData }
}
