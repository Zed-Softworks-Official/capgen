import { Workflow } from './_components/workflow'
import { CaptionEditor } from './_components/workflow/caption-editor'

export default async function Home() {
    return (
        <main className="container mx-auto -my-16 flex h-screen flex-1 flex-col items-center justify-center">
            <CaptionEditor />
            {/* <Workflow /> */}
        </main>
    )
}
