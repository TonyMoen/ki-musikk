import { create } from 'zustand'

export interface GeneratingSong {
  id: string
  title: string
  genre: string
  startedAt: Date
}

interface GeneratingSongStore {
  generatingSong: GeneratingSong | null
  setGeneratingSong: (song: GeneratingSong) => void
  clearGeneratingSong: () => void
}

export const useGeneratingSongStore = create<GeneratingSongStore>((set) => ({
  generatingSong: null,
  setGeneratingSong: (song) => set({ generatingSong: song }),
  clearGeneratingSong: () => set({ generatingSong: null }),
}))
