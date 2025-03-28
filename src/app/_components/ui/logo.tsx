import { AudioLines } from 'lucide-react'
import { cn } from '~/lib/utils'

export function Logo(props: { className?: string }) {
    return (
        <div className={cn('flex items-center justify-center', props.className)}>
            <div className="relative">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 opacity-75 blur"></div>
                <div className="bg-background relative flex items-center rounded-lg p-2">
                    <AudioLines className="text-primary mr-1.5 size-6" />
                    <span className="bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-xl font-bold text-transparent">
                        CapGen
                    </span>
                </div>
            </div>
        </div>
    )
}
