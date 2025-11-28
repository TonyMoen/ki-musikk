'use client'

import { PlayCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate, formatDuration } from '@/lib/utils/date-formatter'
import { cn } from '@/lib/utils'

interface SongCardProps {
  song: {
    id: string
    title: string
    genre: string
    duration_seconds?: number
    created_at: string
    gradient_colors?: { from: string; to: string }
  }
  onClick: () => void
  isGenerating?: boolean
  isPartial?: boolean  // True when first track ready but still finalizing
}

export function SongCard({ song, onClick, isGenerating = false, isPartial = false }: SongCardProps) {
  const gradientFrom = song.gradient_colors?.from || '#E94560'
  const gradientTo = song.gradient_colors?.to || '#FFC93C'

  // Allow click if not generating OR if partial (has audio ready)
  const isClickable = !isGenerating || isPartial

  const handleClick = () => {
    if (isClickable) {
      onClick()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && isClickable) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <Card
      className={cn(
        'transition-shadow',
        isGenerating && !isPartial
          ? 'cursor-default animate-pulse'
          : 'cursor-pointer hover:shadow-lg',
        isPartial && 'ring-2 ring-[#FFC93C] ring-opacity-60'  // Highlight partial songs
      )}
      onClick={handleClick}
      tabIndex={isClickable ? 0 : -1}
      role="button"
      aria-label={
        isGenerating && !isPartial
          ? `Genererer ${song.title}`
          : isPartial
          ? `Klar til avspilling: ${song.title} (ferdigstilles)`
          : `Spill av ${song.title}`
      }
      onKeyDown={handleKeyDown}
    >
      <CardContent className="flex items-center gap-4 p-4">
        {/* Gradient artwork thumbnail */}
        <div
          className="w-[60px] h-[60px] rounded flex items-center justify-center flex-shrink-0 relative"
          style={{
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`
          }}
        >
          {isGenerating && !isPartial ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <PlayCircle className="w-8 h-8 text-white" />
          )}
          {/* Small finalizing indicator for partial songs */}
          {isPartial && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#FFC93C] rounded-full flex items-center justify-center">
              <Loader2 className="w-2.5 h-2.5 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Song info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate" title={song.title}>
            {song.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {song.genre}
            </Badge>
            {isGenerating && !isPartial ? (
              <span className="text-xs text-[#E94560] font-medium">
                Genererer...
              </span>
            ) : isPartial ? (
              <span className="text-xs text-[#FFC93C] font-medium">
                Klar til avspilling!
              </span>
            ) : (
              song.duration_seconds && (
                <span className="text-xs">
                  {formatDuration(song.duration_seconds)}
                </span>
              )
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isGenerating && !isPartial
              ? 'Vennligst vent...'
              : isPartial
              ? 'Ferdigstilles i bakgrunnen...'
              : formatRelativeDate(song.created_at)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
