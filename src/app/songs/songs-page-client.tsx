'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { SongCard } from '@/components/song-card'
import { EmptySongLibrary } from '@/components/empty-song-library'
import { SongPlayerCard } from '@/components/song-player-card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import type { Song } from '@/types/song'

interface SongsPageClientProps {
  initialSongs: Song[]
  userId: string
}

export function SongsPageClient({
  initialSongs,
  userId
}: SongsPageClientProps) {
  const [songs, setSongs] = useState<Song[]>(initialSongs)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialSongs.length === 20)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Load more songs function
  const loadMoreSongs = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)

    try {
      const response = await fetch(
        `/api/songs?offset=${songs.length}&limit=20`,
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
      const newSongs = data.data || []

      setSongs((prev) => [...prev, ...newSongs])
      setHasMore(newSongs.length === 20)
    } catch (error) {
      console.error('Error loading more songs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [songs.length, hasMore, isLoading])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMoreSongs()
        }
      },
      {
        threshold: 0.1
      }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [loadMoreSongs, hasMore, isLoading])

  // Handle song card click
  const handleSongClick = (song: Song) => {
    setSelectedSong(song)
    setIsModalOpen(true)
  }

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false)
    // Small delay before clearing selected song to allow animation
    setTimeout(() => setSelectedSong(null), 200)
  }

  // Empty state
  if (songs.length === 0 && !isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center p-8 md:p-24 pb-24 md:pb-8">
        <div className="z-10 w-full max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Mine sanger</h1>
          <EmptySongLibrary />
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center p-8 md:p-24 pb-24 md:pb-8">
        <div className="z-10 w-full max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Mine sanger</h1>

          {/* Songs grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onClick={() => handleSongClick(song)}
              />
            ))}
          </div>

          {/* Load more indicator / button */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {isLoading ? (
                <div className="flex items-center text-gray-600">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Laster flere sanger...
                </div>
              ) : (
                <Button
                  onClick={loadMoreSongs}
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  Last inn mer
                </Button>
              )}
            </div>
          )}

          {/* End of list message */}
          {!hasMore && songs.length > 0 && (
            <div className="text-center text-gray-500 text-sm py-8">
              Du har sett alle sangene dine
            </div>
          )}
        </div>
      </main>

      {/* Song Player Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl p-6">
          {selectedSong && selectedSong.audio_url && (
            <SongPlayerCard
              songId={selectedSong.id}
              title={selectedSong.title}
              genre={selectedSong.genre}
              audioUrl={selectedSong.audio_url}
              duration={selectedSong.duration_seconds}
              createdAt={selectedSong.created_at}
              isPreview={selectedSong.is_preview}
            />
          )}
          {selectedSong && !selectedSong.audio_url && (
            <div className="text-center py-8 text-gray-600">
              Sangen er ikke klar ennå. Prøv igjen om litt.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
