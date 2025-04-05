import { withUnkey } from '@unkey/nextjs'
import { NextResponse } from 'next/server'

export const POST = withUnkey(async (req) => {
    if (!req.unkey?.valid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Process request

    return NextResponse.json({ received: true })
})
