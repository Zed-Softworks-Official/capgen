'use client'

import { useStore } from '@tanstack/react-store'

import { workflowStore } from '~/lib/store'

import { Dropzone } from './dropzone'
import { Processing } from './processing'
import { Download } from './download'
import { CaptionEditor } from './caption-editor'

export function Workflow() {
    return <CaptionEditor />
    // const { currentFile, progress, editing } = useStore(workflowStore)

    // if (!currentFile) {
    //     return <Dropzone />
    // }

    // if (progress.value !== 100) {
    //     return <Processing />
    // }

    // if (editing) {
    //     return <CaptionEditor />
    // }

    // return <Download />
}
