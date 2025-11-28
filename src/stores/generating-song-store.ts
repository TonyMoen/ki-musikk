import { create } from 'zustand'

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
  generatingSong: GeneratingSong | null
  setGeneratingSong: (song: GeneratingSong) => void
  updateGeneratingSong: (updates: Partial<GeneratingSong>) => void
  clearGeneratingSong: () => void
}

export const useGeneratingSongStore = create<GeneratingSongStore>((set) => ({
  generatingSong: null,
  setGeneratingSong: (song) => set({ generatingSong: song }),
  updateGeneratingSong: (updates) => set((state) => ({
    generatingSong: state.generatingSong
      ? { ...state.generatingSong, ...updates }
      : null
  })),
  clearGeneratingSong: () => set({ generatingSong: null }),
}))
