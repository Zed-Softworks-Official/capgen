'use client'

import { type NodeList, stringifySync } from 'subtitle'
import { useCallback, useState } from 'react'
import { Download } from 'lucide-react'

import JSZip from 'jszip'

import { Button } from '~/app/_components/ui/button'
import type { CapGenTranscript } from '~/lib/types'

export function DownloadButton(props: {
    selectedSpeakers: string[]
    transcript: CapGenTranscript
}) {
    const [pending, setPending] = useState(false)

    // TODO: add the ability to have a max word count per caption
    const splitTranscript = useCallback(() => {
        if (!props.transcript) return

        const nodes: Record<string, NodeList> = Object.entries(props.transcript)
            .filter(([speaker]) => props.selectedSpeakers.includes(speaker))
            .reduce(
                (acc, [speaker, lines]) => {
                    acc[speaker] = lines.map((line) => ({
                        type: 'cue',
                        data: {
                            start: line.start,
                            end: line.end,
                            text: line.text,
                        },
                    }))

                    return acc
                },
                {} as Record<string, NodeList>
            )

        return nodes
    }, [props.transcript, props.selectedSpeakers])

    const handleDownload = useCallback(
        (nodes: Record<string, NodeList>) => {
            const srtFileData = Object.entries(nodes).map(([_, nodes]) => {
                return stringifySync(nodes, {
                    format: 'SRT',
                })
            })

            // Create a zip file with JSZip
            const zip = new JSZip()

            // Add each SRT file to the zip
            Object.entries(nodes).forEach(([speaker, _], index) => {
                const fileName = `${speaker}.srt`
                zip.file(fileName, srtFileData[index] ?? 'unknown')
            })

            // Generate the zip file
            zip.generateAsync({ type: 'blob' })
                .then((content: Blob) => {
                    // Create a download link for the zip file
                    const url = URL.createObjectURL(content)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'transcripts.zip'
                    document.body.appendChild(a)
                    a.click()

                    // Clean up
                    URL.revokeObjectURL(url)
                    document.body.removeChild(a)
                    setPending(false)
                })
                .catch((error: Error) => {
                    console.error('Error creating zip file:', error)
                    setPending(false)
                })
        },
        [splitTranscript]
    )

    return (
        <Button
            className="group relative w-full cursor-pointer overflow-hidden"
            onClick={() => {
                setPending(true)
                const nodes = splitTranscript()
                if (!nodes) {
                    setPending(false)
                    return
                }

                handleDownload(nodes)
            }}
            disabled={props.selectedSpeakers.length === 0 || pending}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-100 transition-opacity group-hover:opacity-90"></div>
            <span className="relative flex items-center">
                <Download className="mr-2 h-4 w-4" /> Download SRT
            </span>
        </Button>
    )
}
