import { apiConfig } from '@/lib/api/config'
import { fetchAuthedJson } from '@/lib/api/authenticated'
import type { LeaveRequest } from '@/types/hr'

const base = apiConfig.leave
export function fetchLeavesByEmployee(employeeId: number): Promise<LeaveRequest[]> {
  return fetchAuthedJson(`${base}/api/v1/leaves/employee/${employeeId}`)
}
export function fetchPendingLeaves(): Promise<LeaveRequest[]> {
  return fetchAuthedJson(`${base}/api/v1/leaves/pending`)
}

