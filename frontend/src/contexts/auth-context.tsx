import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '@/lib/api/auth-api'
import { ApiError } from '@/lib/api/http'
import {
  clearTokens,
  getRefreshToken,
  hasStoredSession,
  setTokens,
} from '@/lib/auth/storage'
import type { AuthResponse, AuthUser, LoginRequest, SignupRequest } from '@/types/auth'

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (request: LoginRequest) => Promise<void>
  signup: (request: SignupRequest) => Promise<void>
  logout: () => Promise<void>
  hasRole: (role: string) => boolean
}
const AuthContext = createContext<AuthContextValue | null>(null)
function toUser(response: AuthResponse): AuthUser {
  return {
    id: 0,
    email: response.email,
    roles: [...response.roles],
    enabled: true,
  }
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const restoreSession = useCallback(async () => {
    if (!hasStoredSession()) {
      setUser(null)
      return
    }
    try {
      const profile = await authApi.fetchCurrentUser()
      setUser(profile)
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        clearTokens()
      }
      setUser(null)
    }
  }, [])
  useEffect(() => {
    restoreSession().finally(() => setIsLoading(false))
  }, [restoreSession])

  const login = useCallback(async (request: LoginRequest) => {
    const response = await authApi.login(request)
    setTokens(response.accessToken, response.refreshToken)
    try {
      const profile = await authApi.fetchCurrentUser()
      setUser(profile)
    } catch {
      setUser(toUser(response))
    }
  }, [])
  const signup = useCallback(async (request: SignupRequest) => {
    const response = await authApi.signup(request)
    setTokens(response.accessToken, response.refreshToken)
    try {
      const profile = await authApi.fetchCurrentUser()
      setUser(profile)
    } catch {
      setUser(toUser(response))
    }
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        // Clear local session even if server logout fails
      }
    }
    clearTokens()
    setUser(null)
  }, [])

  const hasRole = useCallback(
    (role: string) => {
      const normalized = role.startsWith('ROLE_') ? role : `ROLE_${role}`
      return user?.roles.includes(normalized) ?? false
    },
    [user],
  )

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      signup,
      logout,
      hasRole,
    }),
    [user, isLoading, login, signup, logout, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
