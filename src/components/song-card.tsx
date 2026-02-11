'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PlayCircle, Loader2, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatRelativeDate, formatDuration } from '@/lib/utils/date-formatter'
import { downloadSong } from '@/lib/utils/download'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { useErrorToast } from '@/hooks/use-error-toast'
import { ErrorCode } from '@/lib/error-messages'

interface SongCardProps {
  song: {
    id: string
    title: string
    genre: string
    duration_seconds?: number
    created_at: string
    image_url?: string
    gradient_colors?: { from: string; to: string }
  }
  onClick: () => void
  isGenerating?: boolean
  isPartial?: boolean  // True when first track ready but still finalizing
}

export function SongCard({ song, onClick, isGenerating = false, isPartial = false }: SongCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { showError } = useErrorToast()
  const gradientFrom = song.gradient_colors?.from || '#E94560'
  const gradientTo = song.gradient_colors?.to || '#FFC93C'
  const hasImage = song.image_url && !imageError

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

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    if (isDownloading || isGenerating) return

    setIsDownloading(true)
    const result = await downloadSong(song.id, song.title)
    setIsDownloading(false)

    if (result.success) {
      toast({
        title: 'Sangen ble lastet ned!'
      })
    } else if (result.errorCode === 'PURCHASE_REQUIRED') {
      showError(ErrorCode.PURCHASE_REQUIRED, {
        context: 'song-card-download'
      })
    } else {
      showError(ErrorCode.SONG_DOWNLOAD_FAILED, {
        context: 'song-card-download'
      })
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
      style={{
        background: 'linear-gradient(135deg, rgba(15, 52, 96, 0.03) 0%, rgba(233, 69, 96, 0.05) 100%)'
      }}
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
        {/* Artwork thumbnail - image or gradient fallback */}
        <div
          className="w-[60px] h-[60px] rounded flex items-center justify-center flex-shrink-0 relative overflow-hidden"
          style={!hasImage ? {
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`
          } : undefined}
        >
          {/* Song image */}
          {hasImage && (
            <Image
              src={song.image_url!}
              alt={song.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              unoptimized
              sizes="60px"
            />
          )}
          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            {isGenerating && !isPartial ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <PlayCircle className="w-8 h-8 text-white drop-shadow-md" />
            )}
          </div>
          {/* Small finalizing indicator for partial songs */}
          {isPartial && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#FFC93C] rounded-full flex items-center justify-center">
              <Loader2 className="w-2.5 h-2.5 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Song info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate min-w-[140px]" title={song.title}>
            {song.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
            <span className="text-xs">
              {song.genre}
            </span>
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
              ? 'Tar vanligvis 2–4 minutter'
              : isPartial
              ? 'Ferdigstilles i bakgrunnen...'
              : formatRelativeDate(song.created_at)}
          </p>
        </div>

        {/* Download button */}
        {!isGenerating && !isPartial && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-shrink-0 self-end"
            aria-label="Last ned sang"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Download className="h-4 w-4 mr-1" />
                Last ned
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
