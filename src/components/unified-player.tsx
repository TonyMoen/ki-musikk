'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Howl } from 'howler'
import Image from 'next/image'
import {
  Play,
  Pause,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
import { ErrorCode } from '@/lib/error-messages'
import type { Song } from '@/types/song'

interface GradientColors {
  from: string
  to: string
}

// Genre to gradient mapping (fallback colors when no image)
const GENRE_GRADIENTS: Record<string, GradientColors> = {
  'country-rock': { from: '#E94560', to: '#FFC93C' },
  'norwegian-pop': { from: '#0F3460', to: '#E94560' },
  'folk-ballad': { from: '#06D6A0', to: '#FFC93C' },
  'party-anthem': { from: '#FFC93C', to: '#E94560' },
  'rap-hiphop': { from: '#0F3460', to: '#8B5CF6' },
  'rock-ballad': { from: '#8B5CF6', to: '#E94560' },
  'electronic-dance': { from: '#06D6A0', to: '#3B82F6' },
  'singer-songwriter': { from: '#FB923C', to: '#92400E' },
}

const DEFAULT_GRADIENT: GradientColors = { from: '#E94560', to: '#FFC93C' }

export interface UnifiedPlayerProps {
  songs: Song[]
  initialIndex: number
  onClose: () => void
}

export function UnifiedPlayer({ songs, initialIndex, onClose }: UnifiedPlayerProps) {
  // State
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Refs
  const soundRef = useRef<Howl | null>(null)
  const animationFrameRef = useRef<number>()
  const containerRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { showError } = useErrorToast()

  // Current song
  const currentSong = songs[currentIndex]
  const audioUrl = currentSong?.audio_url || currentSong?.stream_audio_url || ''
  const lyrics = currentSong?.optimized_lyrics || currentSong?.original_lyrics || ''

  // Genre gradient for fallback
  const genreGradient = GENRE_GRADIENTS[currentSong?.genre] || DEFAULT_GRADIENT

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Initialize Howler.js
  useEffect(() => {
    if (!audioUrl) {
      setIsLoading(false)
      return
    }

    // Clean up previous sound
    if (soundRef.current) {
      soundRef.current.unload()
    }

    setIsLoading(true)
    setCurrentTime(0)
    setImageLoaded(false)

    const sound = new Howl({
      src: [audioUrl],
      html5: true,
      preload: true,
      volume: volume / 100,
      loop: isLooping,
      onload: () => {
        setIsLoading(false)
        setDuration(sound.duration())
      },
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
      onend: () => {
        if (!isLooping) {
          // Auto-advance to next song
          if (currentIndex < songs.length - 1) {
            setCurrentIndex(prev => prev + 1)
          } else {
            setIsPlaying(false)
            setCurrentTime(0)
          }
        }
      },
      onloaderror: () => {
        setIsLoading(false)
        toast({
          title: 'Noe gikk galt med lydavspillingen',
          variant: 'destructive'
        })
      }
    })

    soundRef.current = sound

    // Auto-play on song change
    sound.play()

    // Load volume from localStorage
    const savedVolume = localStorage.getItem('aimusikk-volume')
    if (savedVolume) {
      const vol = parseInt(savedVolume)
      setVolume(vol)
      sound.volume(vol / 100)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      sound.unload()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl, currentIndex])

  // Update loop state
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.loop(isLooping)
    }
  }, [isLooping])

  // Progress animation
  useEffect(() => {
    const updateProgress = () => {
      if (soundRef.current && isPlaying) {
        const seek = soundRef.current.seek()
        const currentSeek = typeof seek === 'number' ? seek : 0
        setCurrentTime(currentSeek)
      }
      animationFrameRef.current = requestAnimationFrame(updateProgress)
    }

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateProgress)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying])

  // Play/pause toggle
  const togglePlay = useCallback(() => {
    if (!soundRef.current) return

    if (isPlaying) {
      soundRef.current.pause()
    } else {
      soundRef.current.play()
    }
  }, [isPlaying])

  // Seek to specific time
  const handleSeek = useCallback((value: number[]) => {
    if (!soundRef.current) return
    const seekTime = value[0]
    soundRef.current.seek(seekTime)
    setCurrentTime(seekTime)
  }, [])

  // Handle volume change
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (soundRef.current) {
      soundRef.current.volume(newVolume / 100)
    }
    localStorage.setItem('aimusikk-volume', newVolume.toString())
    if (isMuted && newVolume > 0) {
      setIsMuted(false)
    }
  }, [isMuted])

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!soundRef.current) return
    if (isMuted) {
      soundRef.current.volume(volume / 100)
      setIsMuted(false)
    } else {
      soundRef.current.volume(0)
      setIsMuted(true)
    }
  }, [isMuted, volume])

  // Back button - seek to start or previous song
  const handleBack = useCallback(() => {
    if (!soundRef.current) return
    const currentSeek = soundRef.current.seek()
    if (typeof currentSeek === 'number' && currentSeek < 3 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    } else {
      soundRef.current.seek(0)
      setCurrentTime(0)
    }
  }, [currentIndex])

  // Toggle loop
  const toggleLoop = useCallback(() => {
    setIsLooping(prev => !prev)
  }, [])

  // Navigation
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }, [currentIndex])

  const goToNext = useCallback(() => {
    if (currentIndex < songs.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, songs.length])

  // Handle download
  const handleDownload = useCallback(async () => {
    if (isDownloading || !currentSong) return

    setIsDownloading(true)
    const success = await downloadSong(currentSong.id, currentSong.title)
    setIsDownloading(false)

    if (success) {
      toast({
        title: 'Sangen ble lastet ned!'
      })
    } else {
      showError(ErrorCode.SONG_DOWNLOAD_FAILED, {
        context: 'unified-player-download'
      })
    }
  }, [currentSong, isDownloading, showError])

  // Swipe handling for mobile
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientY)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isSwipe = Math.abs(distance) > minSwipeDistance

    if (isSwipe) {
      if (distance > 0) {
        // Swipe up - next song
        goToNext()
      } else {
        // Swipe down - previous song
        goToPrevious()
      }
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlay()
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
  }, [togglePlay, goToPrevious, goToNext, onClose])

  // Get volume icon
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2

  // Background style
  const backgroundStyle = currentSong?.image_url
    ? {}
    : {
        background: `linear-gradient(135deg, ${genreGradient.from} 0%, ${genreGradient.to} 100%)`
      }

  if (!currentSong) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={`
        fixed inset-0 z-50 flex flex-col
        ${isMobile ? 'h-[100dvh]' : 'items-center justify-center bg-black/80'}
      `}
      onTouchStart={isMobile ? onTouchStart : undefined}
      onTouchMove={isMobile ? onTouchMove : undefined}
      onTouchEnd={isMobile ? onTouchEnd : undefined}
    >
      {/* Player container */}
      <div
        className={`
          relative flex flex-col overflow-hidden
          ${isMobile
            ? 'w-full h-full'
            : 'w-full max-w-lg h-[90vh] max-h-[800px] rounded-2xl shadow-2xl'
          }
        `}
        style={backgroundStyle}
      >
        {/* Background image */}
        {currentSong.image_url && (
          <div className="absolute inset-0">
            <Image
              src={currentSong.image_url}
              alt={currentSong.title}
              fill
              className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              priority
            />
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}

        {/* Gradient overlay at bottom for better text visibility */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

        {/* Header - Close button and song info */}
        <div className="relative z-10 flex items-start justify-between p-4 pt-6">
          <div className="flex-1 pr-12">
            <h2 className="text-white text-xl font-bold drop-shadow-lg truncate">
              {currentSong.title}
            </h2>
            <p className="text-white/80 text-sm drop-shadow-md">
              {currentSong.genre}
            </p>
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
            aria-label="Lukk avspiller"
          >
            {isMobile ? <ChevronDown className="h-6 w-6" /> : <X className="h-6 w-6" />}
          </Button>
        </div>

        {/* Lyrics area - scrollable */}
        <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-4">
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

        {/* Right side action buttons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
          {/* Download button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            aria-label="Last ned"
          >
            {isDownloading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Download className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Desktop navigation arrows */}
        {!isMobile && (
          <>
            {currentIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 z-20"
                aria-label="Forrige sang"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            {currentIndex < songs.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-20 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 z-20"
                aria-label="Neste sang"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </>
        )}

        {/* Bottom player bar */}
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
          <div className="flex items-center justify-center gap-4">
            {/* Back button */}
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

            {/* Play/Pause button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
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

            {/* Loop button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLoop}
              disabled={isLoading}
              className={`w-10 h-10 rounded-full ${isLooping ? 'bg-white/30 text-white' : 'text-white hover:bg-white/20'}`}
              aria-label={isLooping ? 'Repeter av' : 'Repeter på'}
            >
              <Repeat className="h-5 w-5" />
            </Button>

            {/* Volume (desktop only) */}
            {!isMobile && (
              <div className="flex items-center gap-2 ml-4">
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
            )}
          </div>

          {/* Mobile swipe hint */}
          {isMobile && songs.length > 1 && (
            <p className="text-center text-white/60 text-xs">
              Sveip opp/ned for neste/forrige sang
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
