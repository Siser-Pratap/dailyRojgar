import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  _id: string
  name: string
  email: string
  phone: string
  role: 'customer' | 'worker' | 'admin'
  profileImage: string | null
  isVerified: boolean
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string) => void
  clearAuth: () => void
  updateUser: (updates: Partial<User>) => void
}

interface UIState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

interface LocationState {
  coords: { lat: number; lng: number } | null
  loading: boolean
  error: string | null
  setCoords: (coords: { lat: number; lng: number }) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// ─── Auth Store (persisted) ───────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) => {
        localStorage.setItem('accessToken', accessToken)
        set({ user, accessToken, isAuthenticated: true })
      },

      clearAuth: () => {
        localStorage.removeItem('accessToken')
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

// ─── UI Store ─────────────────────────────────────────────────────────────────
export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))

// ─── Location Store ───────────────────────────────────────────────────────────
export const useLocationStore = create<LocationState>()((set) => ({
  coords: null,
  loading: false,
  error: null,
  setCoords: (coords) => set({ coords, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}))
