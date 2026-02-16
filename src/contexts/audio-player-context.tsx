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
import { useToast } from '@/hooks/use-toast'

interface AudioPlayerContextType {
  // State
  currentSong: Song | null
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  queue: Song[]
  volume: number
  isLooping: boolean

  // Audio controls
  playSong: (song: Song, queue?: Song[]) => void
  togglePlayPause: () => void
  stopAudio: () => void
  setVolume: (v: number) => void
  seekTo: (time: number) => void
  setLooping: (loop: boolean) => void

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
  const { toast } = useToast()
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [queue, setQueue] = useState<Song[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false)
  const [isLooping, setIsLoopingState] = useState(false)
  const [volume, setVolumeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kimusikk-volume')
      return saved ? parseInt(saved, 10) : 80
    }
    return 80
  })

  const howlerRef = useRef<Howl | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const queueRef = useRef<Song[]>([])
  const isLoopingRef = useRef(false)

  // Keep refs in sync
  useEffect(() => { queueRef.current = queue }, [queue])
  useEffect(() => { isLoopingRef.current = isLooping }, [isLooping])

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
    setIsLoading(false)
    setCurrentTime(0)
    setDuration(0)
    setCurrentSong(null)
  }, [stopAnimFrame])

  const playSong = useCallback(
    (song: Song, newQueue?: Song[]) => {
      const audioUrl = song.audio_url || song.stream_audio_url
      if (!audioUrl) return

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
      setIsLoading(true)
      setCurrentTime(0)
      setDuration(song.duration_seconds || 0)

      const howl = new Howl({
        src: [audioUrl],
        html5: true,
        volume: volume / 100,
        loop: isLoopingRef.current,
        onplay: () => {
          setIsPlaying(true)
          animFrameRef.current = requestAnimationFrame(updateTime)
        },
        onpause: () => {
          setIsPlaying(false)
          stopAnimFrame()
        },
        onend: () => {
          if (!isLoopingRef.current) {
            // Auto-advance
            const currentQueue = queueRef.current
            const idx = currentQueue.findIndex((s) => s.id === song.id)
            if (idx >= 0 && idx < currentQueue.length - 1) {
              playSong(currentQueue[idx + 1])
            } else {
              setIsPlaying(false)
            }
          }
        },
        onload: () => {
          setIsLoading(false)
          const dur = howl.duration()
          if (dur > 0) setDuration(dur)
        },
        onloaderror: () => {
          setIsPlaying(false)
          setIsLoading(false)
          toast({
            variant: 'destructive',
            title: 'Kunne ikke spille av',
            description: 'Lydfilen er ikke tilgjengelig. Prøv å laste siden på nytt.',
          })
        },
      })

      howl.play()
      howlerRef.current = howl
    },
    [updateTime, stopAnimFrame, volume]
  )

  const togglePlayPause = useCallback(() => {
    if (!howlerRef.current) return
    if (howlerRef.current.playing()) {
      howlerRef.current.pause()
    } else {
      howlerRef.current.play()
    }
  }, [])

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(100, v))
    setVolumeState(clamped)
    if (howlerRef.current) {
      howlerRef.current.volume(clamped / 100)
    }
    localStorage.setItem('kimusikk-volume', String(clamped))
  }, [])

  const seekTo = useCallback((time: number) => {
    if (howlerRef.current) {
      howlerRef.current.seek(time)
      setCurrentTime(time)
    }
  }, [])

  const setLooping = useCallback((loop: boolean) => {
    setIsLoopingState(loop)
    isLoopingRef.current = loop
    if (howlerRef.current) {
      howlerRef.current.loop(loop)
    }
  }, [])

  // Open full player — audio keeps playing
  const openFullPlayer = useCallback(() => {
    setIsFullPlayerOpen(true)
  }, [])

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
        isLoading,
        currentTime,
        duration,
        queue,
        volume,
        isLooping,
        playSong,
        togglePlayPause,
        stopAudio,
        setVolume,
        seekTo,
        setLooping,
        isFullPlayerOpen,
        openFullPlayer,
        closeFullPlayer,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}
