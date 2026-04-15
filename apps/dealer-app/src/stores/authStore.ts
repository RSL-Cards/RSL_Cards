import { create } from 'zustand'
import { MOCK_USER } from '../constants/mockData'

interface AuthStore {
  user: typeof MOCK_USER | null
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: () => set({ user: MOCK_USER, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}))
