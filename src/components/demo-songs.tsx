'use client'

import { useAudioPlayer } from '@/contexts/audio-player-context'
import { Play, Pause } from 'lucide-react'
import type { Song } from '@/types/song'

interface DemoTrack {
  title: string
  filename: string
  genre: string
}

// ── Add new demo songs here ──────────────────────────────────
const DEMO_TRACKS: DemoTrack[] = [
  { title: 'Vinden danser', filename: 'Vinden danser.mp3', genre: 'Pop' },
]
// ─────────────────────────────────────────────────────────────

const BUCKET_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/demos`

function toSong(track: DemoTrack): Song {
  return {
    id: `demo-${track.filename}`,
    user_id: 'demo',
    title: track.title,
    genre: track.genre,
    phonetic_enabled: false,
    audio_url: `${BUCKET_URL}/${encodeURIComponent(track.filename)}`,
    status: 'completed',
    shared_count: 0,
    created_at: '',
    updated_at: '',
  }
}

export function DemoSongs() {
  const { currentSong, isPlaying, playSong, togglePlayPause } = useAudioPlayer()

  const songs = DEMO_TRACKS.map(toSong)

  return (
    <div className="space-y-2">
      {songs.map((song) => {
        const isCurrent = currentSong?.id === song.id
        const isActive = isCurrent && isPlaying

        return (
          <button
            key={song.id}
            onClick={() => (isCurrent ? togglePlayPause() : playSong(song, songs))}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[rgba(90,140,255,0.08)] bg-[rgba(20,40,80,0.15)] hover:bg-[rgba(20,40,80,0.25)] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#F26522]/10 flex items-center justify-center flex-shrink-0">
              {isActive ? (
                <Pause className="h-4 w-4 text-[#F26522]" />
              ) : (
                <Play className="h-4 w-4 text-[#F26522] ml-0.5" />
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">{song.title}</p>
              <p className="text-xs text-[rgba(180,200,240,0.45)]">{song.genre}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
