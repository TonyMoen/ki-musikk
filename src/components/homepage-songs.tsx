'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { SongCard } from '@/components/song-card'
import { SongPlayerCard } from '@/components/song-player-card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useErrorToast } from '@/hooks/use-error-toast'
import { useToast } from '@/hooks/use-toast'
import { useGeneratingSongStore } from '@/stores/generating-song-store'
import type { Song } from '@/types/song'

const SONGS_PER_PAGE = 10
const POLLING_INTERVAL = 5000 // 5 seconds
const MAX_POLLING_ATTEMPTS = 60 // 5 minutes max

export function HomepageSongs() {
  const [songs, setSongs] = useState<Song[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingPage, setIsChangingPage] = useState(false)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { showError } = useErrorToast()
  const { toast } = useToast()
  const hasFetchedRef = useRef(false)

  // Generating song store
  const { generatingSong, updateGeneratingSong, clearGeneratingSong } = useGeneratingSongStore()
  const pollingAttemptsRef = useRef(0)
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

  // Poll generating song status
  const pollSongStatus = useCallback(async () => {
    if (!generatingSong) return

    if (pollingAttemptsRef.current >= MAX_POLLING_ATTEMPTS) {
      clearGeneratingSong()
      showError(new Error('Tidsavbrudd: Genereringen tok for lang tid'), {
        context: 'song-generation-timeout'
      })
      return
    }

    try {
      const response = await fetch(`/api/songs/${generatingSong.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch song status')
      }

      const song = data.data

      if (song.status === 'partial') {
        // Early playback available (FIRST_SUCCESS)
        // Update store with stream URL but KEEP polling for final audio
        if (song.streamAudioUrl && !generatingSong?.isPartial) {
          updateGeneratingSong({
            isPartial: true,
            streamAudioUrl: song.streamAudioUrl,
            duration: song.duration
          })

          toast({
            title: 'Klar til avspilling! 🎵',
            description: 'Du kan nå spille av sangen mens vi ferdigstiller'
          })
        }
        // Continue polling for completed status
        pollingAttemptsRef.current++
      } else if (song.status === 'completed') {
        // Success - clear store and refresh list
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
        clearGeneratingSong()
        pollingAttemptsRef.current = 0

        // Only show toast if we weren't already in partial state
        if (!generatingSong?.isPartial) {
          toast({
            title: 'Sangen er klar! 🎉',
            description: 'Din norske sang er ferdig generert'
          })
        } else {
          toast({
            title: 'Ferdigstilt! ✨',
            description: 'Sangen er nå ferdig generert i full kvalitet'
          })
        }

        // Refresh songs list to show the new song
        fetchSongs(false)
      } else if (song.status === 'failed') {
        // Failed - clear store and show error
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
        clearGeneratingSong()
        pollingAttemptsRef.current = 0

        showError(new Error(song.error_message || 'Noe gikk galt under genereringen'), {
          context: 'song-generation-failed'
        })
      } else if (song.status === 'cancelled') {
        // Cancelled - clear store
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
        clearGeneratingSong()
        pollingAttemptsRef.current = 0

        toast({
          title: 'Generering avbrutt',
          description: 'Sanggenereringen ble avbrutt'
        })
      }

      pollingAttemptsRef.current++
    } catch (error) {
      console.error('Polling error:', error)
      pollingAttemptsRef.current++

      // After 3 consecutive failures, show error and stop
      if (pollingAttemptsRef.current >= 3) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
        clearGeneratingSong()
        pollingAttemptsRef.current = 0

        showError(new Error('Kunne ikke hente status. Sjekk nettverksforbindelsen.'), {
          context: 'song-generation-network-error'
        })
      }
    }
  }, [generatingSong, updateGeneratingSong, clearGeneratingSong, showError, toast, fetchSongs])

  // Start/stop polling when generating song changes
  useEffect(() => {
    if (generatingSong) {
      // Start polling
      pollingAttemptsRef.current = 0
      pollSongStatus() // Poll immediately
      pollingIntervalRef.current = setInterval(pollSongStatus, POLLING_INTERVAL)
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [generatingSong, pollSongStatus])

  // Handle song card click
  const handleSongClick = (song: Song) => {
    setSelectedSong(song)
    setIsModalOpen(true)
  }

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedSong(null), 200)
  }

  // Handle song deletion - refresh current page
  const handleSongDelete = () => {
    fetchSongs()
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

  // Empty state (don't show if a song is generating)
  if (!isLoading && songs.length === 0 && currentPage === 0 && !generatingSong) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="text-5xl mb-4">🎵</div>
        <h3 className="text-lg font-semibold mb-2">Ingen sanger ennå</h3>
        <p className="text-gray-600 text-sm">
          Lag din første sang ovenfor, så vises den her!
        </p>
      </div>
    )
  }

  // Check if we have content to show (songs or generating song)
  const hasContent = songs.length > 0 || generatingSong

  return (
    <>
      {/* Songs grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${(hasPrevious || hasMore) ? 'mb-6' : ''}`}>
        {/* Generating song at top (only on first page) */}
        {generatingSong && currentPage === 0 && (
          <SongCard
            key={`generating-${generatingSong.id}`}
            song={{
              id: generatingSong.id,
              title: generatingSong.title,
              genre: generatingSong.genre,
              duration_seconds: generatingSong.duration,
              created_at: generatingSong.startedAt.toISOString(),
            }}
            onClick={() => {
              // Allow click only if partial (has audio ready)
              if (generatingSong.isPartial && generatingSong.streamAudioUrl) {
                setSelectedSong({
                  id: generatingSong.id,
                  user_id: '',
                  title: generatingSong.title,
                  genre: generatingSong.genre,
                  status: 'partial',
                  stream_audio_url: generatingSong.streamAudioUrl,
                  duration_seconds: generatingSong.duration,
                  phonetic_enabled: false,
                  shared_count: 0,
                  created_at: generatingSong.startedAt.toISOString(),
                  updated_at: new Date().toISOString(),
                })
                setIsModalOpen(true)
              }
            }}
            isGenerating={!generatingSong.isPartial}
            isPartial={generatingSong.isPartial}
          />
        )}
        {/* Regular songs */}
        {songs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            onClick={() => handleSongClick(song)}
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

      {/* Song Player Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl p-6">
          {selectedSong && (selectedSong.audio_url || selectedSong.stream_audio_url) && (
            <SongPlayerCard
              songId={selectedSong.id}
              title={selectedSong.title}
              genre={selectedSong.genre}
              audioUrl={selectedSong.audio_url || selectedSong.stream_audio_url || ''}
              duration={selectedSong.duration_seconds}
              createdAt={selectedSong.created_at}
              isPreview={selectedSong.is_preview}
              isPartial={selectedSong.status === 'partial'}
              onDelete={handleSongDelete}
              onClose={handleCloseModal}
            />
          )}
          {selectedSong && !selectedSong.audio_url && !selectedSong.stream_audio_url && (
            <div className="text-center py-8 text-gray-600">
              Sangen er ikke klar ennå. Prøv igjen om litt.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
