'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { SongCard } from '@/components/song-card'
import { UnifiedPlayer } from '@/components/unified-player'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { AppLogo } from '@/components/app-logo'
import { useErrorToast } from '@/hooks/use-error-toast'
import { useToast } from '@/hooks/use-toast'
import { useGeneratingSongStore, type GeneratingSong } from '@/stores/generating-song-store'
import type { Song } from '@/types/song'

const SONGS_PER_PAGE = 10
const POLLING_INTERVAL = 3000 // 3 seconds - faster detection
const MAX_POLLING_ATTEMPTS = 100 // 100 × 3s = 5 minutes max

export function HomepageSongs() {
  const [songs, setSongs] = useState<Song[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingPage, setIsChangingPage] = useState(false)
  const [selectedSongIndex, setSelectedSongIndex] = useState<number | null>(null)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const { showError } = useErrorToast()
  const { toast } = useToast()
  const hasFetchedRef = useRef(false)

  // Generating songs store (supports multiple concurrent)
  const { generatingSongs, updateGeneratingSong, removeGeneratingSong } = useGeneratingSongStore()
  // Track polling attempts per song
  const pollingAttemptsRef = useRef<Map<string, number>>(new Map())
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch songs for current page
  const fetchSongs = useCallback(async (showPageLoader = false) => {
    if (showPageLoader) {
      setIsChangingPage(true)
    } else {
      setIsLoading(true)
    }

    try {
      const offset = currentPage * SONGS_PER_PAGE
      const response = await fetch(
        `/api/songs?offset=${offset}&limit=${SONGS_PER_PAGE}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      // If not logged in (401), just show empty list - no error
      if (response.status === 401) {
        setSongs([])
        setHasMore(false)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch songs')
      }

      const data = await response.json()
      const fetchedSongs = data.data || []

      setSongs(fetchedSongs)
      setHasMore(fetchedSongs.length === SONGS_PER_PAGE)
    } catch (error) {
      showError(error, {
        context: 'load-homepage-songs',
        onRetry: () => fetchSongs(showPageLoader)
      })
    } finally {
      setIsLoading(false)
      setIsChangingPage(false)
    }
  }, [currentPage, showError])

  // Initial load only
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchSongs(false)
    }
  }, [fetchSongs])

  // Poll status for a single generating song
  const pollSingleSongStatus = useCallback(async (generatingSong: GeneratingSong) => {
    const songId = generatingSong.id
    const attempts = pollingAttemptsRef.current.get(songId) || 0

    if (attempts >= MAX_POLLING_ATTEMPTS) {
      removeGeneratingSong(songId)
      pollingAttemptsRef.current.delete(songId)
      showError(new Error(`Tidsavbrudd: "${generatingSong.title}" tok for lang tid`), {
        context: 'song-generation-timeout'
      })
      return
    }

    try {
      const response = await fetch(`/api/songs/${songId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch song status')
      }

      const song = data.data

      if (song.status === 'partial') {
        // Still generating — keep polling, no preview
        pollingAttemptsRef.current.set(songId, attempts + 1)
      } else if (song.status === 'completed') {
        // Success - remove from generating and refresh list
        removeGeneratingSong(songId)
        pollingAttemptsRef.current.delete(songId)

        toast({
          title: `"${generatingSong.title}" er klar!`,
          description: 'Sangen er ferdig generert'
        })

        // Refresh songs list to show the new song
        fetchSongs(false)
      } else if (song.status === 'failed') {
        // Failed - remove from generating
        removeGeneratingSong(songId)
        pollingAttemptsRef.current.delete(songId)
        console.warn(`Song generation failed for "${generatingSong.title}":`, song.errorMessage)
      } else if (song.status === 'cancelled') {
        // Cancelled
        removeGeneratingSong(songId)
        pollingAttemptsRef.current.delete(songId)
        toast({
          title: 'Generering avbrutt',
          description: `"${generatingSong.title}" ble avbrutt`
        })
      } else {
        // Still generating
        pollingAttemptsRef.current.set(songId, attempts + 1)
      }
    } catch (error) {
      console.error(`Polling error for song ${songId}:`, error)
      const newAttempts = attempts + 1
      pollingAttemptsRef.current.set(songId, newAttempts)

      // After 3 consecutive failures for this song, remove it
      if (newAttempts >= 3) {
        removeGeneratingSong(songId)
        pollingAttemptsRef.current.delete(songId)
        showError(new Error(`Kunne ikke hente status for "${generatingSong.title}"`), {
          context: 'song-generation-network-error'
        })
      }
    }
  }, [updateGeneratingSong, removeGeneratingSong, showError, toast, fetchSongs])

  // Poll all generating songs
  const pollAllSongs = useCallback(async () => {
    if (generatingSongs.length === 0) return
    // Poll all songs in parallel
    await Promise.all(generatingSongs.map(song => pollSingleSongStatus(song)))
  }, [generatingSongs, pollSingleSongStatus])

  // Start/stop polling when generating songs change
  useEffect(() => {
    if (generatingSongs.length > 0) {
      // Start polling if not already
      if (!pollingIntervalRef.current) {
        pollAllSongs() // Poll immediately
        pollingIntervalRef.current = setInterval(pollAllSongs, POLLING_INTERVAL)
      }
    } else {
      // Stop polling when no songs are generating
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [generatingSongs.length, pollAllSongs])

  // Handle song card click - open unified player at clicked song index
  const handleSongClick = (song: Song, index: number) => {
    setSelectedSongIndex(index)
    setIsPlayerOpen(true)
  }

  // Handle player close
  const handleClosePlayer = () => {
    setIsPlayerOpen(false)
    setSelectedSongIndex(null)
  }

  // Navigation handlers
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      fetchSongsForPage(newPage)
    }
  }

  const handleNextPage = () => {
    if (hasMore) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      fetchSongsForPage(newPage)
    }
  }

  // Fetch for specific page (used by pagination)
  const fetchSongsForPage = async (page: number) => {
    setIsChangingPage(true)

    try {
      const offset = page * SONGS_PER_PAGE
      const response = await fetch(
        `/api/songs?offset=${offset}&limit=${SONGS_PER_PAGE}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      // If not logged in (401), just show empty list - no error
      if (response.status === 401) {
        setSongs([])
        setHasMore(false)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch songs')
      }

      const data = await response.json()
      const fetchedSongs = data.data || []

      setSongs(fetchedSongs)
      setHasMore(fetchedSongs.length === SONGS_PER_PAGE)
    } catch (error) {
      showError(error, {
        context: 'load-homepage-songs',
        onRetry: () => fetchSongsForPage(page)
      })
    } finally {
      setIsChangingPage(false)
    }
  }

  const hasPrevious = currentPage > 0

  // Loading state
  if (isLoading && songs.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  // Empty state (don't show if songs are generating)
  if (!isLoading && songs.length === 0 && currentPage === 0 && generatingSongs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <AppLogo size={32} />
        </div>
        <h3 className="text-lg font-semibold mb-2">Ingen sanger ennå</h3>
        <p className="text-gray-600 text-sm">
          Lag din første sang ovenfor, så vises den her!
        </p>
      </div>
    )
  }

  // Check if we have content to show (songs or generating songs)
  const hasContent = songs.length > 0 || generatingSongs.length > 0

  return (
    <>
      {/* Songs grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${(hasPrevious || hasMore) ? 'mb-6' : ''}`}>
        {/* Generating songs at top (only on first page) */}
        {currentPage === 0 && generatingSongs.map((genSong) => (
          <SongCard
            key={`generating-${genSong.id}`}
            song={{
              id: genSong.id,
              title: genSong.title,
              genre: genSong.genre,
              duration_seconds: undefined,
              created_at: genSong.startedAt.toISOString(),
            }}
            onClick={() => {}}
            isGenerating
          />
        ))}
        {/* Regular songs */}
        {songs.map((song, index) => (
          <SongCard
            key={song.id}
            song={song}
            onClick={() => handleSongClick(song, index)}
          />
        ))}
      </div>

      {/* Show generating indicator when no songs yet */}
      {!hasContent && isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Loading overlay for page changes only */}
      {isChangingPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      )}

      {/* Pagination controls - only show if there are multiple pages */}
      {(hasPrevious || hasMore) && !isChangingPage && (
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={handlePreviousPage}
            disabled={!hasPrevious}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Forrige
          </Button>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={!hasMore}
            className="flex items-center gap-2"
          >
            Neste
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Unified Player */}
      {isPlayerOpen && selectedSongIndex !== null && songs.length > 0 && (
        <UnifiedPlayer
          songs={songs}
          initialIndex={selectedSongIndex}
          onClose={handleClosePlayer}
        />
      )}
    </>
  )
}
