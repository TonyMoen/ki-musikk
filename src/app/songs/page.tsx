import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SongsPageClient } from './songs-page-client'
import { Song } from '@/types/song'

// Convert Supabase null values to undefined for app-level Song type
function convertToSong(row: Record<string, unknown>): Song {
  const converted = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, value === null ? undefined : value])
  )
  return converted as unknown as Song
}

export const metadata = {
  title: 'Mine sanger - KI MUSIKK',
  description: 'Se alle dine genererte norske sanger'
}

export default async function SongsPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch initial songs (first 20) - only completed songs with audio
  const { data: initialSongs, error } = await supabase
    .from('song')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .not('audio_url', 'is', null)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(0, 19) // First 20 songs

  if (error) {
    console.error('Error fetching songs:', error)
    return (
      <main className="flex min-h-screen flex-col items-center p-8 md:p-24">
        <div className="z-10 w-full max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Mine sanger</h1>
          <div className="text-red-500">
            Kunne ikke laste inn sanger. Prøv igjen senere.
          </div>
        </div>
      </main>
    )
  }

  const songs: Song[] = (initialSongs || []).map(convertToSong)
  return <SongsPageClient initialSongs={songs} userId={user.id} />
}
