'use client'

import { type NodeList, stringifySync } from 'subtitle'
import { useCallback, useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { Download } from 'lucide-react'

import JSZip from 'jszip'

import { workflowStore } from '~/lib/store'
import { Button } from '../ui/button'

export function DownloadButton(props: { selectedSpeakers: string[] }) {
    const [pending, setPending] = useState(false)
    const { transcript } = useStore(workflowStore)

    const splitTranscript = useCallback(() => {
        if (!transcript) return

        const nodes: Record<string, NodeList> = Object.entries(transcript)
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
    }, [transcript, props.selectedSpeakers])

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

// function DownloadButton(props: { selectedSpeakers: string[] }) {
//     const generateSrt = api.transcript.generateSrt.useMutation({
//         onSuccess: (res) => {
//             if (res.error) {
//                 toast.error('Failed to generate srt')
//                 return
//             }

//             const blob = new Blob([res.data], { type: 'text/srt' })
//             const url = URL.createObjectURL(blob)
//             const a = document.createElement('a')
//             a.href = url
//             a.download = 'transcript.srt'
//             a.click()
//         },
//     })

//     return (
//         <Button
//             className="group relative w-full cursor-pointer overflow-hidden"
//             onClick={() => {
//                 console.log('Downloading srt')
//                 // if (!props.transcriptId) {
//                 //     toast.error('No transcript id found')
//                 //     return
//                 // }

//                 // generateSrt.mutate({
//                 //     transcriptId: props.transcriptId,
//                 //     maxCharsPerCaption: 100,
//                 //     includedSpeakers: props.selectedSpeakers,
//                 // })
//             }}
//             disabled={props.selectedSpeakers.length === 0 || generateSrt.isPending}
//         >
//             <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-100 transition-opacity group-hover:opacity-90"></div>
//             <span className="relative flex items-center">
//                 <Download className="mr-2 h-4 w-4" /> Download SRT
//             </span>
//         </Button>
//     )
// }
