import { CreditCard, LogOut, User } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

export async function UserButton() {
    const user = await currentUser()

    if (!user) {
        return null
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={'ghost'} className="relative size-8 rounded-full">
                    <Avatar className="border-primary/20 size-8 border">
                        <AvatarImage src={user.imageUrl} />
                        <AvatarFallback>
                            <User className="text-primary size-4" />
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm leading-none font-medium">
                            {user.fullName}
                        </p>
                        <p className="text-muted-foreground text-xs leading-none">
                            {user.emailAddresses[0]?.emailAddress}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <User className="mr-2 size-4" />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <CreditCard className="mr-2 size-4" />
                        Billing
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <LogOut className="mr-2 size-4" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
