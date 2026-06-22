import { ApiError, fetchJson, parseErrorMessage } from '@/lib/api/http'
import { getAccessToken } from '@/lib/auth/storage'
import { resolveTenantSlug } from '@/lib/tenant/tenant'
function authHeaders(init?: RequestInit): HeadersInit {
  const token = getAccessToken()
  if (!token) {
    throw new Error('Not authenticated')
  }
  return {
    Authorization: `Bearer ${token}`,
    'X-Tenant-Slug': resolveTenantSlug(),
    ...init?.headers,
  }
}
export async function fetchAuthedJson<T>(url: string, init?: RequestInit): Promise<T> {
  return fetchJson<T>(url, {
    ...init,
    headers: authHeaders(init),
  })
}
export async function fetchAuthedBlob(url: string, init?: RequestInit): Promise<Blob> {
  const response = await fetch(url, {
    ...init,
    headers: authHeaders(init),
  })
  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response))
  }
  return response.blob()
}
export async function fetchAuthedVoid(url: string, init?: RequestInit): Promise<void> {
  const response = await fetch(url, {
    ...init,
    headers: authHeaders(init),
  })
  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response))
  }
}
export async function fetchAuthedMultipart<T>(url: string, body: FormData): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body,
  })
  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response))
  }
  return response.json() as Promise<T>
}
