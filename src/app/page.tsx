import { Workflow } from './_components/workflow'
import { CaptionSettings } from './_components/workflow/caption-settings'

export default async function Home() {
    return (
        <main className="container mx-auto pt-16">
            <CaptionSettings />
            {/* <Workflow /> */}
        </main>
    )
}
