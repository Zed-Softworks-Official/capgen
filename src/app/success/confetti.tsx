'use client'

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

export function Confetti() {
    const { mounted } = useConfetti()

    if (!mounted) {
        return null
    }

    return <></>
}

function useConfetti() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        // Trigger confetti animation on page load
        if (typeof window !== 'undefined') {
            const duration = 3 * 1000
            const animationEnd = Date.now() + duration

            const randomInRange = (min: number, max: number) => {
                return Math.random() * (max - min) + min
            }

            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now()

                if (timeLeft <= 0) {
                    return clearInterval(interval)
                }

                const particleCount = 50 * (timeLeft / duration)

                // Since particles fall down, start a bit higher than random
                void confetti({
                    startVelocity: 30,
                    spread: 360,
                    ticks: 60,
                    zIndex: 0,
                    particleCount: Math.floor(particleCount),
                    origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
                    colors: ['#9333ea', '#a855f7', '#c084fc', '#d8b4fe'],
                })
            }, 250)

            return () => clearInterval(interval)
        }
    }, [])

    return { mounted }
}
