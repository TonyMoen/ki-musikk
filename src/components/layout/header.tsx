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
import { Music } from 'lucide-react'

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { balance, refreshBalance } = useCreditsStore()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (user) {
          refreshBalance()
        }
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        refreshBalance()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [refreshBalance])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const handleSignIn = () => {
    router.push('/auth/login')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Music className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground hidden sm:inline">
              Musikkfabrikken
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {user && (
              <>
                <Link
                  href="/songs"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Mine Sanger
                </Link>
                <Link
                  href="/settings?openPurchaseModal=true"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Priser
                </Link>
              </>
            )}
          </nav>

          {/* User Area */}
          <div className="flex items-center gap-4">
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
                    {balance} kr
                  </span>
                  <MobileNav
                    user={user}
                    credits={balance}
                    onSignOut={handleSignOut}
                  />
                </div>
              </>
            ) : (
              // Logged out state
              <>
                {/* Desktop: Auth buttons */}
                <div className="hidden md:flex items-center gap-3">
                  <Button variant="ghost" onClick={handleSignIn}>
                    Logg inn
                  </Button>
                  <Button onClick={handleSignIn}>
                    Kom i gang
                  </Button>
                </div>

                {/* Mobile: Hamburger menu */}
                <div className="flex md:hidden">
                  <MobileNav
                    user={null}
                    credits={0}
                    onSignOut={handleSignOut}
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
