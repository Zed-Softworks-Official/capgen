import { Editor } from './_components/editor'

export default async function Home() {
    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center">
            <Editor />
        </div>
    )
}
