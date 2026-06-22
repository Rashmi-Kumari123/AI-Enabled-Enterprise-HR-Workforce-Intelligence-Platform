import { getAccessToken } from '@/lib/auth/storage'
const TENANT_SLUG_KEY = 'nexushr.tenantSlug'
const DEFAULT_TENANT = 'nexushr'

/** Map email domain → tenant slug for demo / known workspaces */
const EMAIL_DOMAIN_TO_TENANT: Record<string, string> = {
  'nexushr.com': 'nexushr',
  'beans.ai': 'beans',
  'klearnow.ai': 'klearnow',
}
interface JwtTenantClaims {
  tenantSlug?: string
  tenantId?: number
}
function readTenantClaimsFromToken(): JwtTenantClaims {
  const token = getAccessToken()
  if (!token) {
    return {}
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as JwtTenantClaims
    return payload ?? {}
  } catch {
    return {}
  }
}
export function getTenantSlugFromToken(): string | null {
  const slug = readTenantClaimsFromToken().tenantSlug
  return slug ? slug.toLowerCase() : null
}
export function inferTenantSlugFromEmail(email: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase().trim()
  if (!domain) {
    return null
  }
  return EMAIL_DOMAIN_TO_TENANT[domain] ?? null
}
export function resolveTenantSlug(email?: string): string {
  const fromToken = getTenantSlugFromToken()
  if (fromToken) {
    return fromToken
  }
  const fromEmail = email ? inferTenantSlugFromEmail(email) : null
  if (fromEmail) {
    return fromEmail
  }
  const stored = localStorage.getItem(TENANT_SLUG_KEY)
  if (stored) {
    return stored
  }
  const host = window.location.hostname.toLowerCase()
  if (host === 'localhost' || host === '127.0.0.1') {
    return DEFAULT_TENANT
  }
  const parts = host.split('.')
  if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'api') {
    return parts[0]
  }
  return DEFAULT_TENANT
}
export function setTenantSlug(slug: string): void {
  localStorage.setItem(TENANT_SLUG_KEY, slug.toLowerCase())
}
export function clearTenantSlug(): void {
  localStorage.removeItem(TENANT_SLUG_KEY)
}
export function tenantHeaders(email?: string): Record<string, string> {
  const slug = resolveTenantSlug(email)
  setTenantSlug(slug)
  return { 'X-Tenant-Slug': slug }
}
