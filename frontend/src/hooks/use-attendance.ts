import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as attendanceApi from '@/lib/api/attendance-api'
import * as employeeApi from '@/lib/api/employee-api'
import { ApiError } from '@/lib/api/http'
const LIVE_REFETCH_MS = 30_000
function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function workHoursToday(clockIn: string | null, clockOut: string | null): string {
  if (!clockIn) return '—'
  const start = new Date(clockIn).getTime()
  const end = clockOut ? new Date(clockOut).getTime() : Date.now()
  const hours = Math.max(0, end - start) / 3_600_000
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}
function monthlyAttendancePercent(records: { status: string }[]): number {
  if (records.length === 0) return 0
  const present = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length
  return Math.round((present / records.length) * 100)
}
export function useAttendance() {
  const queryClient = useQueryClient()
  const profileQuery = useQuery({
    queryKey: ['employee-profile'],
    queryFn: () => employeeApi.fetchMyProfile(),
    retry: false,
  })
  const employeeId = profileQuery.data?.id
  const todayQuery = useQuery({
    queryKey: ['attendance-today', employeeId],
    queryFn: () => attendanceApi.fetchTodayAttendance(employeeId!),
    enabled: Boolean(employeeId),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })
  const historyQuery = useQuery({
    queryKey: ['attendance-history', employeeId],
    queryFn: () => attendanceApi.fetchAttendanceHistory(employeeId!),
    enabled: Boolean(employeeId),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['attendance-today', employeeId] })
    queryClient.invalidateQueries({ queryKey: ['attendance-history', employeeId] })
  }
  const clockInMutation = useMutation({
    mutationFn: () => attendanceApi.clockIn(employeeId!),
    onSuccess: invalidate,
  })
  const clockOutMutation = useMutation({
    mutationFn: () => attendanceApi.clockOut(employeeId!),
    onSuccess: invalidate,
  })
  const today = todayQuery.data
  const history = historyQuery.data ?? []
  const currentMonth = new Date().getMonth() + 1
  const monthRecords = history.filter((r) => {
    const d = new Date(r.workDate)
    return d.getMonth() + 1 === currentMonth
  })
  return {
    profile: profileQuery.data,
    profileError: profileQuery.error instanceof ApiError ? profileQuery.error.message : null,
    isLoading: profileQuery.isLoading || todayQuery.isLoading,
    today,
    history,
    monthRecords,
    metrics: {
      checkIn: today?.clockIn ? formatTime(today.clockIn) : '—',
      workHours: workHoursToday(today?.clockIn ?? null, today?.clockOut ?? null),
      monthlyPercent: monthlyAttendancePercent(monthRecords),
      canCheckIn: !today?.clockIn,
      canCheckOut: Boolean(today?.clockIn) && !today?.clockOut,
    },
    clockIn: () => clockInMutation.mutateAsync(),
    clockOut: () => clockOutMutation.mutateAsync(),
    isClockingIn: clockInMutation.isPending,
    isClockingOut: clockOutMutation.isPending,
    actionError:
      (clockInMutation.error instanceof ApiError ? clockInMutation.error.message : null) ??
      (clockOutMutation.error instanceof ApiError ? clockOutMutation.error.message : null),
    refetch: () => {
      todayQuery.refetch()
      historyQuery.refetch()
    },
  }
}
