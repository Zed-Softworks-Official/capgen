import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'

import { Button } from './_components/ui/button'
import {
    Check,
    Clock,
    Download,
    Headphones,
    Mic,
    Users,
    Video,
    Wand2,
} from 'lucide-react'

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from './_components/ui/card'
import { redirect } from 'next/navigation'
import { SignInButton } from '@clerk/nextjs'

export default async function Home() {
    const user = await currentUser()

    if (user) {
        return redirect('/home')
    }

    return <LandingPage />
}

function LandingPage() {
    return (
        <main className="flex-1">
            <section className="relative overflow-hidden py-20 md:py-32">
                <div className="bg-grid-white/[0.02] absolute inset-0 bg-[size:60px_60px]" />
                <div className="via-primary/20 absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent" />
                <div className="via-primary/20 absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent" />
                <div className="relative container mx-auto">
                    <div className="flex flex-col items-center text-center">
                        <div className="bg-primary/10 text-primary mb-6 inline-block rounded-full px-3 py-1 text-sm">
                            Introducing CapGen
                        </div>
                        <h1 className="mb-6 max-w-4xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
                            Transform Audio & Video to Captions with AI
                        </h1>
                        <p className="text-muted-foreground mb-10 max-w-2xl text-xl">
                            Generate accurate, speaker-separated captions for your audio
                            and video files in seconds.
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <SignInButton>
                                <Button
                                    size="lg"
                                    className="group relative overflow-hidden"
                                    asChild
                                >
                                    <div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-100 transition-opacity group-hover:opacity-90"></div>
                                        <span className="relative">Try for Free</span>
                                    </div>
                                </Button>
                            </SignInButton>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="#pricing">View Pricing</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-accent/20 py-20">
                <div className="container mx-auto">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold">Powerful Features</h2>
                        <p className="text-muted-foreground mx-auto max-w-2xl">
                            Everything you need to create perfect captions for your
                            content
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <FeatureCard
                            icon={<Mic className="text-primary h-10 w-10" />}
                            title="Advanced Speech Recognition"
                            description="Industry-leading AI technology that accurately transcribes even in noisy environments"
                        />
                        <FeatureCard
                            icon={<Users className="text-primary h-10 w-10" />}
                            title="Speaker Separation"
                            description="Automatically identify and label different speakers in your audio"
                        />
                        <FeatureCard
                            icon={<Clock className="text-primary h-10 w-10" />}
                            title="Fast Processing"
                            description="Get your captions in minutes, not hours, regardless of file size"
                        />
                        <FeatureCard
                            icon={<Wand2 className="text-primary h-10 w-10" />}
                            title="AI-Powered Accuracy"
                            description="Smart algorithms that understand context and specialized terminology"
                        />
                        <FeatureCard
                            icon={<Headphones className="text-primary h-10 w-10" />}
                            title="Audio Preview"
                            description="Listen to specific segments to verify speaker identification"
                        />
                        <FeatureCard
                            icon={<Download className="text-primary h-10 w-10" />}
                            title="Multiple Export Formats"
                            description="Download your captions as SRT, VTT, or text files"
                        />
                        <FeatureCard
                            icon={<Video className="text-primary h-10 w-10" />}
                            title="Video Support"
                            description="Upload video files directly and get perfectly synchronized captions for your content"
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20">
                <div className="container mx-auto">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-muted-foreground mx-auto max-w-2xl">
                            No hidden fees or complicated tiers. Just one affordable plan
                            for all your captioning needs.
                        </p>
                    </div>

                    <div className="mx-auto max-w-md">
                        <Card className="border-primary/20 overflow-hidden">
                            <div className="from-purple/5 to-violet/5 pointer-events-none absolute inset-0 bg-gradient-to-br"></div>
                            <CardHeader className="bg-primary/10 border-primary/20 relative border-b">
                                <CardTitle className="text-2xl">Pro Plan</CardTitle>
                                <CardDescription>
                                    Perfect for content creators and professionals
                                </CardDescription>
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-bold">$15</span>
                                    <span className="text-muted-foreground ml-1">
                                        /month
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="relative pt-6">
                                <ul className="space-y-3">
                                    <PricingFeature>Unlimited audio files</PricingFeature>
                                    <PricingFeature>Speaker separation</PricingFeature>
                                    <PricingFeature>
                                        Multiple export formats (SRT, VTT, TXT)
                                    </PricingFeature>
                                    <PricingFeature>
                                        Audio preview for verification
                                    </PricingFeature>
                                </ul>
                            </CardContent>
                            <CardFooter className="relative">
                                <Button
                                    className="group relative w-full overflow-hidden"
                                    asChild
                                >
                                    <Link href="/upload">
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-100 transition-opacity group-hover:opacity-90"></div>
                                        <span className="relative">Get Started</span>
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                        <p className="text-muted-foreground mt-4 text-center text-sm">
                            Need more?{' '}
                            <Link href="#" className="text-primary hover:underline">
                                Contact us
                            </Link>{' '}
                            for custom enterprise plans.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-accent/20 py-20">
                <div className="container mx-auto">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="mb-6 text-3xl font-bold">
                            Ready to Transform Your Audio & Video?
                        </h2>
                        <p className="text-muted-foreground mb-10 text-xl">
                            Join thousands of content creators who trust CapGen for their
                            captioning needs.
                        </p>
                        <Button
                            size="lg"
                            className="group relative overflow-hidden"
                            asChild
                        >
                            <Link href="/upload">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-100 transition-opacity group-hover:opacity-90"></div>
                                <span className="relative">Start Your Free Trial</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    )
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <div className="bg-background/50 border-primary/10 hover:border-primary/30 rounded-lg border p-6 transition-all">
            <div className="bg-primary/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                {icon}
            </div>
            <h3 className="mb-2 text-xl font-medium">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    )
}

function PricingFeature({ children }: { children: React.ReactNode }) {
    return (
        <li className="flex items-start">
            <div className="mt-1 mr-3">
                <Check className="text-primary h-5 w-5" />
            </div>
            <span>{children}</span>
        </li>
    )
}
