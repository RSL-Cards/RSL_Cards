import { create } from "zustand";
import type { AuthUser } from "../services/authService";

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (user: AuthUser) => void;
  clearAuth: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  setAuth: (user) => set({ user, isAuthenticated: true }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
  setHydrated: () => set({ isHydrated: true }),
}));
