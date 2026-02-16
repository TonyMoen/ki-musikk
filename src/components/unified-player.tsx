'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import {
  Play,
  Pause,
  Download,
  ChevronDown,
  ChevronUp,
  X,
  Repeat,
  SkipBack,
  Volume2,
  VolumeX,
  Volume1,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { downloadSong } from '@/lib/utils/download'
import { toast } from '@/hooks/use-toast'
import { useErrorToast } from '@/hooks/use-error-toast'
import { useAudioPlayer } from '@/contexts/audio-player-context'
import { ErrorCode } from '@/lib/error-messages'
import type { Song } from '@/types/song'
import { GENRE_GRADIENTS, DEFAULT_GRADIENT } from '@/lib/genre-colors'

export interface UnifiedPlayerProps {
  songs: Song[]
  initialIndex: number
  onClose: () => void
}

export function UnifiedPlayer({ songs, initialIndex, onClose }: UnifiedPlayerProps) {
  // Shared audio context
  const {
    currentSong: contextSong,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isLooping,
    playSong,
    togglePlayPause,
    seekTo,
    setVolume,
    setLooping,
  } = useAudioPlayer()

  // Local UI state
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isMuted, setIsMuted] = useState(false)
  const [previousVolume, setPreviousVolume] = useState(volume)
  const [isDownloading, setIsDownloading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { showError } = useErrorToast()

  // Current song from local index
  const currentSong = songs[currentIndex]
  const lyrics = currentSong?.optimized_lyrics || currentSong?.original_lyrics || ''

  // Sync currentIndex when context song changes (e.g. auto-advance)
  useEffect(() => {
    if (contextSong) {
      const idx = songs.findIndex((s) => s.id === contextSong.id)
      if (idx >= 0 && idx !== currentIndex) {
        setCurrentIndex(idx)
        setImageLoaded(false)
        setImageError(false)
      }
    }
  }, [contextSong, songs, currentIndex])

  // If the full player opens and no song is playing yet, start playing
  useEffect(() => {
    const song = songs[initialIndex]
    if (song && (!contextSong || contextSong.id !== song.id)) {
      playSong(song, songs)
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Genre gradient for fallback
  const genreGradient = GENRE_GRADIENTS[currentSong?.genre] || DEFAULT_GRADIENT

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Seek
  const handleSeek = useCallback((value: number[]) => {
    seekTo(value[0])
  }, [seekTo])

  // Volume
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (isMuted && newVolume > 0) {
      setIsMuted(false)
    }
  }, [setVolume, isMuted])

  // Mute toggle
  const toggleMute = useCallback(() => {
    if (isMuted) {
      setVolume(previousVolume || 80)
      setIsMuted(false)
    } else {
      setPreviousVolume(volume)
      setVolume(0)
      setIsMuted(true)
    }
  }, [isMuted, volume, previousVolume, setVolume])

  // Back: seek to start or previous song
  const handleBack = useCallback(() => {
    if (currentTime < 3 && currentIndex > 0) {
      const prevSong = songs[currentIndex - 1]
      playSong(prevSong, songs)
    } else {
      seekTo(0)
    }
  }, [currentIndex, currentTime, songs, playSong, seekTo])

  // Navigation
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      const prevSong = songs[currentIndex - 1]
      setImageLoaded(false)
      setImageError(false)
      playSong(prevSong, songs)
    }
  }, [currentIndex, songs, playSong])

  const goToNext = useCallback(() => {
    if (currentIndex < songs.length - 1) {
      const nextSong = songs[currentIndex + 1]
      setImageLoaded(false)
      setImageError(false)
      playSong(nextSong, songs)
    }
  }, [currentIndex, songs, playSong])

  // Download
  const handleDownload = useCallback(async () => {
    if (isDownloading || !currentSong) return
    setIsDownloading(true)
    const result = await downloadSong(currentSong.id, currentSong.title)
    setIsDownloading(false)

    if (result.success) {
      toast({ title: 'Sangen ble lastet ned!' })
    } else if (result.errorCode === 'PURCHASE_REQUIRED') {
      window.location.href = '/priser?from=download'
      return
    } else {
      showError(ErrorCode.SONG_DOWNLOAD_FAILED, { context: 'unified-player-download' })
    }
  }, [currentSong, isDownloading, showError])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlayPause()
          break
        case 'ArrowLeft':
          e.preventDefault()
          goToPrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          goToNext()
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [togglePlayPause, goToPrevious, goToNext, onClose])

  // Volume icon
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2

  // Background
  const showGradient = !currentSong?.image_url || imageError
  const backgroundStyle = showGradient
    ? { background: `linear-gradient(135deg, ${genreGradient.from} 0%, ${genreGradient.to} 100%)` }
    : {}

  if (!currentSong) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={(e) => {
        if (e.target === containerRef.current) onClose()
      }}
    >
      <div
        className="relative flex flex-col overflow-hidden w-[calc(100%-2rem)] max-w-lg h-[70vh] md:h-auto md:max-h-[80vh] rounded-2xl shadow-2xl"
        style={backgroundStyle}
      >
        {/* Background image */}
        {currentSong.image_url && !imageError && (
          <div className="absolute inset-0">
            <Image
              src={currentSong.image_url}
              alt={currentSong.title}
              fill
              className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-start justify-between p-4 pt-6">
          <div className="flex-1 pr-12">
            <h2 className="text-white text-xl font-bold drop-shadow-lg truncate">
              {currentSong.title}
            </h2>
            <p className="text-white/80 text-sm drop-shadow-md">
              {currentSong.genre}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
            aria-label="Lukk avspiller"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Lyrics */}
        <div className="relative z-10 flex-1 min-h-0 overflow-y-auto px-4 pb-4 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {lyrics ? (
            <div className="text-white text-lg leading-relaxed drop-shadow-lg whitespace-pre-line">
              {lyrics}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white/60">
              Ingen sangtekst tilgjengelig
            </div>
          )}
        </div>

        {/* Navigation arrows (desktop) */}
        {songs.length > 1 && (
          <>
            {currentIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-16 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm text-white/70 hover:bg-white/20 hover:text-white transition-all z-20"
                aria-label="Forrige sang"
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
            )}
            {currentIndex < songs.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="hidden md:flex absolute left-1/2 -translate-x-1/2 bottom-36 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm text-white/70 hover:bg-white/20 hover:text-white transition-all z-20"
                aria-label="Neste sang"
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            )}
          </>
        )}

        {/* Bottom controls */}
        <div className="relative z-10 p-4 pb-6 space-y-3">
          {/* Progress bar */}
          <div className="flex items-center gap-2 text-white text-xs">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              disabled={isLoading}
              className="flex-1 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&_[data-disabled]]:opacity-50"
              aria-label="Spor fremgang"
            />
            <span className="w-10">{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="w-10" />

            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                disabled={isLoading}
                className="w-10 h-10 text-white hover:bg-white/20 rounded-full"
                aria-label="Tilbake"
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayPause}
                disabled={isLoading}
                className="w-14 h-14 rounded-full bg-white text-black hover:bg-white/90"
                aria-label={isPlaying ? 'Pause' : 'Spill av'}
              >
                {isLoading ? (
                  <Loader2 className="h-7 w-7 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-7 w-7" />
                ) : (
                  <Play className="h-7 w-7 ml-1" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLooping(!isLooping)}
                disabled={isLoading}
                className={`w-10 h-10 rounded-full ${isLooping ? 'bg-white/30 text-white' : 'text-white hover:bg-white/20'}`}
                aria-label={isLooping ? 'Repeter av' : 'Repeter på'}
              >
                <Repeat className="h-5 w-5" />
              </Button>

              <div className="hidden md:flex items-center gap-2 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="w-8 h-8 text-white hover:bg-white/20 rounded-full"
                  aria-label={isMuted ? 'Slå på lyd' : 'Demp'}
                >
                  <VolumeIcon className="h-4 w-4" />
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-20 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0"
                  aria-label="Volum"
                />
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
              aria-label="Last ned"
            >
              {isDownloading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
