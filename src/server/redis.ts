import { Redis } from '@upstash/redis'
import { env } from '~/env'
import type { RedisBaseKey } from '~/lib/types'

export const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
})

export const getRedisKey = (key: RedisBaseKey, ...args: string[]) => {
    return [key, ...args].join(':')
}
