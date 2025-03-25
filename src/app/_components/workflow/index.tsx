'use client'

import { useStore } from '@tanstack/react-store'

import { workflowStore } from '~/lib/store'

import { Dropzone } from './dropzone'
import { Processing } from './processing'

export function Workflow() {
    const { currentFile, progress } = useStore(workflowStore)

    if (!currentFile) {
        return <Dropzone />
    }

    if (progress.value !== 100) {
        return <Processing />
    }

    return <>Hello, World!</>
}
