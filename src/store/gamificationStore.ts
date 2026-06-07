import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GamificationState {
  xp: number
  level: number
  coins: number
  streak: number
  addXp: (amount: number) => void
  addCoins: (amount: number) => void
  incrementStreak: () => void
  resetStreak: () => void
}

const calculateLevel = (xp: number) => {
  // Simple leveling formula: level = floor(sqrt(xp / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set) => ({
      xp: 0,
      level: 1,
      coins: 0,
      streak: 0,
      addXp: (amount) => set((state) => {
        const newXp = state.xp + amount
        const newLevel = calculateLevel(newXp)
        return { xp: newXp, level: newLevel }
      }),
      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
      incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
      resetStreak: () => set({ streak: 0 }),
    }),
    {
      name: 'lifeos-gamification',
    }
  )
)
