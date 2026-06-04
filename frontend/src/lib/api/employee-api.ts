import { apiConfig } from '@/lib/api/config'
import { fetchAuthedJson } from '@/lib/api/authenticated'
import type { EmployeeProfile } from '@/types/hr'
const base = apiConfig.employee
export function fetchMyProfile(): Promise<EmployeeProfile> {
  return fetchAuthedJson(`${base}/api/v1/employees/me`)
}
export function fetchEmployees(): Promise<EmployeeProfile[]> {
  return fetchAuthedJson(`${base}/api/v1/employees`)
}
export function fetchEmployee(id: number): Promise<EmployeeProfile> {
  return fetchAuthedJson(`${base}/api/v1/employees/${id}`)
}
