'use client'

import { useStore } from '@tanstack/react-store'

import { workflowStore } from '~/lib/store'

import { Dropzone } from './dropzone'
import { Processing } from './processing'
import { Download } from './download'

export function Workflow() {
    const { currentFile, progress, transcript } = useStore(workflowStore)

    if (!currentFile) {
        return <Dropzone />
    }

    if (progress.value !== 100) {
        return <Processing />
    }

    return <Download />
}
