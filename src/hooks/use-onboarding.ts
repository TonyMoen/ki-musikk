'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseOnboardingReturn {
  showOnboarding: boolean
  completeOnboarding: () => Promise<void>
  isLoading: boolean
}

/**
 * Hook to manage onboarding state for first-time users.
 * Fetches onboarding_completed status from user_profile on mount,
 * and provides a function to mark onboarding as complete.
 */
export function useOnboarding(): UseOnboardingReturn {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function checkOnboardingStatus() {
      try {
        const supabase = createClient()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (!isMounted) return

        if (authError || !user) {
          // Not logged in - don't show onboarding
          setIsLoading(false)
          return
        }

        // Fetch user profile to check onboarding status
        const { data: profile, error: profileError } = await supabase
          .from('user_profile')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        if (!isMounted) return

        if (profileError) {
          console.error('Failed to fetch onboarding status:', profileError)
          setIsLoading(false)
          return
        }

        // TEMPORARILY DISABLED: Show onboarding if not completed
        // setShowOnboarding(!profile?.onboarding_completed)
        setShowOnboarding(false)
        setIsLoading(false)
      } catch (err) {
        if (!isMounted) return
        console.error('Unexpected error checking onboarding:', err)
        setIsLoading(false)
      }
    }

    checkOnboardingStatus()

    return () => {
      isMounted = false
    }
  }, [])

  const completeOnboarding = useCallback(async () => {
    try {
      const supabase = createClient()

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('Cannot complete onboarding - not logged in')
        return
      }

      // Update user profile
      const { error: updateError } = await supabase
        .from('user_profile')
        .update({ onboarding_completed: true })
        .eq('id', user.id)

      if (updateError) {
        console.error('Failed to update onboarding status:', updateError)
        return
      }

      // Hide onboarding modal
      setShowOnboarding(false)
    } catch (err) {
      console.error('Unexpected error completing onboarding:', err)
    }
  }, [])

  return { showOnboarding, completeOnboarding, isLoading }
}
