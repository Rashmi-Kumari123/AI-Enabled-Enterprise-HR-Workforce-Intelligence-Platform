import { apiConfig } from '@/lib/api/config'
import { fetchAuthedJson } from '@/lib/api/authenticated'
import type { AttendanceRecord } from '@/types/hr'
const base = apiConfig.attendance
export function fetchTodayAttendance(employeeId: number): Promise<AttendanceRecord> {
  return fetchAuthedJson(`${base}/api/v1/attendance/employee/${employeeId}/today`)
}
export function fetchAttendanceHistory(employeeId: number): Promise<AttendanceRecord[]> {
  return fetchAuthedJson(`${base}/api/v1/attendance/employee/${employeeId}`)
}

export function clockIn(employeeId: number, notes?: string): Promise<AttendanceRecord> {
  return fetchAuthedJson(`${base}/api/v1/attendance/clock-in`, {
    method: 'POST',
    body: JSON.stringify({ employeeId, notes: notes ?? null }),
  })
}
export function clockOut(employeeId: number, notes?: string): Promise<AttendanceRecord> {
  return fetchAuthedJson(`${base}/api/v1/attendance/clock-out`, {
    method: 'POST',
    body: JSON.stringify({ employeeId, notes: notes ?? null }),
  })
}
