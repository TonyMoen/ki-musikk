import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHENTICATED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    // Query user profile with credit balance
    const { data: profile, error: profileError } = await supabase
      .from('user_profile')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch profile' } },
        { status: 500 }
      )
    }

    // Parse query parameters for pagination and filtering
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const type = searchParams.get('type') || 'all'
    const pageSize = 10

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize

    // Build transaction query with optional filtering
    let transactionQuery = supabase
      .from('credit_transaction')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    // Apply transaction type filter if specified
    if (type !== 'all' && (type === 'purchase' || type === 'deduction' || type === 'refund')) {
      transactionQuery = transactionQuery.eq('transaction_type', type)
    }

    const { data: transactions, count, error: transactionError } = await transactionQuery

    if (transactionError) {
      console.error('Error fetching transactions:', transactionError)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch transactions' } },
        { status: 500 }
      )
    }

    // Calculate pagination metadata
    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / pageSize)

    return NextResponse.json({
      data: {
        profile: {
          id: profile.id,
          display_name: profile.display_name,
          email: session.user.email,
          credit_balance: profile.credit_balance,
          created_at: profile.created_at
        },
        balance: profile.credit_balance,
        transactions: transactions || [],
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          pageSize
        }
      }
    })
  } catch (error) {
    console.error('Unexpected error in balance API:', error)
    return NextResponse.json(
      { error: { code: 'DATABASE_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
