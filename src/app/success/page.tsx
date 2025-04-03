import Link from 'next/link'
import { redirect } from 'next/navigation'

import { RedirectToSignIn } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'

import { Calendar, CheckCircle, CreditCard, Upload, ArrowRight } from 'lucide-react'

import { Logo } from '../_components/ui/logo'
import { Card, CardContent } from '../_components/ui/card'
import { Button } from '../_components/ui/button'
import { polar } from '~/server/polar'
import { env } from '~/env'
import { Confetti } from './confetti'

export default async function SuccessPage() {
    const user = await currentUser()

    if (!user) {
        return <RedirectToSignIn />
    }

    const customer = await polar.customers.getExternal({
        externalId: user.id,
    })

    const subscriptions = await polar.subscriptions.list({
        customerId: customer.id,
        active: true,
        limit: 1,
        productId: env.POLAR_PRODUCT_ID,
    })

    const subscriptionData = subscriptions.result.items[0]
    if (!subscriptionData) {
        return redirect('/')
    }

    return (
        <main className="flex flex-1 flex-col">
            <div className="container mx-auto flex max-w-4xl flex-1 flex-col px-4 py-10">
                <Confetti />

                <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
                    <div className="relative mb-6">
                        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-purple-600/20 to-violet-600/20 blur-lg"></div>
                        <div className="relative rounded-full bg-green-500/20 p-3">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                        </div>
                    </div>

                    <h1 className="mb-4 text-3xl font-bold">Subscription Successful!</h1>
                    <p className="text-muted-foreground mb-8">
                        Thank you for subscribing to CapGen. Your account has been
                        upgraded to the Pro Plan.
                    </p>

                    <Card className="border-primary/20 mb-8 w-full overflow-hidden">
                        <div className="from-purple/5 to-violet/5 pointer-events-none absolute inset-0 bg-gradient-to-br"></div>
                        <CardContent className="relative p-6">
                            <div className="space-y-4">
                                <div className="border-primary/10 flex items-center justify-between border-b pb-2">
                                    <span className="font-medium">Plan</span>
                                    <span className="font-bold">
                                        {subscriptionData.product.name}
                                    </span>
                                </div>

                                <div className="border-primary/10 flex items-center justify-between border-b pb-2">
                                    <span className="font-medium">Price</span>
                                    <span>${subscriptionData.amount / 100} / month</span>
                                </div>

                                <div className="border-primary/10 flex items-center justify-between border-b pb-2">
                                    <span className="flex items-center font-medium">
                                        <Calendar className="text-primary mr-1 h-4 w-4" />
                                        Next billing date
                                    </span>
                                    <span>
                                        {subscriptionData.currentPeriodEnd?.toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="w-full space-y-4">
                        <Button className="group relative w-full overflow-hidden" asChild>
                            <Link href="/" prefetch={true}>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-100 transition-opacity group-hover:opacity-90"></div>
                                <span className="relative flex items-center">
                                    <Upload className="mr-2 h-4 w-4" /> Start Uploading
                                </span>
                            </Link>
                        </Button>

                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/profile">
                                View Subscription Details{' '}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    )
}
