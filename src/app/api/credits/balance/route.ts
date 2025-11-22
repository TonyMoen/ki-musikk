import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
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

    return NextResponse.json({
      data: {
        profile: {
          id: profile.id,
          display_name: profile.display_name,
          email: session.user.email,
          credit_balance: profile.credit_balance,
          created_at: profile.created_at
        },
        balance: profile.credit_balance
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
