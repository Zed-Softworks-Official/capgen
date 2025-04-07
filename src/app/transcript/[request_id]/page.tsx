import { preloadQuery } from 'convex/nextjs'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '~/app/_components/ui/button'
import { api } from '~/convex/_generated/api'

import { getAuthToken } from '~/lib/auth'
import { TranscriptDisplay } from './display'

export default async function TranscriptPage({
    params,
}: {
    params: Promise<{ request_id: string }>
}) {
    const { request_id } = await params
    const token = await getAuthToken()

    const transcript = await preloadQuery(
        api.functions.transcript.getTranscriptByRequestId,
        {
            requestId: request_id,
        },
        {
            token,
        }
    )

    return (
        <main className="flex-1">
            <div className="container mx-auto px-4 py-10">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center">
                        <Button
                            variant={'ghost'}
                            size={'icon'}
                            className="mr-2 cursor-pointer"
                            asChild
                        >
                            <Link href={'/home'} prefetch={true}>
                                <ArrowLeft className="size-5" />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold">Caption Settings</h2>
                            <p className="text-muted-foreground">
                                Choose which speakers to include in your cpations
                            </p>
                        </div>
                    </div>
                </div>

                <TranscriptDisplay preloadedQuery={transcript} />
            </div>
        </main>
    )
}
