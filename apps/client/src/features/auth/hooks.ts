import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { ROUTES } from '@/constants/routes'
import { getApiErrorMessage } from '@/lib/apiError'
import { login, register, logout, AuthResult } from './api'
import { getDashboardRoute } from './authRedirect'

/** Logs in and routes to the intended page (or role dashboard). */
export function useLogin(redirectTo?: string) {
  const { setAuth } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  return useMutation({
    mutationFn: login,
    onSuccess: (result: AuthResult) => {
      setAuth(result.user, result.tokens.accessToken, result.tokens.refreshToken)
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}`)
      navigate(redirectTo ?? getDashboardRoute(result.user.role), { replace: true })
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Login failed. Check your credentials.')),
  })
}

/** Registers and routes to the new user's role dashboard. */
export function useRegister() {
  const { setAuth } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  return useMutation({
    mutationFn: register,
    onSuccess: (result: AuthResult) => {
      setAuth(result.user, result.tokens.accessToken, result.tokens.refreshToken)
      toast.success('Account created')
      navigate(getDashboardRoute(result.user.role), { replace: true })
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Registration failed. Review your details.')),
  })
}

/** Logs out (best-effort server call) and clears the local session. */
export function useLogout() {
  const { clearAuth } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  return useMutation({
    mutationFn: logout,
    // Always clear locally, even if the server call fails (e.g. token expired).
    onSettled: () => {
      clearAuth()
      toast.success('Logged out')
      navigate(ROUTES.LOGIN, { replace: true })
    },
  })
}
