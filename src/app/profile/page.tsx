import { RedirectToSignIn } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { polar } from '~/server/polar'

import { Button } from '~/app/_components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/app/_components/ui/tabs'
import { ProfileForm } from './profile'

async function getCustomer(userId: string) {
    'use cache'

    const customer = await polar.customers.getExternal({
        externalId: userId,
    })

    return customer
}

export default async function ProfilePage() {
    const user = await currentUser()

    if (!user) {
        return <RedirectToSignIn />
    }

    const customer = await getCustomer(user.id)

    return (
        <main className="flex-1">
            <div className="container mx-auto max-w-4xl px-4 py-10">
                <div className="mb-8 flex items-center">
                    <Button variant={'ghost'} size="icon" asChild>
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
                        <ProfileForm />
                    </TabsContent>
                    <TabsContent value="subscription"></TabsContent>
                </Tabs>
            </div>
        </main>
    )
}
