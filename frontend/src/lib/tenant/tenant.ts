/** Single-company mode: all users belong to the NexusHR organization. */
const DEFAULT_TENANT = 'nexushr'

export function resolveTenantSlug(): string {
  return DEFAULT_TENANT
}

export function getTenantSlugFromToken(): string | null {
  return DEFAULT_TENANT
}

export function inferTenantSlugFromEmail(): string | null {
  return DEFAULT_TENANT
}

export function setTenantSlug(): void {
  localStorage.setItem('nexushr.tenantSlug', DEFAULT_TENANT)
}

export function clearTenantSlug(): void {
  localStorage.removeItem('nexushr.tenantSlug')
}

export function tenantHeaders(): Record<string, string> {
  return { 'X-Tenant-Slug': DEFAULT_TENANT }
}
