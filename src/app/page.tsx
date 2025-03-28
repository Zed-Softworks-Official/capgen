import { Workflow } from './_components/workflow'

export default async function Home() {
    return (
        <main className="container mx-auto h-[calc(100vh-15rem)] max-w-xl pt-16">
            <Workflow />
        </main>
    )
}
