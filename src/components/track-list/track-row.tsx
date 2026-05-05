'use client'

import { useState } from 'react'
import { Play, Pause, Download, Loader2 } from 'lucide-react'
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
  /**
   * Render the more-menu (delete, etc.) at the end of the row. The homepage
   * library hides this — delete will move into the (future) detail view.
   * The /sanger full-library page keeps it so delete still works there.
   */
  showMoreMenu?: boolean
}

function formatDuration(seconds?: number): string {
  if (!seconds || isNaN(seconds)) return '—'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const MONTHS = ['jan.', 'feb.', 'mar.', 'apr.', 'mai', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'des.']

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return 'Akkurat nå'
  if (diffMinutes < 60) return `${diffMinutes} min siden`
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'time' : 'timer'} siden`
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'dag' : 'dager'} siden`

  // Older than a week → absolute date (current year omits year)
  const sameYear = date.getFullYear() === now.getFullYear()
  return sameYear
    ? `${date.getDate()}. ${MONTHS[date.getMonth()]}`
    : `${date.getDate()}. ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
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
  showMoreMenu = false,
}: TrackRowProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  // TODO: when the song detail view ships, switch row click to navigate
  // to /sanger/{song.id} instead of toggling play.
  const handleRowClick = () => {
    if (isCurrentSong && isPlaying) {
      onPause()
    } else {
      onPlay()
    }
  }

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isCurrentSong && isPlaying) {
      onPause()
    } else {
      onPlay()
    }
  }

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDownloading(true)
    try {
      await onDownload()
    } finally {
      setIsDownloading(false)
    }
  }

  const trackNumber = (index + 1).toString().padStart(2, '0')
  const durationStr = formatDuration(song.duration_seconds)
  const dateStr = formatDate(song.created_at)
  const isActive = isCurrentSong && isPlaying

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleRowClick()
        }
      }}
      className={cn(
        'group cursor-pointer rounded-md transition-all duration-200',
        '[@media(hover:hover)]:hover:translate-x-1 [@media(hover:hover)]:hover:bg-[rgba(40,80,160,0.12)]',
        isActive && 'bg-[rgba(242,101,34,0.06)]'
      )}
    >
      {/* Desktop layout */}
      <div
        className="hidden sm:grid items-center gap-3 px-4 py-3"
        style={{
          gridTemplateColumns: showMoreMenu
            ? '32px 1fr 60px 120px 36px 36px 36px'
            : '32px 1fr 60px 120px 36px 36px',
        }}
      >
        {/* Track number — decorative, mono, muted */}
        <span className="text-sm font-mono tabular-nums text-[var(--ink-4)] text-center">
          {trackNumber}
        </span>

        {/* Title + tags */}
        <div className="min-w-0">
          <p
            className={cn(
              'text-sm font-medium truncate',
              isActive ? 'text-[#F26522]' : 'text-[var(--ink)]'
            )}
          >
            {song.title}
          </p>
          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-[var(--ink-4)]">
            {song.genre && <span className="truncate max-w-[200px]">{song.genre}</span>}
            {song.genre && <span aria-hidden="true">·</span>}
            <span>Norsk</span>
          </div>
        </div>

        {/* Duration */}
        <span className="text-sm tabular-nums text-right text-[var(--ink-3)]">
          {durationStr}
        </span>

        {/* Date */}
        <span className="text-sm text-right text-[var(--ink-3)]">
          {dateStr}
        </span>

        {/* Play */}
        <button
          type="button"
          onClick={handlePlayClick}
          aria-label={isActive ? `Pause ${song.title}` : `Spill av ${song.title}`}
          className="w-9 h-9 flex items-center justify-center rounded-md text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[rgba(242,101,34,0.1)] transition-colors"
        >
          {isActive ? (
            <Pause className="h-4 w-4 text-[#F26522]" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
        </button>

        {/* Download */}
        <button
          type="button"
          onClick={handleDownloadClick}
          disabled={isDownloading}
          aria-label={`Last ned ${song.title}`}
          className="w-9 h-9 flex items-center justify-center rounded-md text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[rgba(242,101,34,0.1)] transition-colors disabled:opacity-50"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </button>

        {/* More menu (only when caller opts in) */}
        {showMoreMenu && (
          <div onClick={(e) => e.stopPropagation()}>
            <TrackMoreMenu
              onDownload={() => onDownload()}
              onDelete={onDelete}
              isDownloading={isDownloading}
            />
          </div>
        )}
      </div>

      {/* Mobile layout */}
      <div className="sm:hidden grid items-center gap-2 px-3 py-3" style={{ gridTemplateColumns: '28px 1fr auto auto' + (showMoreMenu ? ' auto' : '') }}>
        <span className="text-xs font-mono tabular-nums text-[var(--ink-4)] text-center">
          {trackNumber}
        </span>

        <div className="min-w-0">
          <p
            className={cn(
              'text-sm font-medium truncate',
              isActive ? 'text-[#F26522]' : 'text-[var(--ink)]'
            )}
          >
            {song.title}
          </p>
          <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-4)] truncate">
            {song.genre ? `${song.genre} · Norsk` : 'Norsk'} · {durationStr} · {dateStr}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePlayClick}
          aria-label={isActive ? `Pause ${song.title}` : `Spill av ${song.title}`}
          className="w-9 h-9 flex items-center justify-center rounded-md text-[var(--ink-3)] hover:bg-[rgba(242,101,34,0.1)]"
        >
          {isActive ? (
            <Pause className="h-4 w-4 text-[#F26522]" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
        </button>

        <button
          type="button"
          onClick={handleDownloadClick}
          disabled={isDownloading}
          aria-label={`Last ned ${song.title}`}
          className="w-9 h-9 flex items-center justify-center rounded-md text-[var(--ink-3)] hover:bg-[rgba(242,101,34,0.1)] disabled:opacity-50"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </button>

        {showMoreMenu && (
          <div onClick={(e) => e.stopPropagation()}>
            <TrackMoreMenu
              onDownload={() => onDownload()}
              onDelete={onDelete}
              isDownloading={isDownloading}
            />
          </div>
        )}
      </div>
    </div>
  )
}
