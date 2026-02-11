'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, SlidersHorizontal, ChevronDown, Music, Loader2 } from 'lucide-react'
import { EmptySongLibrary } from '@/components/empty-song-library'
import { TrackListHeader } from '@/components/track-list/track-list-header'
import { TrackRow } from '@/components/track-list/track-row'
import { DeleteSongDialog } from '@/components/track-list/delete-song-dialog'
import { Button } from '@/components/ui/button'
import { downloadSong } from '@/lib/utils/download'
import { toast } from '@/hooks/use-toast'
import { useErrorToast } from '@/hooks/use-error-toast'
import { useAudioPlayer } from '@/contexts/audio-player-context'
import { cn } from '@/lib/utils'
import type { Song } from '@/types/song'

interface SongsPageClientProps {
  initialSongs: Song[]
  userId: string
}

type SortMode = 'newest' | 'alpha' | 'longest'

const SORT_LABELS: Record<SortMode, string> = {
  newest: 'Nyeste først',
  alpha: 'A → Å',
  longest: 'Lengst',
}

const SORT_ORDER: SortMode[] = ['newest', 'alpha', 'longest']

export function SongsPageClient({ initialSongs, userId }: SongsPageClientProps) {
  // Song data
  const [songs, setSongs] = useState<Song[]>(initialSongs)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialSongs.length === 20)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Search & sort
  const [searchQuery, setSearchQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('newest')

  // Delete
  const [deletingSong, setDeletingSong] = useState<Song | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { showError } = useErrorToast()
  const { currentSong, isPlaying, playSong, togglePlayPause, stopAudio } = useAudioPlayer()

  // --- Filtered & sorted songs ---
  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedSongs = [...filteredSongs].sort((a, b) => {
    switch (sortMode) {
      case 'alpha':
        return a.title.localeCompare(b.title, 'nb')
      case 'longest':
        return (b.duration_seconds || 0) - (a.duration_seconds || 0)
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  // --- Total duration for footer ---
  const totalDuration = filteredSongs.reduce((acc, s) => acc + (s.duration_seconds || 0), 0)
  const totalMins = Math.floor(totalDuration / 60)
  const totalSecs = Math.floor(totalDuration % 60)

  // --- Infinite scroll ---
  const loadMoreSongs = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)

    try {
      const response = await fetch(`/api/songs?offset=${songs.length}&limit=20`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) throw new Error('Failed to fetch songs')

      const data = await response.json()
      const newSongs = data.data || []
      setSongs((prev) => [...prev, ...newSongs])
      setHasMore(newSongs.length === 20)
    } catch (error) {
      showError(error, { context: 'load-songs', onRetry: loadMoreSongs })
    } finally {
      setIsLoading(false)
    }
  }, [songs.length, hasMore, isLoading, showError])

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMoreSongs()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [loadMoreSongs, hasMore, isLoading])

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

  // --- Delete handler ---
  const handleDelete = async () => {
    if (!deletingSong) return
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/songs/${deletingSong.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete song')

      if (currentSong?.id === deletingSong.id) {
        stopAudio()
      }

      setSongs((prev) => prev.filter((s) => s.id !== deletingSong.id))
      toast({ title: 'Sang slettet', description: `«${deletingSong.title}» ble slettet.` })
    } catch (error) {
      showError(error, { context: 'delete-song' })
    } finally {
      setIsDeleting(false)
      setDeletingSong(null)
    }
  }

  // --- Sort cycling ---
  const cycleSort = () => {
    const currentIdx = SORT_ORDER.indexOf(sortMode)
    setSortMode(SORT_ORDER[(currentIdx + 1) % SORT_ORDER.length])
  }

  // --- Empty state ---
  if (songs.length === 0 && !isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center p-8 md:p-24 pb-24 md:pb-8">
        <div className="z-10 w-full max-w-3xl">
          <h1 className="text-4xl font-bold mb-8 text-white">Mine sanger</h1>
          <EmptySongLibrary />
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-24 pb-32 md:pb-8">
        <div className="z-10 w-full max-w-3xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Mine sanger</h1>
              <p className="text-sm text-[rgba(130,170,240,0.45)] mt-1">
                {songs.length} {songs.length === 1 ? 'sang' : 'sanger'}
              </p>
            </div>
            <button
              onClick={cycleSort}
              className="flex items-center gap-1.5 text-sm text-[rgba(180,200,240,0.5)] hover:text-white transition-colors self-start sm:self-auto"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>{SORT_LABELS[sortMode]}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgba(130,170,240,0.35)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Søk i sangene dine..."
              className={cn(
                'w-full h-10 pl-10 pr-4 rounded-lg text-sm text-white placeholder:text-[rgba(130,170,240,0.25)]',
                'bg-[rgba(8,16,35,0.7)] border border-[rgba(90,140,255,0.1)]',
                'focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]',
                'transition-colors'
              )}
            />
          </div>

          {/* Track list */}
          {sortedSongs.length > 0 ? (
            <div className="rounded-xl border border-[rgba(90,140,255,0.08)] bg-[rgba(20,40,80,0.15)] overflow-hidden">
              <TrackListHeader />
              <div className="divide-y divide-[rgba(90,140,255,0.05)]">
                {sortedSongs.map((song, index) => (
                  <TrackRow
                    key={song.id}
                    song={song}
                    index={index}
                    isCurrentSong={currentSong?.id === song.id}
                    isPlaying={currentSong?.id === song.id && isPlaying}
                    onPlay={() => playSong(song, sortedSongs)}
                    onPause={togglePlayPause}
                    onDownload={() => handleDownload(song)}
                    onDelete={() => setDeletingSong(song)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-[rgba(130,170,240,0.35)]">
              <Music className="h-7 w-7 mb-3" />
              <p className="text-sm">Ingen sanger funnet</p>
            </div>
          )}

          {/* Load more */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {isLoading ? (
                <div className="flex items-center text-[rgba(180,200,240,0.5)]">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Laster flere sanger...
                </div>
              ) : (
                <Button
                  onClick={loadMoreSongs}
                  variant="outline"
                  className="w-full md:w-auto border-[rgba(90,140,255,0.15)] text-[rgba(180,200,240,0.5)]"
                >
                  Last inn mer
                </Button>
              )}
            </div>
          )}

          {!hasMore && songs.length > 0 && sortedSongs.length > 0 && (
            <div className="text-center text-[rgba(130,170,240,0.25)] text-xs py-8">
              Du har sett alle sangene dine
            </div>
          )}

          {sortedSongs.length > 0 && (
            <div className="flex items-center justify-between text-[rgba(130,170,240,0.25)] text-xs px-1 mt-2">
              <span>
                {searchQuery
                  ? `${filteredSongs.length} av ${songs.length} sanger`
                  : `${songs.length} sanger`}
              </span>
              <span>
                Total: {totalMins}:{totalSecs.toString().padStart(2, '0')} min
              </span>
            </div>
          )}
        </div>
      </main>

      <DeleteSongDialog
        songTitle={deletingSong?.title || null}
        isOpen={!!deletingSong}
        onClose={() => setDeletingSong(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  )
}
