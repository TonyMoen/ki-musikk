'use client'

import { useState } from 'react'
import { Play, Pause, Download, Loader2 } from 'lucide-react'
import { SongThumbnail } from './song-thumbnail'
import { TrackMoreMenu } from './track-more-menu'
import { cn } from '@/lib/utils'
import type { Song } from '@/types/song'

interface TrackRowProps {
  song: Song
  index: number
  isCurrentSong: boolean
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onDownload: () => void
  onDelete: () => void
}

function formatDuration(seconds?: number): string {
  if (!seconds || isNaN(seconds)) return '—'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 1) return 'Akkurat nå'
  if (diffMinutes < 60) return `${diffMinutes} min siden`
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'time' : 'timer'} siden`
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'dag' : 'dager'} siden`

  const months = ['jan.', 'feb.', 'mar.', 'apr.', 'mai', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'des.']
  return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`
}

export function TrackRow({
  song,
  index,
  isCurrentSong,
  isPlaying,
  onPlay,
  onPause,
  onDownload,
  onDelete,
}: TrackRowProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handlePlayPause = () => {
    if (isCurrentSong && isPlaying) {
      onPause()
    } else {
      onPlay()
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await onDownload()
    } finally {
      setIsDownloading(false)
    }
  }

  const rowNumber = index + 1
  const durationStr = formatDuration(song.duration_seconds)
  const dateStr = formatDate(song.created_at)
  const isActive = isCurrentSong && isPlaying

  return (
    <div
      className={cn(
        'group transition-colors rounded-md cursor-pointer',
        // Desktop layout
        'sm:grid sm:items-center sm:px-4 sm:py-2',
        // Mobile layout
        'grid items-center px-3 py-2.5',
        isActive && 'bg-[rgba(242,101,34,0.06)]',
        !isActive && 'hover:bg-[rgba(40,80,160,0.08)]'
      )}
      style={{
        gridTemplateColumns: '1fr 36px 36px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlayPause}
    >
      {/* === DESKTOP LAYOUT (hidden on mobile, shown on sm+) === */}
      <div
        className="hidden sm:grid sm:items-center sm:col-span-3"
        style={{ gridTemplateColumns: '36px 1fr 50px 100px 36px 36px' }}
      >
        {/* # / Play / Pause column */}
        <div className="flex items-center justify-center w-9 h-9">
          {isActive ? (
            <Pause className="h-4 w-4 text-[#F26522]" />
          ) : isHovered ? (
            <Play className="h-4 w-4 text-white fill-white" />
          ) : (
            <span className="text-sm tabular-nums text-[rgba(130,170,240,0.45)]">
              {rowNumber}
            </span>
          )}
        </div>

        {/* Title column */}
        <div className="flex items-center gap-3 min-w-0">
          <SongThumbnail song={song} size={40} />
          <span
            className={cn(
              'text-sm font-medium truncate',
              isActive ? 'text-[#F26522]' : 'text-white'
            )}
          >
            {song.title}
          </span>
        </div>

        {/* Duration column */}
        <span className="text-sm text-right tabular-nums text-[rgba(180,200,240,0.5)]">
          {durationStr}
        </span>

        {/* Date column */}
        <span className="text-sm text-right text-[rgba(180,200,240,0.5)]">
          {dateStr}
        </span>

        {/* Download button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDownload()
          }}
          disabled={isDownloading}
          className={cn(
            'w-9 h-9 flex items-center justify-center rounded-md transition-all',
            'text-[#F26522] hover:bg-[rgba(242,101,34,0.1)]',
            'opacity-40 group-hover:opacity-100',
            isDownloading && 'opacity-100'
          )}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </button>

        {/* More menu */}
        <div
          className={cn(
            'transition-opacity',
            'opacity-0 group-hover:opacity-100'
          )}
        >
          <TrackMoreMenu
            onDownload={handleDownload}
            onDelete={onDelete}
            isDownloading={isDownloading}
          />
        </div>
      </div>

      {/* === MOBILE LAYOUT (shown on base, hidden on sm+) === */}
      {/* Title + subtitle */}
      <div
        className="flex items-center gap-3 min-w-0 sm:hidden"
        onClick={(e) => {
          e.stopPropagation()
          handlePlayPause()
        }}
      >
        <div className="relative">
          <SongThumbnail song={song} size={44} />
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
              <Pause className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p
            className={cn(
              'text-sm font-medium truncate',
              isActive ? 'text-[#F26522]' : 'text-white'
            )}
          >
            {song.title}
          </p>
          <p className="text-xs text-[rgba(130,170,240,0.45)] truncate">
            {durationStr} · {dateStr}
          </p>
        </div>
      </div>

      {/* Download button (mobile) */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDownload()
        }}
        disabled={isDownloading}
        className="w-9 h-9 flex items-center justify-center rounded-md text-[#F26522] hover:bg-[rgba(242,101,34,0.1)] transition-colors sm:hidden"
      >
        {isDownloading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
      </button>

      {/* More menu (mobile) */}
      <div className="sm:hidden">
        <TrackMoreMenu
          onDownload={handleDownload}
          onDelete={onDelete}
          isDownloading={isDownloading}
        />
      </div>
    </div>
  )
}
