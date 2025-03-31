'use client'

import { Pause, Play } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '@tanstack/react-store'

import { audioPreviewStore, workflowStore } from '~/lib/store'

import { cn } from '~/lib/utils'
import type { Speaker } from '~/lib/types'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Button } from '../ui/button'

export function SpeakerPreview(props: {
    speaker: Speaker
    audioRef: React.RefObject<HTMLAudioElement | null>
}) {
    const [isCurrentPlaying, setIsCurrentPlaying] = useState(false)

    const { transcript } = useStore(workflowStore)
    const { isPlaying, audioUrl } = useStore(audioPreviewStore)

    const togglePlayback = async () => {
        if (!props.audioRef.current || !audioUrl) return
        const sample = transcript?.[props.speaker.id]?.[0]

        if (isPlaying || isCurrentPlaying) {
            props.audioRef.current.pause()
            setIsCurrentPlaying(false)
        } else {
            props.audioRef.current.pause()
            props.audioRef.current.currentTime = sample?.start ?? 0
            const duration = (sample?.end ?? 0) - (sample?.start ?? 0)

            await props.audioRef.current.play()
        }

        audioPreviewStore.setState((state) => ({
            ...state,
            isPlaying: !state.isPlaying,
        }))
        setIsCurrentPlaying(!isCurrentPlaying)
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={'ghost'}
                        size="icon"
                        className={cn(
                            'relative size-8 rounded-full',
                            isCurrentPlaying && 'bg-primary/20'
                        )}
                        onClick={togglePlayback}
                        disabled={!audioUrl}
                    >
                        {isCurrentPlaying && (
                            <span className="bg-primary/10 absolute inset-0 animate-ping rounded-full opacity-75"></span>
                        )}
                        {isCurrentPlaying ? (
                            <Pause className="size-4" />
                        ) : (
                            <Play className="size-4" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Play Sample</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
