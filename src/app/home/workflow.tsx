'use client'

import { useStore } from '@tanstack/react-store'
import { useConvexAuth } from 'convex/react'

import { workflowStore } from '~/lib/store'

import { Skeleton } from '~/app/_components/ui/skeleton'

import { Dropzone } from './dropzone'
import { Processing } from './processing'
import { redirect } from 'next/navigation'
import { Recents } from './recents'

export default function Workflow() {
    const { isAuthenticated, isLoading } = useConvexAuth()

    if (!isAuthenticated || isLoading) {
        return (
            <main className="flex-1">
                <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-purple-900/10 to-violet-900/10"></div>
                <div className="container mx-auto px-4 py-10">
                    <div className="mb-10 flex flex-col items-center justify-center">
                        <h1 className="mb-4 bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-center text-3xl font-bold text-transparent">
                            Upload Your Audio Or Video
                        </h1>
                        <p className="text-muted-foreground mb-8 max-w-md text-center">
                            Drag and drop your file to generate accurate cpations with AI
                        </p>
                    </div>

                    <div className="space-y-10">
                        <Skeleton className="mx-auto h-96 w-full max-w-2xl" />

                        <Skeleton className="mx-auto h-96 w-full max-w-2xl" />
                    </div>
                </div>
            </main>
        )
    }

    return <AuthenticatedWorkflow />
}

function AuthenticatedWorkflow() {
    const { currentState, requestId } = useStore(workflowStore)

    if (currentState === 'choose-file') {
        return (
            <main className="flex-1">
                <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-purple-900/10 to-violet-900/10"></div>
                <div className="container mx-auto px-4 py-10">
                    <div className="mb-10 flex flex-col items-center justify-center">
                        <h1 className="mb-4 bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-center text-3xl font-bold text-transparent">
                            Upload Your Audio Or Video
                        </h1>
                        <p className="text-muted-foreground mb-8 max-w-md text-center">
                            Drag and drop your file to generate accurate cpations with AI
                        </p>
                    </div>

                    <div className="space-y-10">
                        <Dropzone />

                        <div className="mx-auto max-w-2xl">
                            <Recents />
                        </div>
                    </div>
                </div>
            </main>
        )
    }

    if (currentState === 'processing') {
        return <Processing />
    }

    if (currentState === 'finished') {
        return redirect(`/transcript/${requestId}`)
    }

    return <>Not Implemented</>
}
