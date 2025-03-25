import { Workflow } from './_components/workflow'

export default async function Home() {
    return (
        <div className="container mx-auto -my-16 flex h-screen flex-1 flex-col items-center justify-center">
            <Workflow />
        </div>
    )
}
