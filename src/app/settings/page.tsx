'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCreditsStore } from '@/stores/credits-store'
import { useToast } from '@/hooks/use-toast'
import { CreditPurchaseModal } from '@/components/credit-purchase-modal'
import { TransactionHistory } from '@/components/transaction-history'
import { Coins, LogOut, HelpCircle } from 'lucide-react'
import Link from 'next/link'
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

  // Handle payment redirect query params and modal open
  useEffect(() => {
    const payment = searchParams.get('payment')
    const openModal = searchParams.get('openPurchaseModal')

    if (payment === 'success') {
      toast({
        title: 'Kreditter lagt til!',
        description: 'Kredittsaldoen din er oppdatert.',
      })
      // Refresh balance to show new credits
      refreshBalance()
      // Clear query param
      router.replace('/settings')
    } else if (payment === 'cancelled') {
      toast({
        title: 'Betaling avbrutt',
        description: 'Ingen belastning ble gjort.',
        variant: 'default',
      })
      // Clear query param
      router.replace('/settings')
    } else if (payment === 'pending') {
      toast({
        title: 'Betaling venter',
        description: 'Vi behandler betalingen din. Kredittene legges til snart.',
        variant: 'default',
      })
      // Clear query param
      router.replace('/settings')
    } else if (payment === 'expired') {
      toast({
        title: 'Betaling utløpt',
        description: 'Betalingsfristen gikk ut. Prøv igjen.',
        variant: 'destructive',
      })
      // Clear query param
      router.replace('/settings')
    } else if (payment === 'error') {
      toast({
        title: 'Noe gikk galt',
        description: 'Kunne ikke fullføre betalingen. Prøv igjen.',
        variant: 'destructive',
      })
      // Clear query param
      router.replace('/settings')
    } else if (openModal === 'true') {
      setIsPurchaseModalOpen(true)
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
          <h1 className="text-3xl font-bold mb-6">Innstillinger</h1>
          <p>Laster...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Innstillinger</h1>
          <p>Kunne ikke laste profil. Prov igjen.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Innstillinger</h1>

        {/* User Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Kontoinformasjon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Visningsnavn</p>
              <p className="text-lg font-medium">
                {profile.display_name || 'Gjest'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">E-post</p>
              <p className="text-lg">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Konto opprettet</p>
              <p className="text-lg">
                {format(new Date(profile.created_at), 'dd. MMMM yyyy')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Low Balance Warning (if applicable) */}
        {balance < 20 && balance > 0 && (
          <Card className="mb-6 bg-yellow-50 border-yellow-400 border-2">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    Lav kredittsaldo!
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Du har {balance} kreditter igjen. Kjøp flere kreditter for å fortsette å lage sanger.
                  </p>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setIsPurchaseModalOpen(true)}
                  >
                    Kjøp kreditter nå
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Zero Balance Error (if applicable) */}
        {balance === 0 && (
          <Card className="mb-6 bg-red-50 border-red-400 border-2">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl">❌</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    Ingen kreditter igjen
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Du må kjøpe kreditter for å kunne generere sanger.
                  </p>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                    onClick={() => setIsPurchaseModalOpen(true)}
                  >
                    Kjøp kreditter for å fortsette
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Credit Balance Card */}
        <Card className={`mb-6 ${balance < 20 ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200' : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className={`w-5 h-5 ${balance < 20 ? 'text-red-600' : 'text-amber-600'}`} />
              Kredittsaldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className={`text-6xl font-bold mb-2 ${balance < 20 ? 'text-red-500' : 'text-amber-500'}`}>
                {balance}
              </div>
              <p className={`text-lg ${balance < 20 ? 'text-red-700' : 'text-amber-700'}`}>kreditter</p>
            </div>

            <Button
              className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => setIsPurchaseModalOpen(true)}
            >
              Kjop kreditter
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
              {isLoggingOut ? 'Logger ut...' : 'Logg ut'}
            </Button>
          </CardContent>
        </Card>

        {/* Help Link */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <Link
              href="/hjelp"
              className="flex items-center justify-center gap-2 w-full min-h-[48px] text-primary hover:text-primary/80 font-medium"
            >
              <HelpCircle className="w-5 h-5" />
              Hjelp
            </Link>
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
    <Suspense fallback={<div className="container mx-auto p-6"><div className="max-w-2xl mx-auto"><h1 className="text-3xl font-bold mb-6">Instillinger</h1><p>Laster...</p></div></div>}>
      <SettingsContent />
    </Suspense>
  )
}
