'use client'

import { useRef, useCallback } from 'react'
import { Play, Pause, Download, Loader2, Volume2, VolumeX } from 'lucide-react'
import { SongThumbnail } from './song-thumbnail'
import { cn } from '@/lib/utils'
import type { Song } from '@/types/song'

interface NowPlayingBarProps {
  song: Song
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  onTogglePlay: () => void
  onOpenFullPlayer: () => void
  onDownload: () => void
  onVolumeChange: (v: number) => void
  onSeek: (time: number) => void
  isDownloading?: boolean
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function NowPlayingBar({
  song,
  isPlaying,
  currentTime,
  duration,
  volume,
  onTogglePlay,
  onOpenFullPlayer,
  onDownload,
  onVolumeChange,
  onSeek,
  isDownloading,
}: NowPlayingBarProps) {
  const progressRef = useRef<HTMLDivElement>(null)

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation()
      if (!progressRef.current || duration <= 0) return
      const rect = progressRef.current.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      onSeek(ratio * duration)
    },
    [duration, onSeek]
  )

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="fixed left-0 right-0 z-[60] animate-fade-up bottom-16 md:bottom-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Draggable progress bar */}
      <div
        ref={progressRef}
        className="h-1.5 bg-[rgba(90,140,255,0.08)] cursor-pointer group"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-[#F26522] relative transition-[width] duration-100"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#F26522] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="bg-[rgba(6,9,15,0.9)] backdrop-blur-xl border-t border-[rgba(90,140,255,0.12)]">
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-2.5">
          {/* Thumbnail — tap opens full player */}
          <div onClick={onOpenFullPlayer} className="cursor-pointer flex-shrink-0">
            <SongThumbnail song={song} size={40} />
          </div>

          {/* Title + time — tap opens full player */}
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onOpenFullPlayer}>
            <p className="text-sm font-medium text-white truncate">
              {song.title}
            </p>
            <p className="text-xs text-[rgba(130,170,240,0.45)] tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </p>
          </div>

          {/* Volume slider */}
          <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onVolumeChange(volume > 0 ? 0 : 80)}
              className="w-8 h-8 flex items-center justify-center text-[rgba(180,200,240,0.5)] hover:text-white transition-colors"
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-16 sm:w-20 h-1 appearance-none bg-[rgba(90,140,255,0.15)] rounded-full outline-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
            />
          </div>

          {/* Play/Pause button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTogglePlay()
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F26522] hover:bg-[#E54D1C] text-white transition-colors flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-white" />
            ) : (
              <Play className="h-4 w-4 fill-white ml-0.5" />
            )}
          </button>

          {/* Download button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDownload()
            }}
            disabled={isDownloading}
            className={cn(
              'w-9 h-9 flex items-center justify-center rounded-full transition-colors flex-shrink-0',
              'border border-[rgba(90,140,255,0.15)] text-[rgba(180,200,240,0.5)]',
              'hover:border-[#F26522] hover:text-[#F26522] hover:bg-[rgba(242,101,34,0.1)]'
            )}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
