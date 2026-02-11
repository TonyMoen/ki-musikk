'use client'

import { useState } from 'react'
import { useAudioPlayer } from '@/contexts/audio-player-context'
import { NowPlayingBar } from '@/components/track-list/now-playing-bar'
import { UnifiedPlayer } from '@/components/unified-player'
import { downloadSong } from '@/lib/utils/download'
import { toast } from '@/hooks/use-toast'

export function GlobalPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    queue,
    volume,
    togglePlayPause,
    openFullPlayer,
    closeFullPlayer,
    isFullPlayerOpen,
    setVolume,
    seekTo,
  } = useAudioPlayer()

  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!currentSong) return
    setIsDownloading(true)
    try {
      const result = await downloadSong(currentSong.id, currentSong.title)
      if (result.success) {
        toast({ title: 'Nedlasting startet', description: currentSong.title })
      } else if (result.errorCode === 'PURCHASE_REQUIRED') {
        toast({
          title: 'Kjøp kreves',
          description: 'Du må kjøpe kreditter for å laste ned sanger.',
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Nedlasting feilet', variant: 'destructive' })
      }
    } finally {
      setIsDownloading(false)
    }
  }

  // UnifiedPlayer index
  const fullPlayerIndex = currentSong
    ? Math.max(queue.findIndex((s) => s.id === currentSong.id), 0)
    : 0

  const playerSongs = queue.length > 0 ? queue : currentSong ? [currentSong] : []

  return (
    <>
      {/* Now Playing Bar — visible when song loaded and full player closed */}
      {currentSong && !isFullPlayerOpen && (
        <NowPlayingBar
          song={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          onTogglePlay={togglePlayPause}
          onOpenFullPlayer={openFullPlayer}
          onDownload={handleDownload}
          onVolumeChange={setVolume}
          onSeek={seekTo}
          isDownloading={isDownloading}
        />
      )}

      {/* Full Player */}
      {isFullPlayerOpen && playerSongs.length > 0 && (
        <UnifiedPlayer
          songs={playerSongs}
          initialIndex={fullPlayerIndex}
          onClose={closeFullPlayer}
        />
      )}
    </>
  )
}
