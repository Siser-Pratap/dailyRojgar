import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getCurrentSession } from '@/features/auth/api'

/**
 * On first load, validates a persisted session against the server.
 * If the token is invalid/expired (and cannot be refreshed), clears the
 * persisted auth store so the UI doesn't show a stale logged-in state.
 * Returns `true` once the check has settled.
 */
export function useHydrateAuth(): boolean {
  const { isAuthenticated, clearAuth } = useAuth()
  const [ready, setReady] = useState(!isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) {
      setReady(true)
      return
    }

    let active = true
    getCurrentSession()
      .then((data) => {
        if (active && !data?.user) clearAuth()
      })
      .catch(() => {
        if (active) clearAuth()
      })
      .finally(() => {
        if (active) setReady(true)
      })

    return () => {
      active = false
    }
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return ready
}
