'use client'

import { PlayCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate, formatDuration } from '@/lib/utils/date-formatter'

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
}

export function SongCard({ song, onClick }: SongCardProps) {
  const gradientFrom = song.gradient_colors?.from || '#E94560'
  const gradientTo = song.gradient_colors?.to || '#FFC93C'

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`Spill av ${song.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <CardContent className="flex items-center gap-4 p-4">
        {/* Gradient artwork thumbnail */}
        <div
          className="w-[60px] h-[60px] rounded flex items-center justify-center flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`
          }}
        >
          <PlayCircle className="w-8 h-8 text-white" />
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
            {song.duration_seconds && (
              <span className="text-xs">
                {formatDuration(song.duration_seconds)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formatRelativeDate(song.created_at)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
