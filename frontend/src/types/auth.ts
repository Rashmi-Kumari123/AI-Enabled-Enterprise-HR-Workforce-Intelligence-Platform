export type AuthTokens = {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresInSeconds: number
}
export type AuthUser = {
  id: number
  email: string
  roles: string[]
  enabled: boolean
}
export type AuthResponse = AuthTokens & {
  email: string
  roles: string[]
  tenantId?: number
  tenantSlug?: string
  mustChangePassword?: boolean
}
export type LoginRequest = {
  email: string
  password: string
}
export type SignupRequest = {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'MANAGER' | 'HR' | 'PAYROLL' | 'IT_ADMIN' | 'ADMIN'
}
export type TenantRegisterRequest = {
  companyName: string
  slug: string
  adminEmail: string
  password: string
  firstName: string
  lastName: string
}
export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}
export type ApiErrorBody = {
  message?: string
  error?: string
  status?: number
}
