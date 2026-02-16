import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const MAX_CONCURRENT_SONGS = 4
// Remove generating songs older than 10 minutes on rehydration
const STALE_THRESHOLD_MS = 10 * 60 * 1000

export interface GeneratingSong {
  id: string
  title: string
  genre: string
  startedAt: Date
  // Early playback support (FIRST_SUCCESS)
  isPartial?: boolean  // True when first track ready but still generating
  streamAudioUrl?: string  // Streaming URL available at FIRST_SUCCESS
  duration?: number
}

interface GeneratingSongStore {
  generatingSongs: GeneratingSong[]
  _hasHydrated: boolean
  addGeneratingSong: (song: GeneratingSong) => boolean // Returns false if at max capacity
  updateGeneratingSong: (songId: string, updates: Partial<GeneratingSong>) => void
  removeGeneratingSong: (songId: string) => void
  clearAllGeneratingSongs: () => void
  getGeneratingSongCount: () => number
  canAddMoreSongs: () => boolean
}

export const useGeneratingSongStore = create<GeneratingSongStore>()(
  persist(
    (set, get) => ({
      generatingSongs: [],
      _hasHydrated: false,

      addGeneratingSong: (song) => {
        const current = get().generatingSongs
        if (current.length >= MAX_CONCURRENT_SONGS) {
          return false
        }
        // Don't add duplicates
        if (current.some(s => s.id === song.id)) {
          return true
        }
        set({ generatingSongs: [...current, song] })
        return true
      },

      updateGeneratingSong: (songId, updates) => set((state) => ({
        generatingSongs: state.generatingSongs.map(song =>
          song.id === songId ? { ...song, ...updates } : song
        )
      })),

      removeGeneratingSong: (songId) => set((state) => ({
        generatingSongs: state.generatingSongs.filter(song => song.id !== songId)
      })),

      clearAllGeneratingSongs: () => set({ generatingSongs: [] }),

      getGeneratingSongCount: () => get().generatingSongs.length,

      canAddMoreSongs: () => get().generatingSongs.length < MAX_CONCURRENT_SONGS,
    }),
    {
      name: 'generating-songs',
      onRehydrateStorage: () => () => {
        useGeneratingSongStore.setState({ _hasHydrated: true })
      },
      // Convert Date strings back to Date objects on rehydration
      // and filter out stale entries
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<GeneratingSongStore> | undefined
        if (!persisted?.generatingSongs) return currentState

        const now = Date.now()
        const rehydrated = persisted.generatingSongs
          .map(song => ({
            ...song,
            startedAt: new Date(song.startedAt),
          }))
          .filter(song => now - song.startedAt.getTime() < STALE_THRESHOLD_MS)

        return {
          ...currentState,
          generatingSongs: rehydrated,
        }
      },
    }
  )
)
