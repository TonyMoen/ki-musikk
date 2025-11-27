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
}

export function SongCard({ song, onClick, isGenerating = false }: SongCardProps) {
  const gradientFrom = song.gradient_colors?.from || '#E94560'
  const gradientTo = song.gradient_colors?.to || '#FFC93C'

  const handleClick = () => {
    if (!isGenerating) {
      onClick()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isGenerating) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <Card
      className={cn(
        'transition-shadow',
        isGenerating
          ? 'cursor-default animate-pulse'
          : 'cursor-pointer hover:shadow-lg'
      )}
      onClick={handleClick}
      tabIndex={isGenerating ? -1 : 0}
      role="button"
      aria-label={isGenerating ? `Genererer ${song.title}` : `Spill av ${song.title}`}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="flex items-center gap-4 p-4">
        {/* Gradient artwork thumbnail */}
        <div
          className="w-[60px] h-[60px] rounded flex items-center justify-center flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`
          }}
        >
          {isGenerating ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <PlayCircle className="w-8 h-8 text-white" />
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
            {isGenerating ? (
              <span className="text-xs text-[#E94560] font-medium">
                Genererer...
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
            {isGenerating ? 'Vennligst vent...' : formatRelativeDate(song.created_at)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
