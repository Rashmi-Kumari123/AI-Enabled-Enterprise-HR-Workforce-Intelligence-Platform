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
