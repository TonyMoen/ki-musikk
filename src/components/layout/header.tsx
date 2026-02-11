'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { UserMenu } from './user-menu'
import { MobileNav } from './mobile-nav'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCreditsStore } from '@/stores/credits-store'
import { AppLogo } from '@/components/app-logo'

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { balance } = useCreditsStore()
  const router = useRouter()

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <AppLogo size={32} />
            <span className="text-xl font-bold text-foreground hidden sm:inline">
              KI MUSIKK
            </span>
          </Link>

          {/* Desktop Navigation - always visible */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Hjem
            </Link>
            {user ? (
              <Link
                href="/sanger"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Mine Sanger
              </Link>
            ) : (
              <button
                onClick={() => router.push('/auth/logg-inn')}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Mine Sanger
              </button>
            )}
            <Link
              href="/priser"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Priser
            </Link>
          </nav>

          {/* User Area */}
          <div className="flex items-center gap-4 min-w-[160px] justify-end">
            {isLoading ? (
              // Skeleton loader while auth state is loading
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-16 hidden md:block" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ) : user ? (
              // Logged in state
              <>
                {/* Desktop: User Menu */}
                <div className="hidden md:flex items-center gap-4">
                  <UserMenu
                    user={user}
                    credits={balance}
                    onSignOut={handleSignOut}
                  />
                </div>

                {/* Mobile: Credit balance + hamburger */}
                <div className="flex md:hidden items-center gap-2">
                  <span className="text-sm font-semibold text-primary">
                    {balance} kreditter
                  </span>
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
