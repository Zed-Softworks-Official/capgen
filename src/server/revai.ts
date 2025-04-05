import { RevAiApiClient } from 'revai-node-sdk'
import { env } from '~/env'

export const client = new RevAiApiClient({
    token: env.REV_AI_API_KEY,
})
