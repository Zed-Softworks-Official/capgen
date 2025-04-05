import '~/styles/globals.css'

import Link from 'next/link'
import { type Metadata } from 'next'
import { Geist } from 'next/font/google'

import { ClerkProvider, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'

import { ThemeProvider } from './_components/theme-provider'

import { env } from '~/env'
import { Button } from './_components/ui/button'
import { Toaster } from './_components/ui/sonner'
import { Logo } from './_components/ui/logo'
import { User } from 'lucide-react'
import { UserButton } from './_components/user-button'
import { ConvexProvider } from './_components/convex-provider'

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
                        <ConvexProvider>
                            <Navbar />
                            {children}
                            <Toaster richColors />
                        </ConvexProvider>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    )
}

function Navbar() {
    return (
        <header className="border-border/40 bg-background/96 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
            <div className="container mx-auto flex h-16 items-center justify-between">
                <div className="flex items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <Logo className="h-auto w-28" />
                    </Link>
                </div>

                <SignedIn>
                    <UserButton />
                </SignedIn>
                <SignedOut>
                    <SignInButton>
                        <Button
                            variant={'ghost'}
                            size={'icon'}
                            className="border-primary/20 cursor-pointer rounded-full border"
                        >
                            <User className="text-primary size-4" />
                        </Button>
                    </SignInButton>
                </SignedOut>
            </div>
        </header>
    )
}
