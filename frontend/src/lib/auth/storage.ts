const ACCESS_TOKEN_KEY = 'nexushr.accessToken'
const REFRESH_TOKEN_KEY = 'nexushr.refreshToken'
const MUST_CHANGE_PASSWORD_KEY = 'nexushr.mustChangePassword'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}
export function mustChangePassword(): boolean {
  return localStorage.getItem(MUST_CHANGE_PASSWORD_KEY) === 'true'
}
export function setTokens(accessToken: string, refreshToken: string, forcePasswordChange = false): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  localStorage.setItem(MUST_CHANGE_PASSWORD_KEY, String(forcePasswordChange))
}
export function clearMustChangePassword(): void {
  localStorage.setItem(MUST_CHANGE_PASSWORD_KEY, 'false')
}
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY)
}
export function hasStoredSession(): boolean {
  return Boolean(getAccessToken())
}
