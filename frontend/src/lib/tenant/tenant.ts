/** Single-company mode: all users belong to the NexusHR organization. */
const DEFAULT_TENANT = 'nexushr'

export function resolveTenantSlug(_email?: string): string {
  return DEFAULT_TENANT
}

export function getTenantSlugFromToken(): string | null {
  return DEFAULT_TENANT
}

export function inferTenantSlugFromEmail(_email: string): string | null {
  return DEFAULT_TENANT
}

export function setTenantSlug(_slug: string): void {
  localStorage.setItem('nexushr.tenantSlug', DEFAULT_TENANT)
}

export function clearTenantSlug(): void {
  localStorage.removeItem('nexushr.tenantSlug')
}

export function tenantHeaders(_email?: string): Record<string, string> {
  return { 'X-Tenant-Slug': DEFAULT_TENANT }
}
