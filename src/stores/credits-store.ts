import { create } from 'zustand'

interface CreditsStore {
  balance: number
  setBalance: (balance: number) => void
  refreshBalance: () => Promise<void>
}

export const useCreditsStore = create<CreditsStore>((set) => ({
  balance: 0,
  setBalance: (balance) => set({ balance }),
  refreshBalance: async () => {
    try {
      const res = await fetch('/api/credits/balance')
      if (!res.ok) {
        throw new Error('Failed to fetch balance')
      }
      const { data } = await res.json()
      set({ balance: data.balance })
    } catch (error) {
      console.error('Error refreshing balance:', error)
    }
  }
}))
