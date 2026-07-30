const STORAGE_KEY = 'nexushr.tenantSlug'
const DEFAULT_TENANT = 'nexushr'

function normalizeSlug(slug: string | null | undefined): string | null {
  if (!slug) return null
  const normalized = slug.trim().toLowerCase()
  return normalized.length > 0 ? normalized : null
}

function slugFromHostname(): string | null {
  const host = window.location.hostname.toLowerCase()
  if (host === 'localhost' || host === '127.0.0.1') {
    return null
  }
  const parts = host.split('.')
  if (parts.length >= 3 && parts[0] !== 'www') {
    return normalizeSlug(parts[0])
  }
  return null
}

export function getStoredTenantSlug(): string | null {
  return normalizeSlug(localStorage.getItem(STORAGE_KEY))
}

export function resolveTenantSlug(): string {
  return getStoredTenantSlug() ?? slugFromHostname() ?? DEFAULT_TENANT
}

export function setTenantSlug(slug?: string): void {
  localStorage.setItem(STORAGE_KEY, normalizeSlug(slug) ?? DEFAULT_TENANT)
}

export function clearTenantSlug(): void {
  localStorage.removeItem(STORAGE_KEY)
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

export function getTenantSlugFromToken(): string | null {
  const token = localStorage.getItem('nexushr.accessToken')
  if (!token) return null
  const claims = decodeJwtPayload(token)
  const slug = claims?.tenantSlug
  return typeof slug === 'string' ? normalizeSlug(slug) : null
}

export function getTenantIdFromToken(): number | null {
  const token = localStorage.getItem('nexushr.accessToken')
  if (!token) return null
  const claims = decodeJwtPayload(token)
  const tenantId = claims?.tenantId
  return typeof tenantId === 'number' ? tenantId : null
}

export function tenantHeaders(): Record<string, string> {
  return { 'X-Tenant-Slug': resolveTenantSlug() }
}
