import { createClient } from '@deepgram/sdk'
import { env } from '~/env'

export const client = createClient(env.DEEPGRAM_API_KEY)
