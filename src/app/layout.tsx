import '~/styles/globals.css'

import Link from 'next/link'
import { type Metadata } from 'next'
import { Geist } from 'next/font/google'

import {
    ClerkProvider,
    SignedIn,
    SignedOut,
    SignInButton,
    UserButton,
} from '@clerk/nextjs'

import { ThemeProvider } from './_components/theme-provider'

import { TRPCReactProvider } from '~/trpc/react'

import { env } from '~/env'
import { Button } from './_components/ui/button'

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
                        <TRPCReactProvider>
                            <Navbar />
                            {children}
                        </TRPCReactProvider>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    )
}

function Navbar() {
    return (
        <header className="bg-background sticky top-0 z-50 h-16 border-b">
            <div className="container mx-auto flex h-full items-center justify-between">
                <Link href="/" className="font-bold">
                    CapGen
                </Link>
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <SignedOut>
                    <Button variant={'ghost'} asChild>
                        <SignInButton />
                    </Button>
                </SignedOut>
            </div>
        </header>
    )
}
