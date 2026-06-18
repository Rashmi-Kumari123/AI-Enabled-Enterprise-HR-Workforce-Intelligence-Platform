import { apiConfig } from '@/lib/api/config'
import { fetchAuthedJson } from '@/lib/api/authenticated'
import type { LeaveBalance, LeaveRequest } from '@/types/hr'
const base = apiConfig.leave
export function fetchLeaveBalances(employeeId: number): Promise<LeaveBalance[]> {
  return fetchAuthedJson(`${base}/api/v1/leaves/employee/${employeeId}/balances`)
}
export function fetchLeavesByEmployee(employeeId: number): Promise<LeaveRequest[]> {
  return fetchAuthedJson(`${base}/api/v1/leaves/employee/${employeeId}`)
}
export function fetchPendingLeaves(): Promise<LeaveRequest[]> {
  return fetchAuthedJson(`${base}/api/v1/leaves/pending`)
}
export type LeaveSubmitPayload = {
  employeeId: number
  leaveType: string
  startDate: string
  endDate: string
  reason: string
}
export function submitLeave(payload: LeaveSubmitPayload): Promise<LeaveRequest> {
  return fetchAuthedJson(`${base}/api/v1/leaves`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
export function approveLeave(id: number, comment?: string): Promise<LeaveRequest> {
  return fetchAuthedJson(`${base}/api/v1/leaves/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({comment: comment ?? null}),
  })
}
export function rejectLeave(id: number, comment?: string): Promise<LeaveRequest> {
  return fetchAuthedJson(`${base}/api/v1/leaves/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ comment: comment ?? null }),
  })
}

