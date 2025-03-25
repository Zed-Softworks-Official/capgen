'use client'

import { useStore } from '@tanstack/react-store'
import { toast } from 'sonner'
import { DownloadIcon } from 'lucide-react'

import { Button } from '~/app/_components/ui/button'
import { workflowStore } from '~/lib/store'

export function Download() {
    const { transcript } = useStore(workflowStore)

    if (!transcript) {
        toast.error('No transcript found')
        return null
    }

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Transcript</h2>
            <Button
                variant={'outline'}
                onClick={() => {
                    const a = document.createElement('a')
                    const blob = new Blob([transcript.srt], { type: 'text/srt' })
                    const url = URL.createObjectURL(blob)
                    a.href = url
                    a.download = 'transcript.srt'
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                }}
            >
                <DownloadIcon className="size-4" />
                Download SRT
            </Button>
        </div>
    )
}
