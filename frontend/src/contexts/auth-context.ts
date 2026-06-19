import { createContext } from 'react'
import type { AuthUser, LoginRequest, SignupRequest } from '@/types/auth'
export type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (request: LoginRequest) => Promise<void>
  signup: (request: SignupRequest) => Promise<void>
  logout: () => Promise<void>
  hasRole: (role: string) => boolean
}
export const AuthContext = createContext<AuthContextValue | null>(null)
