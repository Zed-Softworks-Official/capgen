import '~/styles/globals.css'

import { type Metadata } from 'next'
import { Geist } from 'next/font/google'

import { TRPCReactProvider } from '~/trpc/react'
import { ClerkProvider } from '@clerk/nextjs'
import { env } from '~/env'
import { ThemeProvider } from './_components/theme-provider'

export const metadata: Metadata = {
    title: 'CapGen',
    description: 'AI-powered caption generator',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

const geist = Geist({
    subsets: ['latin'],
    variable: '--font-geist-sans',
})

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <ClerkProvider publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
            <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
                <body>
                    <ThemeProvider
                        attribute={'class'}
                        defaultTheme={'system'}
                        enableSystem
                        disableTransitionOnChange
                    >
                        <TRPCReactProvider>{children}</TRPCReactProvider>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    )
}
