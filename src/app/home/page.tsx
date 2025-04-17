import { RedirectToSignIn } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { redis } from '~/server/redis'

import Workflow from './workflow'
import type { StripeSubData } from '~/lib/types'

export default async function UploadPage() {
    const user = await currentUser()
    if (!user) {
        return <RedirectToSignIn />
    }

    const customerId = await redis.get<string>(`stripe:user:${user.id}`)
    const subData = await redis.get<StripeSubData>(`stripe:customer:${customerId}`)

    if (subData?.status === 'none') {
        return redirect('/subscribe')
    }

    return <Workflow />
}
