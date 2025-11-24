// Preview generation limit checking for Musikkfabrikken
// Enforces 1 free preview per user per 24 hours to prevent spam

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Check if user has exceeded preview generation limit
 * @param userId - User's UUID
 * @returns {Promise<{allowed: boolean, remainingHours?: number}>}
 */
export async function checkPreviewLimit(
  userId: string
): Promise<{ allowed: boolean; remainingHours?: number; message?: string }> {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Calculate timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    // Count preview songs created by user in last 24 hours
    const { data, error, count } = await supabase
      .from('song')
      .select('id, created_at', { count: 'exact', head: false })
      .eq('user_id', userId)
      .eq('is_preview', true)
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('[Preview Limits] Database query error:', error)
      // Fail open - allow preview if we can't check (avoid blocking users)
      return {
        allowed: true,
        message: 'Kunne ikke sjekke grense, tillater forhåndsvisning'
      }
    }

    // If no previews found in last 24 hours, allow
    if (!count || count === 0) {
      return {
        allowed: true,
        message: 'Du kan generere en gratis forhåndsvisning'
      }
    }

    // If previews exist, check the most recent one
    if (data && data.length > 0) {
      const lastPreview = data[0]
      const lastPreviewTime = new Date(lastPreview.created_at)
      const now = new Date()
      const hoursSinceLastPreview = (now.getTime() - lastPreviewTime.getTime()) / (1000 * 60 * 60)
      const remainingHours = Math.ceil(24 - hoursSinceLastPreview)

      // If less than 24 hours, deny
      if (remainingHours > 0) {
        return {
          allowed: false,
          remainingHours,
          message: `Du har allerede opprettet en gratis forhåndsvisning i dag. Prøv igjen om ${remainingHours} ${remainingHours === 1 ? 'time' : 'timer'}.`
        }
      }
    }

    // Allow if 24+ hours have passed
    return {
      allowed: true,
      message: 'Du kan generere en gratis forhåndsvisning'
    }
  } catch (error) {
    console.error('[Preview Limits] Unexpected error:', error)
    // Fail open - allow preview on unexpected errors
    return {
      allowed: true,
      message: 'Kunne ikke sjekke grense, tillater forhåndsvisning'
    }
  }
}

/**
 * Get preview count for user in last 24 hours
 * @param userId - User's UUID
 * @returns {Promise<number>} Count of previews
 */
export async function getPreviewCount(userId: string): Promise<number> {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const { count, error } = await supabase
      .from('song')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_preview', true)
      .gte('created_at', twentyFourHoursAgo.toISOString())

    if (error) {
      console.error('[Preview Limits] Error getting preview count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('[Preview Limits] Unexpected error getting count:', error)
    return 0
  }
}
