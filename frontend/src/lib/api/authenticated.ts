import { fetchJson } from '@/lib/api/http'
import { getAccessToken } from '@/lib/auth/storage'
export async function fetchAuthedJson<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken()
  if (!token) {
    throw new Error('Not authenticated')
  }
  return fetchJson<T>(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  })
}
