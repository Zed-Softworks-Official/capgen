'use client'

import { Loader2 } from 'lucide-react'
import { useStore } from '@tanstack/react-form'

import { workflowStore } from '~/lib/store'
import { Progress } from '../_components/ui/progress'
import { useProcessFile } from '~/hooks/use-process-file'
import { api } from '~/convex/_generated/api'
import { useAction } from 'convex/react'

export function Processing() {
    const { progress, file } = useStore(workflowStore)
    const transcribeAudio = useAction(api.functions.transcript.transcribeAudio)

    useProcessFile(file?.uploadedData, transcribeAudio)

    return (
        <main className="flex flex-1 items-center justify-center p-10">
            <div className="w-full max-w-md">
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="mb-2 text-2xl font-bold">Processing Your Audio</h2>
                        <p className="text-muted-foreground">
                            Please wait while we generate your captions
                        </p>
                    </div>

                    <div className="mb-6 flex items-center justify-center">
                        <div className="relative">
                            <div className="absolute -inset-3 animate-pulse rounded-full bg-gradient-to-r from-purple-600 to-violet-600 opacity-30 blur"></div>
                            <Loader2 className="text-primary relative size-12 animate-spin" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Progress value={progress.value} className="w-full" />
                        <span className="w-full">{progress.message}</span>
                    </div>

                    <p className="text-muted-foreground mt-6 text-center text-sm">
                        This may take a few minutes depending on the length of your audio
                        file
                    </p>
                </div>
            </div>
        </main>
    )
}
