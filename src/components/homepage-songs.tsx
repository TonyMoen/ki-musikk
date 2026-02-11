'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { TrackListHeader } from '@/components/track-list/track-list-header'
import { TrackRow } from '@/components/track-list/track-row'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { AppLogo } from '@/components/app-logo'
import { useErrorToast } from '@/hooks/use-error-toast'
import { useToast } from '@/hooks/use-toast'
import { useAudioPlayer } from '@/contexts/audio-player-context'
import { useGeneratingSongStore, type GeneratingSong } from '@/stores/generating-song-store'
import { downloadSong } from '@/lib/utils/download'
import { SongThumbnail } from '@/components/track-list/song-thumbnail'
import type { Song } from '@/types/song'

const SONGS_PER_PAGE = 10
const POLLING_INTERVAL = 3000
const MAX_POLLING_ATTEMPTS = 100

export function HomepageSongs() {
  const [songs, setSongs] = useState<Song[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingPage, setIsChangingPage] = useState(false)
  const { showError } = useErrorToast()
  const { toast } = useToast()
  const hasFetchedRef = useRef(false)

  const { currentSong, isPlaying, playSong, togglePlayPause, stopAudio } = useAudioPlayer()

  // Generating songs store
  const { generatingSongs, updateGeneratingSong, removeGeneratingSong } = useGeneratingSongStore()
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
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      )

      if (response.status === 401) {
        setSongs([])
        setHasMore(false)
        return
      }

      if (!response.ok) throw new Error('Failed to fetch songs')

      const data = await response.json()
      const fetchedSongs = data.data || []
      setSongs(fetchedSongs)
      setHasMore(fetchedSongs.length === SONGS_PER_PAGE)
    } catch (error) {
      showError(error, {
        context: 'load-homepage-songs',
        onRetry: () => fetchSongs(showPageLoader),
      })
    } finally {
      setIsLoading(false)
      setIsChangingPage(false)
    }
  }, [currentPage, showError])

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchSongs(false)
    }
  }, [fetchSongs])

  // --- Polling for generating songs ---
  const pollSingleSongStatus = useCallback(async (generatingSong: GeneratingSong) => {
    const songId = generatingSong.id
    const attempts = pollingAttemptsRef.current.get(songId) || 0

    if (attempts >= MAX_POLLING_ATTEMPTS) {
      removeGeneratingSong(songId)
      pollingAttemptsRef.current.delete(songId)
      showError(new Error(`Tidsavbrudd: "${generatingSong.title}" tok for lang tid`), {
        context: 'song-generation-timeout',
      })
      return
    }

    try {
      const response = await fetch(`/api/songs/${songId}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error?.message || 'Failed to fetch song status')

      const song = data.data

      if (song.status === 'partial') {
        pollingAttemptsRef.current.set(songId, attempts + 1)
      } else if (song.status === 'completed') {
        removeGeneratingSong(songId)
        pollingAttemptsRef.current.delete(songId)
        toast({ title: `"${generatingSong.title}" er klar!`, description: 'Sangen er ferdig generert' })
        fetchSongs(false)
      } else if (song.status === 'failed') {
        removeGeneratingSong(songId)
        pollingAttemptsRef.current.delete(songId)
      } else if (song.status === 'cancelled') {
        removeGeneratingSong(songId)
        pollingAttemptsRef.current.delete(songId)
        toast({ title: 'Generering avbrutt', description: `"${generatingSong.title}" ble avbrutt` })
      } else {
        pollingAttemptsRef.current.set(songId, attempts + 1)
      }
    } catch (error) {
      const newAttempts = attempts + 1
      pollingAttemptsRef.current.set(songId, newAttempts)
      if (newAttempts >= 3) {
        removeGeneratingSong(songId)
        pollingAttemptsRef.current.delete(songId)
        showError(new Error(`Kunne ikke hente status for "${generatingSong.title}"`), {
          context: 'song-generation-network-error',
        })
      }
    }
  }, [removeGeneratingSong, showError, toast, fetchSongs])

  const pollAllSongs = useCallback(async () => {
    if (generatingSongs.length === 0) return
    await Promise.all(generatingSongs.map((song) => pollSingleSongStatus(song)))
  }, [generatingSongs, pollSingleSongStatus])

  useEffect(() => {
    if (generatingSongs.length > 0) {
      if (!pollingIntervalRef.current) {
        pollAllSongs()
        pollingIntervalRef.current = setInterval(pollAllSongs, POLLING_INTERVAL)
      }
    } else {
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

  // --- Download handler ---
  const handleDownload = async (song: Song) => {
    const result = await downloadSong(song.id, song.title)
    if (result.success) {
      toast({ title: 'Nedlasting startet', description: song.title })
    } else if (result.errorCode === 'PURCHASE_REQUIRED') {
      toast({
        title: 'Kjøp kreves',
        description: 'Du må kjøpe kreditter for å laste ned sanger.',
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Nedlasting feilet', variant: 'destructive' })
    }
  }

  // --- Pagination ---
  const fetchSongsForPage = async (page: number) => {
    setIsChangingPage(true)
    try {
      const offset = page * SONGS_PER_PAGE
      const response = await fetch(
        `/api/songs?offset=${offset}&limit=${SONGS_PER_PAGE}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      )
      if (response.status === 401) {
        setSongs([])
        setHasMore(false)
        return
      }
      if (!response.ok) throw new Error('Failed to fetch songs')

      const data = await response.json()
      const fetchedSongs = data.data || []
      setSongs(fetchedSongs)
      setHasMore(fetchedSongs.length === SONGS_PER_PAGE)
    } catch (error) {
      showError(error, { context: 'load-homepage-songs', onRetry: () => fetchSongsForPage(page) })
    } finally {
      setIsChangingPage(false)
    }
  }

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

  const hasPrevious = currentPage > 0

  // Loading
  if (isLoading && songs.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[rgba(130,170,240,0.45)]" />
      </div>
    )
  }

  // Empty state
  if (!isLoading && songs.length === 0 && currentPage === 0 && generatingSongs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <AppLogo size={32} />
        </div>
        <h3 className="text-lg font-semibold mb-2">Ingen sanger ennå</h3>
        <p className="text-[rgba(180,200,240,0.5)] text-sm">
          Lag din første sang ovenfor, så vises den her!
        </p>
      </div>
    )
  }

  const hasContent = songs.length > 0 || generatingSongs.length > 0

  return (
    <>
      {/* Generating songs indicator */}
      {currentPage === 0 && generatingSongs.length > 0 && (
        <div className="space-y-2 mb-4">
          {generatingSongs.map((genSong) => (
            <div
              key={`generating-${genSong.id}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[rgba(90,140,255,0.08)] bg-[rgba(20,40,80,0.15)] animate-pulse"
            >
              <SongThumbnail
                song={{ id: genSong.id, title: genSong.title, genre: genSong.genre }}
                size={40}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{genSong.title}</p>
                <p className="text-xs text-[rgba(130,170,240,0.45)]">Genererer...</p>
              </div>
              <Loader2 className="h-4 w-4 animate-spin text-[#F26522] flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Track list */}
      {songs.length > 0 && (
        <div className="rounded-xl border border-[rgba(90,140,255,0.08)] bg-[rgba(20,40,80,0.15)] overflow-hidden">
          <TrackListHeader />
          <div className="divide-y divide-[rgba(90,140,255,0.05)]">
            {songs.map((song, index) => (
              <TrackRow
                key={song.id}
                song={song}
                index={index}
                isCurrentSong={currentSong?.id === song.id}
                isPlaying={currentSong?.id === song.id && isPlaying}
                onPlay={() => playSong(song, songs)}
                onPause={togglePlayPause}
                onDownload={() => handleDownload(song)}
                onDelete={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading overlay for page changes */}
      {isChangingPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-[rgba(130,170,240,0.45)]" />
        </div>
      )}

      {/* Pagination */}
      {(hasPrevious || hasMore) && !isChangingPage && (
        <div className="flex justify-center gap-4 mt-6 mb-8">
          <Button
            variant="outline"
            onClick={handlePreviousPage}
            disabled={!hasPrevious}
            className="flex items-center gap-2 border-[rgba(90,140,255,0.15)] text-[rgba(180,200,240,0.5)] hover:bg-[rgba(242,101,34,0.1)] hover:text-[#F26522] hover:border-[#F26522]/40"
          >
            <ChevronLeft className="h-4 w-4" />
            Forrige
          </Button>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={!hasMore}
            className="flex items-center gap-2 border-[rgba(90,140,255,0.15)] text-[rgba(180,200,240,0.5)] hover:bg-[rgba(242,101,34,0.1)] hover:text-[#F26522] hover:border-[#F26522]/40"
          >
            Neste
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  )
}
