'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCreditsStore } from '@/stores/credits-store'
import { useToast } from '@/hooks/use-toast'
import { CreditPurchaseModal } from '@/components/credit-purchase-modal'
import { TransactionHistory } from '@/components/transaction-history'
import { Coins, LogOut } from 'lucide-react'
import { format } from 'date-fns'

interface UserProfile {
  id: string
  display_name: string | null
  email: string
  credit_balance: number
  created_at: string
}

interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  balance_after: number
  transaction_type: 'purchase' | 'deduction' | 'refund'
  description: string
  stripe_session_id?: string
  song_id?: string
  created_at: string
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
}

function SettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { balance, refreshBalance } = useCreditsStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const page = searchParams.get('page') || '1'
        const type = searchParams.get('type') || 'all'
        const params = new URLSearchParams()
        if (page !== '1') params.set('page', page)
        if (type !== 'all') params.set('type', type)

        const res = await fetch(`/api/credits/balance${params.toString() ? '?' + params.toString() : ''}`)
        if (!res.ok) {
          throw new Error('Failed to fetch profile')
        }
        const { data } = await res.json()
        setProfile(data.profile)
        setTransactions(data.transactions || [])
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          pageSize: 10
        })
        refreshBalance()
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [refreshBalance, searchParams])

  // Handle payment redirect query params
  useEffect(() => {
    const payment = searchParams.get('payment')

    if (payment === 'success') {
      toast({
        title: '✓ Credits added to your account!',
        description: 'Your credit balance has been updated.',
      })
      // Refresh balance to show new credits
      refreshBalance()
      // Clear query param
      router.replace('/settings')
    } else if (payment === 'cancelled') {
      toast({
        title: 'Credit purchase cancelled',
        description: 'No charges were made to your account.',
        variant: 'default',
      })
      // Clear query param
      router.replace('/settings')
    }
  }, [searchParams, toast, refreshBalance, router])

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
              onClick={() => setIsPurchaseModalOpen(true)}
            >
              Purchase Credits
            </Button>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <TransactionHistory
              transactions={transactions}
              pagination={pagination}
            />
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

      {/* Credit Purchase Modal */}
      <CreditPurchaseModal
        open={isPurchaseModalOpen}
        onOpenChange={setIsPurchaseModalOpen}
      />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-6"><div className="max-w-2xl mx-auto"><h1 className="text-3xl font-bold mb-6">Settings</h1><p>Loading...</p></div></div>}>
      <SettingsContent />
    </Suspense>
  )
}
