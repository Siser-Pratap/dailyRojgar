import { useAuthStore } from '@/app/store'

/** Thin selector over the auth store for ergonomic access in components. */
export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const updateUser = useAuthStore((s) => s.updateUser)

  return { user, isAuthenticated, role: user?.role ?? null, setAuth, clearAuth, updateUser }
}
