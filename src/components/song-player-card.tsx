'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Howl } from 'howler'
import WaveSurfer from 'wavesurfer.js'
import { Play, Pause, Volume2, VolumeX, Volume1, Download, Loader2, Trash2 } from 'lucide-react'
import { downloadSong } from '@/lib/utils/download'
import { toast } from '@/hooks/use-toast'
import { useErrorToast } from '@/hooks/use-error-toast'
import { ErrorCode } from '@/lib/error-messages'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { InfoTooltip } from '@/components/info-tooltip'
import { TOOLTIPS } from '@/lib/constants'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface SongPlayerCardProps {
  songId: string
  title: string
  genre: string
  audioUrl: string
  duration?: number
  createdAt: string
  genreEmoji?: string
  isPreview?: boolean // Free 30-second preview
  isPartial?: boolean // Early playback (FIRST_SUCCESS) - still finalizing
  onDelete?: (songId: string) => void // Callback when song is deleted
  onClose?: () => void // Callback to close the player modal
}

export function SongPlayerCard({
  songId,
  title,
  genre,
  audioUrl,
  duration,
  createdAt,
  genreEmoji = '🎵',
  isPreview = false,
  isPartial = false,
  onDelete,
  onClose
}: SongPlayerCardProps) {
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(duration || 0)
  const [volume, setVolume] = useState(80) // Default 80%
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  // Delete state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Error toast hook
  const { showError } = useErrorToast()

  // Refs
  const soundRef = useRef<Howl | null>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const waveformContainerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()
  const cardRef = useRef<HTMLDivElement>(null)

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format date in Norwegian locale
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Initialize Howler.js audio player
  useEffect(() => {
    if (!audioUrl) return

    const sound = new Howl({
      src: [audioUrl],
      html5: true,
      preload: true,
      volume: volume / 100,
      onload: () => {
        setIsLoading(false)
        setAudioDuration(sound.duration())
      },
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onend: () => {
        setIsPlaying(false)
        setCurrentTime(0)
      },
      onloaderror: (id, error) => {
        console.error('Audio load failed:', error)
        setError('Kunne ikke laste inn lydfilen')
        setIsLoading(false)
      },
      onplayerror: (id, error) => {
        console.error('Audio play failed:', error)
        setError('Avspilling feilet')
      }
    })

    soundRef.current = sound

    // Load volume from localStorage
    const savedVolume = localStorage.getItem('kimusikk-volume')
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
  }, [audioUrl])

  // Initialize WaveSurfer.js waveform
  useEffect(() => {
    if (!waveformContainerRef.current || !audioUrl) return

    const wavesurfer = WaveSurfer.create({
      container: waveformContainerRef.current,
      waveColor: '#98c1d9',
      progressColor: '#E94560',
      height: 60,
      barWidth: 2,
      barGap: 1,
      cursorWidth: 0,
      normalize: true
    })

    wavesurfer.load(audioUrl)

    wavesurfer.on('ready', () => {
      if (!duration) {
        setAudioDuration(wavesurfer.getDuration())
      }
    })

    // Handle waveform clicks for seeking
    wavesurfer.on('click', (progress: number) => {
      if (soundRef.current) {
        const seekTime = progress * audioDuration
        soundRef.current.seek(seekTime)
        setCurrentTime(seekTime)

        // Update waveform progress
        wavesurfer.seekTo(progress)
      }
    })

    wavesurferRef.current = wavesurfer

    return () => {
      wavesurfer.destroy()
    }
  }, [audioUrl, audioDuration, duration])

  // Sync waveform with Howler playback
  useEffect(() => {
    if (!soundRef.current) return

    const updateProgress = () => {
      if (soundRef.current) {
        const seek = soundRef.current.seek()
        const currentSeek = typeof seek === 'number' ? seek : 0
        setCurrentTime(currentSeek)

        if (wavesurferRef.current && audioDuration > 0) {
          const progress = currentSeek / audioDuration
          wavesurferRef.current.seekTo(progress)
        }
      }
      // Continue loop as long as isPlaying is true (checked via closure)
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
  }, [isPlaying, audioDuration])

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

    // Update waveform
    if (wavesurferRef.current && audioDuration > 0) {
      const progress = seekTime / audioDuration
      wavesurferRef.current.seekTo(progress)
    }
  }, [audioDuration])

  // Handle volume change
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)

    if (soundRef.current) {
      soundRef.current.volume(newVolume / 100)
    }

    // Save to localStorage
    localStorage.setItem('kimusikk-volume', newVolume.toString())

    // Unmute if muted
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

  // Handle download
  const handleDownload = useCallback(async () => {
    if (isDownloading) return

    setIsDownloading(true)
    const result = await downloadSong(songId, title)
    setIsDownloading(false)

    if (result.success) {
      toast({
        title: 'Sangen ble lastet ned!'
      })
    } else if (result.errorCode === 'PURCHASE_REQUIRED') {
      window.location.href = '/priser?from=download'
      return
    } else {
      showError(ErrorCode.SONG_DOWNLOAD_FAILED, {
        context: 'song-download',
        onRetry: handleDownload
      })
    }
  }, [songId, title, isDownloading, showError])

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (isDeleting) return

    // Stop playback before deletion
    if (soundRef.current && isPlaying) {
      soundRef.current.stop()
      setIsPlaying(false)
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/songs/${songId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      // Success: show toast, close dialog, close modal, notify parent
      toast({
        title: 'Sangen ble slettet'
      })
      setShowDeleteDialog(false)
      onDelete?.(songId)
      onClose?.()
    } catch (error) {
      // Error: show error toast, keep dialog open for retry
      showError(ErrorCode.SONG_DELETE_FAILED, {
        context: 'song-delete',
        onRetry: handleDelete
      })
    } finally {
      setIsDeleting(false)
    }
  }, [songId, isDeleting, isPlaying, onDelete, onClose, showError])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if card is focused or contains focused element
      if (!cardRef.current?.contains(document.activeElement)) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (soundRef.current) {
            const newTime = Math.max(0, currentTime - 5)
            soundRef.current.seek(newTime)
            setCurrentTime(newTime)
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (soundRef.current) {
            const newTime = Math.min(audioDuration, currentTime + 5)
            soundRef.current.seek(newTime)
            setCurrentTime(newTime)
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          handleVolumeChange([Math.min(100, volume + 10)])
          break
        case 'ArrowDown':
          e.preventDefault()
          handleVolumeChange([Math.max(0, volume - 10)])
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, currentTime, audioDuration, volume, handleVolumeChange])

  // Get volume icon
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2

  return (
    <div
      ref={cardRef}
      className="flex flex-col md:flex-row gap-4"
      role="region"
      aria-label="Sangavspiller"
      tabIndex={0}
    >
      {/* Artwork */}
      <div className="w-full md:w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-md bg-gradient-to-br from-[#E94560] to-[#FFC93C] text-3xl">
        {genreEmoji}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {/* Metadata */}
        <div className="mb-2">
          <h3 className="text-lg font-semibold truncate" title={title}>
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-muted-foreground">
              {genre}
            </span>
            {isPreview && (
              <span className="flex items-center gap-1">
                <Badge
                  className="text-xs bg-[#FFC93C] text-black hover:bg-[#FFC93C]/90"
                  aria-label="Forhåndsvisning"
                >
                  🔓 FORHÅNDSVISNING
                </Badge>
                <InfoTooltip content={TOOLTIPS.freePreview} side="bottom" />
              </span>
            )}
            {isPartial && (
              <Badge
                className="text-xs bg-[#FFC93C] text-black hover:bg-[#FFC93C]/90 animate-pulse"
                aria-label="Ferdigstilles"
              >
                ⏳ Ferdigstilles...
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDate(createdAt)}
            </span>
          </div>
        </div>

        {/* Waveform */}
        {!error && (
          <div
            ref={waveformContainerRef}
            className="w-full cursor-pointer mb-2"
            aria-label="Lydformvisualisering"
          />
        )}

        {/* Error message */}
        {error && (
          <div className="text-sm text-red-500 mb-2" role="alert">
            {error}
          </div>
        )}

        {/* Time display */}
        <div
          className="text-sm text-muted-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          {formatTime(currentTime)} / {formatTime(audioDuration)}
        </div>

        {/* Progress slider */}
        <Slider
          value={[currentTime]}
          max={audioDuration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="mt-2"
          aria-label="Søk i sangen"
          disabled={isLoading || !!error}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-2 items-center justify-center md:justify-end flex-shrink-0">
        {/* Play/Pause Button */}
        <Button
          size="lg"
          onClick={togglePlay}
          disabled={isLoading || !!error}
          className="w-12 h-12 rounded-full"
          aria-label={isPlaying ? 'Pause' : 'Spill av'}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
          ) : isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>

        {/* Download Button */}
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            onClick={handleDownload}
            disabled={isDownloading || isLoading || !!error}
            className="flex items-center gap-2 min-w-[100px]"
            aria-label="Last ned sang"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Last ned</span>
          </Button>
          <InfoTooltip content={TOOLTIPS.download} side="top" />
        </div>

        {/* Delete Button */}
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isLoading}
          className="flex items-center gap-2"
          aria-label="Slett sang"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Slett</span>
        </Button>

        {/* Volume Control (Desktop Only) */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            aria-label={isMuted ? 'Slå på lyd' : 'Demp'}
          >
            <VolumeIcon className="h-5 w-5" />
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="w-24"
            aria-label="Volum"
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slett sang</AlertDialogTitle>
            <AlertDialogDescription>
              Slett &apos;{title}&apos;? Dette kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Avbryt
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Slett
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
