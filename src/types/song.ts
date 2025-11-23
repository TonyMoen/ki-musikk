// Song-related type definitions for Musikkfabrikken

export interface LyricGenerationRequest {
  concept: string
  genre: string
}

export interface LyricGenerationResponse {
  data?: {
    lyrics: string
  }
  error?: {
    code: string
    message: string
  }
}

export interface PhoneticChange {
  original: string
  optimized: string
  reason: string
  lineNumber: number
}

export interface OptimizationResult {
  originalLyrics: string
  optimizedLyrics: string
  changes: PhoneticChange[]
  cacheHitRate: number
}

export interface Song {
  id: string
  user_id: string
  title: string
  genre: string
  concept?: string
  original_lyrics?: string
  optimized_lyrics?: string
  phonetic_enabled: boolean
  suno_song_id?: string
  audio_url?: string
  duration_seconds?: number
  status: 'generating' | 'completed' | 'failed'
  error_message?: string
  canvas_url?: string
  shared_count: number
  created_at: string
  updated_at: string
  deleted_at?: string
}
