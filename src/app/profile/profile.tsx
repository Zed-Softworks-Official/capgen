'use client'

import { User } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../_components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../_components/ui/avatar'
import { RedirectToSignIn, useUser } from '@clerk/nextjs'

export function ProfileForm() {
    const { user, isLoaded } = useUser()

    if (!isLoaded) {
        return <>Loading...</>
    }

    if (!user) {
        return <RedirectToSignIn />
    }

    return (
        <Card className="border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="text-primary size-5" />
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
                                src={user.imageUrl}
                                alt={user.fullName ?? 'Unknown'}
                            />
                            <AvatarFallback>
                                {user.fullName?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
