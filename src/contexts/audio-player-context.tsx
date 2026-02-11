'use client'

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { Howl } from 'howler'
import type { Song } from '@/types/song'

interface AudioPlayerContextType {
  // State
  currentSong: Song | null
  isPlaying: boolean
  currentTime: number
  duration: number
  queue: Song[]

  // Audio controls
  playSong: (song: Song, queue?: Song[]) => void
  togglePlayPause: () => void
  stopAudio: () => void

  // Full player
  isFullPlayerOpen: boolean
  openFullPlayer: () => void
  closeFullPlayer: () => void
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null)

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext)
  if (!ctx) throw new Error('useAudioPlayer must be used within AudioPlayerProvider')
  return ctx
}

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [queue, setQueue] = useState<Song[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false)

  const howlerRef = useRef<Howl | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const queueRef = useRef<Song[]>([])

  // Keep queueRef in sync
  useEffect(() => {
    queueRef.current = queue
  }, [queue])

  const updateTime = useCallback(() => {
    if (howlerRef.current && howlerRef.current.playing()) {
      setCurrentTime(howlerRef.current.seek() as number)
      animFrameRef.current = requestAnimationFrame(updateTime)
    }
  }, [])

  const stopAnimFrame = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
  }, [])

  const stopAudio = useCallback(() => {
    stopAnimFrame()
    if (howlerRef.current) {
      howlerRef.current.unload()
      howlerRef.current = null
    }
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setCurrentSong(null)
  }, [stopAnimFrame])

  const playSong = useCallback(
    (song: Song, newQueue?: Song[]) => {
      const audioUrl = song.audio_url || song.stream_audio_url
      if (!audioUrl) return

      // Update queue if provided
      if (newQueue) {
        setQueue(newQueue)
        queueRef.current = newQueue
      }

      // Stop existing
      stopAnimFrame()
      if (howlerRef.current) {
        howlerRef.current.unload()
      }

      setCurrentSong(song)
      setIsPlaying(true)
      setCurrentTime(0)
      setDuration(song.duration_seconds || 0)

      const howl = new Howl({
        src: [audioUrl],
        html5: true,
        onplay: () => {
          setIsPlaying(true)
          animFrameRef.current = requestAnimationFrame(updateTime)
        },
        onpause: () => {
          setIsPlaying(false)
          stopAnimFrame()
        },
        onend: () => {
          // Auto-advance to next song in queue
          const currentQueue = queueRef.current
          const idx = currentQueue.findIndex((s) => s.id === song.id)
          if (idx >= 0 && idx < currentQueue.length - 1) {
            const nextSong = currentQueue[idx + 1]
            // Recursively play next — queue stays the same
            playSong(nextSong)
          } else {
            setIsPlaying(false)
          }
        },
        onload: () => {
          const dur = howl.duration()
          if (dur > 0) setDuration(dur)
        },
        onloaderror: () => {
          setIsPlaying(false)
        },
      })

      howl.play()
      howlerRef.current = howl
    },
    [updateTime, stopAnimFrame]
  )

  const togglePlayPause = useCallback(() => {
    if (!howlerRef.current) return
    if (howlerRef.current.playing()) {
      howlerRef.current.pause()
    } else {
      howlerRef.current.play()
    }
  }, [])

  const openFullPlayer = useCallback(() => {
    // Pause inline audio — UnifiedPlayer will create its own Howl
    stopAnimFrame()
    if (howlerRef.current) {
      howlerRef.current.unload()
      howlerRef.current = null
    }
    setIsPlaying(false)
    setIsFullPlayerOpen(true)
  }, [stopAnimFrame])

  const closeFullPlayer = useCallback(() => {
    setIsFullPlayerOpen(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnimFrame()
      if (howlerRef.current) {
        howlerRef.current.unload()
        howlerRef.current = null
      }
    }
  }, [stopAnimFrame])

  return (
    <AudioPlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        queue,
        playSong,
        togglePlayPause,
        stopAudio,
        isFullPlayerOpen,
        openFullPlayer,
        closeFullPlayer,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}
