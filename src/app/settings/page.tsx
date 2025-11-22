'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCreditsStore } from '@/stores/credits-store'
import { Coins, LogOut } from 'lucide-react'
import { format } from 'date-fns'

interface UserProfile {
  id: string
  display_name: string | null
  email: string
  credit_balance: number
  created_at: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { balance, refreshBalance } = useCreditsStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/credits/balance')
        if (!res.ok) {
          throw new Error('Failed to fetch profile')
        }
        const { data } = await res.json()
        setProfile(data.profile)
        refreshBalance()
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [refreshBalance])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        router.push('/auth/login')
      } else {
        console.error('Logout failed')
      }
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          <p>Failed to load profile. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        {/* User Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Display Name</p>
              <p className="text-lg font-medium">
                {profile.display_name || 'Guest'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-lg">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Created</p>
              <p className="text-lg">
                {format(new Date(profile.created_at), 'MMMM dd, yyyy')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Credit Balance Card */}
        <Card className="mb-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-600" />
              Credit Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-6xl font-bold text-amber-500 mb-2">
                {balance}
              </div>
              <p className="text-lg text-amber-700">credits</p>
            </div>

            <Button
              className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white"
              disabled
              title="Credit purchase coming in Story 2.3"
            >
              Purchase Credits
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Credit purchase coming in Story 2.3
            </p>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? 'Logging out...' : 'Log Out'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
