import { apiConfig } from '@/lib/api/config'
import { fetchAuthedJson } from '@/lib/api/authenticated'
import { fetchJson } from '@/lib/api/http'
import { tenantHeaders } from '@/lib/tenant/tenant'
import { getAccessToken } from '@/lib/auth/storage'
import type { AuthResponse, AuthUser, ChangePasswordRequest, LoginRequest, SignupRequest, TenantRegisterRequest } from '@/types/auth'
import type { HireEmployeeInput, HireEmployeeResponse } from '@/types/hr'
const base = apiConfig.auth
function withTenant(init?: RequestInit): RequestInit {
  return {
    ...init,
    headers: {
      ...tenantHeaders(),
      ...init?.headers,
    },
  }
}
export async function registerCompany(request: TenantRegisterRequest): Promise<AuthResponse> {
  return fetchJson<AuthResponse>(`${base}/api/v1/tenants/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
}

export async function signup(request: SignupRequest): Promise<AuthResponse> {
  return fetchJson<AuthResponse>(`${base}/api/v1/auth/signup`, withTenant({
    method: 'POST',
    body: JSON.stringify(request),
  }))
}
export async function login(request: LoginRequest): Promise<AuthResponse> {
  return fetchJson<AuthResponse>(`${base}/api/v1/auth/login`, withTenant({
    method: 'POST',
    body: JSON.stringify(request),
  }))
}
export async function logout(refreshToken: string): Promise<void> {
  await fetchJson<{ message: string }>(`${base}/api/v1/auth/logout`, withTenant({
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  }))
}
export async function changePassword(request: ChangePasswordRequest): Promise<void> {
  await fetchAuthedJson(`${base}/api/v1/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...tenantHeaders() },
    body: JSON.stringify(request),
  })
}
export async function fetchCurrentUser(): Promise<AuthUser> {
  const token = getAccessToken()
  if (!token) {
    throw new Error('Not authenticated')
  }
  return fetchJson<AuthUser>(`${base}/api/v1/users/me`, {
    headers: { Authorization: `Bearer ${token}`, ...tenantHeaders() },
  })
}
export function hireEmployee(payload: HireEmployeeInput): Promise<HireEmployeeResponse> {
  return fetchAuthedJson(`${base}/api/v1/auth/hire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
