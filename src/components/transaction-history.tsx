'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatTransactionDate } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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

interface TransactionHistoryProps {
  transactions: CreditTransaction[]
  pagination: Pagination
}

export function TransactionHistory({
  transactions: initialTransactions,
  pagination: initialPagination
}: TransactionHistoryProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [transactions, setTransactions] = useState<CreditTransaction[]>(initialTransactions)
  const [pagination, setPagination] = useState<Pagination>(initialPagination)
  const [isLoading, setIsLoading] = useState(false)

  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const currentFilter = searchParams.get('type') || 'all'

  useEffect(() => {
    setTransactions(initialTransactions)
    setPagination(initialPagination)
  }, [initialTransactions, initialPagination])

  const updateURL = (page: number, type: string) => {
    const params = new URLSearchParams()
    if (page > 1) params.set('page', page.toString())
    if (type !== 'all') params.set('type', type)
    router.push(`/settings${params.toString() ? '?' + params.toString() : ''}`)
  }

  const handlePageChange = async (newPage: number) => {
    setIsLoading(true)
    updateURL(newPage, currentFilter)

    // Fetch new data
    const params = new URLSearchParams()
    params.set('page', newPage.toString())
    if (currentFilter !== 'all') params.set('type', currentFilter)

    const response = await fetch(`/api/credits/balance?${params.toString()}`)
    const data = await response.json()

    if (data.data) {
      setTransactions(data.data.transactions)
      setPagination(data.data.pagination)
    }
    setIsLoading(false)
  }

  const handleFilterChange = async (type: string) => {
    setIsLoading(true)
    updateURL(1, type) // Reset to page 1 when filter changes

    // Fetch new data
    const params = new URLSearchParams()
    if (type !== 'all') params.set('type', type)

    const response = await fetch(`/api/credits/balance?${params.toString()}`)
    const data = await response.json()

    if (data.data) {
      setTransactions(data.data.transactions)
      setPagination(data.data.pagination)
    }
    setIsLoading(false)
  }

  const getTypeBadgeVariant = (type: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (type) {
      case 'purchase':
        return 'default' // Green
      case 'deduction':
        return 'destructive' // Red
      case 'refund':
        return 'secondary' // Yellow
      default:
        return 'outline'
    }
  }

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'purchase':
        return 'KJØP'
      case 'deduction':
        return 'TREKK'
      case 'refund':
        return 'REFUSJON'
      default:
        return type.toUpperCase()
    }
  }

  const formatAmount = (amount: number, type: string) => {
    const prefix = type === 'deduction' ? '-' : '+'
    return `${prefix}${Math.abs(amount)} kreditter`
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">Ingen transaksjoner ennå</p>
        <p className="text-sm mt-2">Kjøp kreditter for å komme i gang!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Transaksjonshistorikk</h3>
        <Select value={currentFilter} onValueChange={handleFilterChange} disabled={isLoading}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer etter type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle transaksjoner</SelectItem>
            <SelectItem value="purchase">Kjøp</SelectItem>
            <SelectItem value="deduction">Trekk</SelectItem>
            <SelectItem value="refund">Refusjoner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Beløp</TableHead>
              <TableHead>Beskrivelse</TableHead>
              <TableHead>Dato</TableHead>
              <TableHead className="text-right">Saldo etter</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <Badge variant={getTypeBadgeVariant(transaction.transaction_type)}>
                    {getTypeLabel(transaction.transaction_type)}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {formatAmount(transaction.amount, transaction.transaction_type)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{transaction.description}</span>
                    {transaction.stripe_session_id && (
                      <span className="text-xs text-gray-500">
                        Økt: {transaction.stripe_session_id.substring(0, 12)}...
                      </span>
                    )}
                    {transaction.song_id && (
                      <a
                        href={`/songs/${transaction.song_id}`}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Se sang
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatTransactionDate(transaction.created_at)}</TableCell>
                <TableCell className="text-right font-medium">
                  {transaction.balance_after} kreditter
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Side {pagination.currentPage} av {pagination.totalPages}
            {' '}({pagination.totalCount} totalt)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Forrige
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages || isLoading}
            >
              Neste
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
