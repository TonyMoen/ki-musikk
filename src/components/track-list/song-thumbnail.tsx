'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getGradientForSong } from '@/lib/genre-colors'

interface SongThumbnailProps {
  song: {
    id: string
    title: string
    genre?: string
    image_url?: string
  }
  size?: number
  className?: string
}

function getInitials(title: string): string {
  const words = title.trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return title.slice(0, 2).toUpperCase()
}

export function SongThumbnail({ song, size = 40, className = '' }: SongThumbnailProps) {
  const [imageError, setImageError] = useState(false)
  const gradient = getGradientForSong(song.id, song.genre)
  const initials = getInitials(song.title)
  const showImage = song.image_url && !imageError

  return (
    <div
      className={`relative flex-shrink-0 overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        border: `1px solid ${gradient.from}26`,
      }}
    >
      {showImage ? (
        <Image
          src={song.image_url!}
          alt={song.title}
          width={size}
          height={size}
          className="object-cover w-full h-full"
          onError={() => setImageError(true)}
          unoptimized
        />
      ) : (
        <>
          {/* Gradient background */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${gradient.from}40, ${gradient.to}40)`,
            }}
          />
          {/* Waveform overlay */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.15]"
            viewBox="0 0 40 40"
            fill="none"
            preserveAspectRatio="none"
          >
            {[...Array(8)].map((_, i) => {
              const x = 3 + i * 5
              const h = 8 + Math.sin(i * 1.2 + song.id.charCodeAt(0) * 0.1) * 10
              return (
                <rect
                  key={i}
                  x={x}
                  y={20 - h / 2}
                  width="2.5"
                  height={h}
                  rx="1.25"
                  fill="white"
                />
              )
            })}
          </svg>
          {/* Initials */}
          <span
            className="absolute inset-0 flex items-center justify-center text-white font-semibold opacity-60"
            style={{ fontSize: size * 0.35 }}
          >
            {initials}
          </span>
        </>
      )}
    </div>
  )
}
