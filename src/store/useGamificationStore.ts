import { create } from 'zustand'
import { getLevelProgress } from '@/lib/gamification'

type GamificationState = {
  totalXp: number
  level: number
  isLevelUpModalOpen: boolean
  
  // Actions
  initialize: (initialXp: number, initialLevel: number) => void
  addXp: (amount: number) => void
  closeLevelUpModal: () => void
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  totalXp: 0,
  level: 1,
  isLevelUpModalOpen: false,

  initialize: (initialXp, initialLevel) => set({ totalXp: initialXp, level: initialLevel }),
  
  addXp: (amount) => {
    const currentXp = get().totalXp
    const currentLevel = get().level
    
    const newTotalXp = currentXp + amount
    const progress = getLevelProgress(newTotalXp)
    
    const didLevelUp = progress.currentLevel > currentLevel

    set({ 
      totalXp: newTotalXp,
      level: progress.currentLevel,
      isLevelUpModalOpen: get().isLevelUpModalOpen || didLevelUp 
    })
  },
  
  closeLevelUpModal: () => set({ isLevelUpModalOpen: false })
}))
