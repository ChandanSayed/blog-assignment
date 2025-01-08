'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@prisma/client'

interface UserState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'user-storage', // unique name for localStorage key
    }
  )
) 