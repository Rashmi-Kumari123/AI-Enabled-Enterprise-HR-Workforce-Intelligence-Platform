import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext } from '@/contexts/auth-context'
import * as authApi from '@/lib/api/auth-api'
import { ApiError } from '@/lib/api/http'
import { clearTokens, getRefreshToken, hasStoredSession, setTokens } from '@/lib/auth/storage';
import { clearTenantSlug, getTenantSlugFromToken, setTenantSlug } from '@/lib/tenant/tenant'
import type { AuthResponse, AuthUser, LoginRequest, SignupRequest } from '@/types/auth'

function toUser(response: AuthResponse): AuthUser {
  return {
    id: 0,
    email: response.email,
    roles: [...response.roles],
    enabled: true,
  }
}
async function loadStoredUser(): Promise<AuthUser | null> {
  if (!hasStoredSession()) {
    return null
  }
  try {
    const profile = await authApi.fetchCurrentUser()
    const slug = getTenantSlugFromToken()
    if (slug) {
      setTenantSlug(slug)
    }
    return profile
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      clearTokens()
    }
    return null
  }
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    let cancelled = false
    void loadStoredUser().then((profile) => {
      if (!cancelled) {
        setUser(profile)
        setIsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (request: LoginRequest) => {
    const response = await authApi.login(request)
    if (response.tenantSlug) {
      setTenantSlug(response.tenantSlug)
    }
    setTokens(response.accessToken, response.refreshToken, Boolean(response.mustChangePassword))
    try {
      const profile = await authApi.fetchCurrentUser()
      setUser(profile)
    } catch {
      setUser(toUser(response))
    }
  }, [])

  const signup = useCallback(async (request: SignupRequest) => {
    const response = await authApi.signup(request)
    if (response.tenantSlug) {
      setTenantSlug(response.tenantSlug)
    }
    setTokens(response.accessToken, response.refreshToken, Boolean(response.mustChangePassword))
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
    clearTenantSlug()
    setUser(null)
  }, [])

  const hasRole = useCallback(
    (role: string) => {
      const normalized = role.startsWith('ROLE_') ? role : `ROLE_${role}`
      return user?.roles.includes(normalized) ?? false
    },
    [user],
  )
  const value = useMemo(() => ({ user, isAuthenticated: Boolean(user), isLoading, login, signup, logout, hasRole }), [user, isLoading, login, signup, logout, hasRole])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
