import { RedirectToSignIn } from '@clerk/nextjs'
import { currentUser, type User } from '@clerk/nextjs/server'
import { fetchQuery } from 'convex/nextjs'
import Link from 'next/link'
import {
    ArrowLeft,
    Clock,
    CreditCard,
    ExternalLink,
    FileAudio,
    UserIcon,
} from 'lucide-react'

import { notFound } from 'next/navigation'
import { formatDistanceToNow, formatDuration } from 'date-fns'

import { Button } from '~/app/_components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/app/_components/ui/tabs'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../_components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../_components/ui/avatar'
import { Badge } from '../_components/ui/badge'
import { Progress } from '../_components/ui/progress'
import { unkey } from '~/server/unkey'
import { getAuthToken } from '~/lib/auth'
import { api } from '~/convex/_generated/api'
import { redis } from '~/server/redis'
import type { StripeSubData } from '~/lib/types'

export default async function ProfilePage() {
    const user = await currentUser()

    if (!user) {
        return <RedirectToSignIn />
    }

    return (
        <main className="flex-1">
            <div className="container mx-auto max-w-4xl px-4 py-10">
                <div className="mb-8 flex items-center">
                    <Button variant={'ghost'} size="icon" asChild className="mr-2">
                        <Link href="/">
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Profile</h1>
                        <p className="text-muted-foreground">
                            Manage your profile and subscription
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid max-w-md grid-cols-2">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="subscription">Subscription</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile">
                        <ProfileCard user={user} />
                    </TabsContent>
                    <TabsContent value="subscription">
                        <SubscriptionCard user={user} />
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    )
}

function ProfileCard(props: { user: User }) {
    return (
        <Card className="border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserIcon className="text-primary size-5" />
                    Profile
                </CardTitle>
                <CardDescription>
                    Update your profile pircture and view your account information
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-start gap-6 md:flex-row">
                    <div className="flex flex-col items-center gap-3">
                        <Avatar className="border-background size-24 border-4">
                            <AvatarImage
                                src={props.user.imageUrl}
                                alt={props.user.fullName ?? 'Unknown'}
                            />
                            <AvatarFallback>
                                {props.user.fullName?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <p className="text-muted-foreground text-sm font-medium">
                                Name
                            </p>
                            <p className="font-medium">{props.user.fullName}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-muted-foreground text-sm font-medium">
                                Email
                            </p>
                            <p className="font-medium">
                                {props.user.emailAddresses[0]?.emailAddress}
                            </p>
                        </div>

                        <div className="pt-2">
                            <p className="text-muted-foreground mb-2 text-sm font-medium">
                                Connected Accounts
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {props.user.externalAccounts.map((account) => (
                                    <Badge
                                        key={account.id}
                                        variant={'outline'}
                                        className="bg-accent/30 border-primary/20 flex items-center gap-1"
                                    >
                                        {account.provider
                                            .replace('oauth_', '')
                                            .replace('oauth2_', '')}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <p className="text-muted-foreground text-sm">
                        Account management is handled through Clerk. To change your email,
                        password, or connected accounts, please use the Clerk user portal.
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/30 hover:bg-primary/10 mt-2"
                        asChild
                    >
                        <Link href={'https://accounts.capgen.io/user'} target="_blank">
                            <ExternalLink className="mr-2 h-3 w-3" />
                            Manage Account with Clerk
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

async function SubscriptionCard(props: { user: User }) {
    const token = await getAuthToken()
    const recents = await fetchQuery(
        api.functions.transcript.getRecentTranscripts,
        {},
        { token }
    )

    const unkeyApiKey = await unkey.keys.get({
        keyId: props.user.privateMetadata.keyId as string,
    })

    if (unkeyApiKey.error) {
        console.error('Unkey API key not found')
        return notFound()
    }

    const customerId = await redis.get<string>(`stripe:user:${props.user.id}`)
    const subData = await redis.get<StripeSubData>(`stripe:customer:${customerId}`)

    const formatTrialRemaining = (endDate: number) => {
        return formatDistanceToNow(new Date(endDate * 1000), { addSuffix: false })
    }

    return (
        <Card className="border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="text-primary h-5 w-5" />
                    Subscription Status
                </CardTitle>
                <CardDescription>
                    View and manage your CapGen subscription
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-accent/30 border-primary/20 rounded-lg border p-6">
                    {subData?.status === 'active' ? (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-xl font-medium">Pro Plan</h3>
                                <Badge className="border-green-500/20 bg-green-500/20 text-green-500">
                                    Active
                                </Badge>
                            </div>
                            <p className="text-muted-foreground mb-6">
                                You have full access to all CapGen features.
                            </p>
                        </>
                    ) : subData?.status === 'trialing' ? (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-xl font-medium">Free Trial</h3>
                                <Badge className="border-blue-500/20 bg-blue-500/20 text-blue-500">
                                    {formatTrialRemaining(subData.currentPeriodEnd ?? 0)}{' '}
                                    remaining
                                </Badge>
                            </div>
                            <p className="text-muted-foreground mb-6">
                                You&apos;re currently on a free trial with access to all
                                CapGen features. Your trial will end in{' '}
                                {formatTrialRemaining(subData.currentPeriodEnd ?? 0)}.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-xl font-medium">
                                    No Active Subscription
                                </h3>
                                <Badge className="border-yellow-500/20 bg-yellow-500/20 text-yellow-500">
                                    Inactive
                                </Badge>
                            </div>
                            <p className="text-muted-foreground mb-6">
                                You don&apos;t have an active subscription. Subscribe to
                                the Pro Plan to access all CapGen features.
                            </p>
                        </>
                    )}

                    <Button asChild className="group relative overflow-hidden">
                        <Link
                            href={
                                subData?.status === 'none' || !subData
                                    ? '/subscribe'
                                    : '/portal'
                            }
                            target="_blank"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-100 transition-opacity group-hover:opacity-90"></div>
                            <span className="relative flex items-center">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                {subData?.status === 'active' ||
                                subData?.status === 'trialing'
                                    ? 'Manage Subscription'
                                    : 'Subscribe Now'}
                            </span>
                        </Link>
                    </Button>
                </div>

                <div className="bg-accent/20 border-primary/10 rounded-lg border p-4">
                    <h3 className="mb-2 font-medium">Pro Plan Features</h3>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                            <div className="text-primary mt-0.5 mr-2">•</div>
                            <span>Unlimited audio and video files</span>
                        </li>
                        <li className="flex items-start">
                            <div className="text-primary mt-0.5 mr-2">•</div>
                            <span>Up to 10 hours of processing per month</span>
                        </li>
                        <li className="flex items-start">
                            <div className="text-primary mt-0.5 mr-2">•</div>
                            <span>Speaker separation</span>
                        </li>
                        <li className="flex items-start">
                            <div className="text-primary mt-0.5 mr-2">•</div>
                            <span>Priority processing</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-accent/20 border-primary/10 rounded-lg border p-4">
                    <h3 className="mb-4 flex items-center font-medium">
                        <Clock className="text-primary mr-2 h-4 w-4" />
                        Time Usage
                    </h3>

                    <div className="space-y-4">
                        <TimeUsageBar
                            remaining={unkeyApiKey.result.remaining ?? 0}
                            limit={unkeyApiKey.result.refill?.amount ?? 0}
                        />

                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Recent Activity</h4>
                            {recents?.map((activity, index) => (
                                <div
                                    key={index}
                                    className="border-primary/10 flex justify-between border-b pb-2 text-sm"
                                >
                                    <div className="flex items-center">
                                        <FileAudio className="text-primary mr-2 h-3 w-3" />
                                        <span className="max-w-[150px] truncate">
                                            {activity.file.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>
                                            {formatDuration(
                                                {
                                                    seconds: Math.floor(
                                                        activity.duration
                                                    ),
                                                },
                                                {
                                                    format:
                                                        activity.duration < 60
                                                            ? ['seconds']
                                                            : activity.duration < 3600
                                                              ? ['minutes', 'seconds']
                                                              : [
                                                                    'hours',
                                                                    'minutes',
                                                                    'seconds',
                                                                ],
                                                }
                                            )}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            {formatDistanceToNow(activity._creationTime, {
                                                addSuffix: true,
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-muted-foreground text-sm">
                    Subscription management is handled through Stripe. Click the button
                    above to manage your subscription, update payment methods, or view
                    billing history.
                </p>
            </CardContent>
        </Card>
    )
}

function TimeUsageBar(props: { remaining: number; limit: number }) {
    const current = props.limit - props.remaining

    return (
        <div>
            <div className="mb-1 flex justify-between text-sm">
                <span>
                    Used:{' '}
                    {formatDuration(
                        {
                            seconds: Math.floor(current),
                        },
                        {
                            format:
                                current < 60
                                    ? ['seconds']
                                    : current < 3600
                                      ? ['minutes', 'seconds']
                                      : ['hours', 'minutes', 'seconds'],
                        }
                    )}
                </span>
                <span>
                    {Math.round((current / props.limit) * 100)}% of{' '}
                    {formatDuration(
                        {
                            hours: props.limit / 3600,
                        },
                        { format: ['hours'] }
                    )}
                </span>
            </div>
            <div className="bg-accent h-2 w-full overflow-hidden rounded-full">
                <Progress value={(current / props.limit) * 100} />
            </div>
        </div>
    )
}
