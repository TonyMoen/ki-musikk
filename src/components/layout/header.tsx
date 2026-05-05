'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { UserMenu } from './user-menu'
import { MobileNav } from './mobile-nav'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCreditsStore } from '@/stores/credits-store'
import { AppLogo } from '@/components/app-logo'
import { cn } from '@/lib/utils'

type NavLink = {
  href: string
  label: string
  requiresAuth?: boolean
}

const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Hjem' },
  { href: '/sanger', label: 'Mine Sanger', requiresAuth: true },
  { href: '/priser', label: 'Priser' },
]

function isLinkActive(pathname: string | null, href: string) {
  if (!pathname) return false
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { balance } = useCreditsStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!isMounted) return
        setUser(user)
        if (user) {
          // Call refreshBalance directly from store to avoid dependency issues
          useCreditsStore.getState().refreshBalance()
        }
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    getUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        useCreditsStore.getState().refreshBalance()
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array - only runs once on mount

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    // Full page reload to clear all client state (songs, etc.)
    window.location.href = '/'
  }

  const handleSignIn = () => {
    router.push('/auth/logg-inn')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/40 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 md:h-20 gap-4">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <AppLogo size={40} />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-serif text-xl font-bold tracking-tight text-foreground">
                AI Musikk
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Norsk · siden 2024
              </span>
            </div>
          </Link>

          {/* Center pill nav */}
          <nav
            aria-label="Hovednavigasjon"
            className="hidden md:flex items-center gap-1 rounded-full border border-border/50 bg-card/60 p-1"
          >
            {NAV_LINKS.map((item) => {
              const active = isLinkActive(pathname, item.href)
              const className = cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'border border-primary text-primary'
                  : 'border border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/30'
              )
              const requiresAuth = item.requiresAuth && !user
              if (requiresAuth) {
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push('/auth/logg-inn')}
                    className={className}
                  >
                    {item.label}
                  </button>
                )
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={className}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User Area */}
          <div className="flex items-center gap-3 min-w-[160px] justify-end">
            {isLoading ? (
              // Skeleton loader while auth state is loading
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-24 rounded-full hidden md:block" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ) : user ? (
              // Logged in state
              <>
                {/* Desktop: Credit pill + avatar dropdown */}
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    href="/priser"
                    aria-label={`${balance} kreditter — kjøp flere`}
                    className="group flex items-center gap-2 rounded-full border border-border/50 bg-card/60 px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-secondary/30 transition-colors"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]"></span>
                    </span>
                    <span>{balance} kreditter</span>
                  </Link>
                  <UserMenu user={user} onSignOut={handleSignOut} />
                </div>

                {/* Mobile: Credit balance + hamburger */}
                <div className="flex md:hidden items-center gap-2">
                  <Link
                    href="/priser"
                    aria-label={`${balance} kreditter — kjøp flere`}
                    className="flex items-center gap-1.5 rounded-full border border-border/50 bg-card/60 px-2.5 py-1 text-xs font-semibold text-foreground"
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60"></span>
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]"></span>
                    </span>
                    <span>{balance}</span>
                  </Link>
                  <MobileNav
                    user={user}
                    credits={balance}
                    onSignOut={handleSignOut}
                    onShowLoginModal={() => router.push('/auth/logg-inn')}
                  />
                </div>
              </>
            ) : (
              // Logged out state
              <>
                {/* Desktop: Auth button */}
                <div className="hidden md:flex items-center">
                  <Button onClick={handleSignIn}>
                    Logg inn
                  </Button>
                </div>

                {/* Mobile: Hamburger menu */}
                <div className="flex md:hidden">
                  <MobileNav
                    user={null}
                    credits={0}
                    onSignOut={handleSignOut}
                    onShowLoginModal={() => router.push('/auth/logg-inn')}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

    </header>
  )
}
