import { Unkey } from '@unkey/api'
import { env } from '~/env'

export const unkey = new Unkey({
    rootKey: env.UNKEY_ROOT_KEY,
})
