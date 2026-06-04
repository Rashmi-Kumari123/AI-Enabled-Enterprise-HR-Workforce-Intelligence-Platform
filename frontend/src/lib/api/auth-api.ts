import { apiConfig } from '@/lib/api/config'
import { fetchJson } from '@/lib/api/http'
import { getAccessToken } from '@/lib/auth/storage'
import type { AuthResponse, AuthUser, LoginRequest, SignupRequest } from '@/types/auth'

const base = apiConfig.auth
export async function signup(request: SignupRequest): Promise<AuthResponse> {
  return fetchJson<AuthResponse>(`${base}/api/v1/auth/signup`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}
export async function login(request: LoginRequest): Promise<AuthResponse> {
  return fetchJson<AuthResponse>(`${base}/api/v1/auth/login`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}
export async function logout(refreshToken: string): Promise<void> {
  await fetchJson<{ message: string }>(`${base}/api/v1/auth/logout`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })
}
export async function fetchCurrentUser(): Promise<AuthUser> {
  const token = getAccessToken()
  if (!token) {
    throw new Error('Not authenticated')
  }
  return fetchJson<AuthUser>(`${base}/api/v1/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}
