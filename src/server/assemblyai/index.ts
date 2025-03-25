import { AssemblyAI } from 'assemblyai'
import { env } from '~/env'

export const client = new AssemblyAI({
    apiKey: env.ASSEMBLYAI_API_KEY,
})
