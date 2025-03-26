'use client'

import { useStore } from '@tanstack/react-store'

import { workflowStore } from '~/lib/store'

import { Dropzone } from './dropzone'
import { Processing } from './processing'
import { Download } from './download'
import { CaptionSettings } from './caption-settings'

export function Workflow() {
    return <CaptionSettings />
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
