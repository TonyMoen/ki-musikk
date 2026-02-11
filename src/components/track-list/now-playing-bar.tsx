'use client'

import { Play, Pause, Download, Loader2 } from 'lucide-react'
import { SongThumbnail } from './song-thumbnail'
import { cn } from '@/lib/utils'
import type { Song } from '@/types/song'

interface NowPlayingBarProps {
  song: Song
  isPlaying: boolean
  currentTime: number
  duration: number
  onTogglePlay: () => void
  onOpenFullPlayer: () => void
  onDownload: () => void
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
  onTogglePlay,
  onOpenFullPlayer,
  onDownload,
  isDownloading,
}: NowPlayingBarProps) {
  return (
    <div
      className="fixed left-0 right-0 z-40 animate-fade-up bottom-16 md:bottom-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Progress bar at top of the bar */}
      <div className="h-0.5 bg-[rgba(90,140,255,0.08)]">
        <div
          className="h-full bg-[#F26522] transition-all duration-200"
          style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
        />
      </div>

      <div
        className="bg-[rgba(6,9,15,0.85)] backdrop-blur-xl border-t border-[rgba(90,140,255,0.12)] cursor-pointer"
        onClick={onOpenFullPlayer}
      >
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-3 sm:py-2.5">
          {/* Thumbnail */}
          <SongThumbnail song={song} size={36} className="sm:w-10 sm:h-10" />

          {/* Title + duration */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {song.title}
            </p>
            <p className="hidden sm:block text-xs text-[rgba(130,170,240,0.45)] tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </p>
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
