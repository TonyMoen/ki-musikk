'use client'

import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Menu,
  Music,
  Home,
  CreditCard,
  Settings,
  LogOut,
  LogIn,
  Sparkles,
} from 'lucide-react'

interface MobileNavProps {
  user: User | null
  credits: number
  onSignOut: () => void
  onShowLoginModal?: () => void
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

export function MobileNav({ user, credits, onSignOut, onShowLoginModal }: MobileNavProps) {
  const pathname = usePathname()
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture

  // Nav items shown for all users
  const commonNavItems = [
    { href: '/', icon: Home, label: 'Hjem' },
  ]

  // Items that require auth
  const authRequiredItems = [
    { href: '/songs', icon: Music, label: 'Mine Sanger', requiresAuth: true },
  ]

  // Items that don't require auth
  const publicItems = [
    { href: '/settings?openPurchaseModal=true', icon: Sparkles, label: 'Priser' },
  ]

  // Settings only for logged in users
  const settingsItem = { href: '/settings', icon: Settings, label: 'Innstillinger' }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Åpne meny</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Music className="h-6 w-6 text-primary" />
            <span>KI MUSIKK</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100%-73px)]">
          {/* User Info (if logged in) */}
          {user && (
            <div className="px-6 py-4 border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarUrl} alt={user.user_metadata?.full_name || 'Bruker'} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate max-w-[180px]">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {credits} kreditter
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-4">
            <ul className="space-y-1">
              {/* Common nav items */}
              {commonNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <SheetClose asChild>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-accent'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </SheetClose>
                  </li>
                )
              })}

              {/* Auth required items - show login modal if not logged in */}
              {authRequiredItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    {user ? (
                      <SheetClose asChild>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground hover:bg-accent'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      </SheetClose>
                    ) : (
                      <SheetClose asChild>
                        <button
                          onClick={onShowLoginModal}
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors w-full text-left"
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </button>
                      </SheetClose>
                    )}
                  </li>
                )
              })}

              {/* Public items - always accessible */}
              {publicItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <SheetClose asChild>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </SheetClose>
                  </li>
                )
              })}

              {/* Settings - only for logged in users */}
              {user && (
                <li>
                  <SheetClose asChild>
                    <Link
                      href={settingsItem.href}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                        pathname === settingsItem.href
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-accent'
                      }`}
                    >
                      <settingsItem.icon className="h-5 w-5" />
                      {settingsItem.label}
                    </Link>
                  </SheetClose>
                </li>
              )}
            </ul>
          </nav>

          {/* Bottom Actions */}
          <div className="mt-auto px-3 py-4 border-t">
            {user ? (
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={onSignOut}
                >
                  <LogOut className="h-5 w-5" />
                  Logg ut
                </Button>
              </SheetClose>
            ) : (
              <div className="space-y-2">
                <SheetClose asChild>
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <LogIn className="h-5 w-5" />
                      Logg inn
                    </Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/auth/login">
                    <Button className="w-full justify-start gap-3">
                      <Sparkles className="h-5 w-5" />
                      Kom i gang
                    </Button>
                  </Link>
                </SheetClose>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
