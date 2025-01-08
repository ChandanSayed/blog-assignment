import { create } from 'zustand'

interface LoadingState {
  isHydrating: boolean
  setIsHydrating: (state: boolean) => void
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isHydrating: true,
  setIsHydrating: (state) => set({ isHydrating: state }),
})) 