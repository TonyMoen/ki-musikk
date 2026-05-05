'use client'

import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Settings, CreditCard, LogOut, ChevronDown } from 'lucide-react'

interface UserMenuProps {
  user: User
  onSignOut: () => void
}

function getInitials(user: User): string {
  const name = user.user_metadata?.full_name || user.email || ''
  if (!name) return '?'

  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 px-1 hover:bg-transparent"
          aria-label="Brukermeny"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatarUrl} alt={user.user_metadata?.full_name || 'Bruker'} />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/innstillinger" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>Innstillinger</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/priser" className="flex items-center gap-2 cursor-pointer">
            <CreditCard className="h-4 w-4" />
            <span>Kjøp kreditter</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onSignOut}
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>Logg ut</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
