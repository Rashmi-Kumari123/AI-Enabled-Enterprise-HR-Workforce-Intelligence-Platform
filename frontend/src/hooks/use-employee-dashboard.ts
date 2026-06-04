import { useQueries, useQuery } from '@tanstack/react-query'
import * as attendanceApi from '@/lib/api/attendance-api'
import * as employeeApi from '@/lib/api/employee-api'
import * as leaveApi from '@/lib/api/leave-api'
import * as payrollApi from '@/lib/api/payroll-api'
import * as performanceApi from '@/lib/api/performance-api'
import { ApiError } from '@/lib/api/http'
export function useEmployeeDashboard() {
  const profileQuery = useQuery({
    queryKey: ['employee-profile'],
    queryFn: () => employeeApi.fetchMyProfile(),
    retry: false,
  })
  const profile = profileQuery.data
  const employeeId = profile?.id
  const metricsQueries = useQueries({
    queries: [
      {
        queryKey: ['attendance-today', employeeId],
        queryFn: () => attendanceApi.fetchTodayAttendance(employeeId!),
        enabled: Boolean(employeeId),
        retry: false,
      },
      {
        queryKey: ['leaves', employeeId],
        queryFn: () => leaveApi.fetchLeavesByEmployee(employeeId!),
        enabled: Boolean(employeeId),
        retry: false,
      },
      {
        queryKey: ['payslip-latest', employeeId],
        queryFn: () => payrollApi.fetchLatestPayslip(employeeId!),
        enabled: Boolean(employeeId),
        retry: false,
      },
      {
        queryKey: ['performance-scorecard', employeeId],
        queryFn: () => performanceApi.fetchScorecard(employeeId!),
        enabled: Boolean(employeeId),
        retry: false,
      },
      {
        queryKey: ['attendance-history', employeeId],
        queryFn: () => attendanceApi.fetchAttendanceHistory(employeeId!),
        enabled: Boolean(employeeId),
        retry: false,
      },
    ],
  })
  const [todayQ, leavesQ, payslipQ, scorecardQ, historyQ] = metricsQueries
  const leaves = leavesQ.data ?? []
  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING').length
  const approvedLeaves = leaves.filter((l) => l.status === 'APPROVED').length
  const isLoading = profileQuery.isLoading
  const profileError = profileQuery.error
  return {
    profile,
    profileError: profileError instanceof ApiError ? profileError : null,
    isLoading,
    todayAttendance: todayQ.data,
    todayError: todayQ.error instanceof ApiError ? todayQ.error : null,
    leaves,
    pendingLeaves,
    approvedLeaves,
    latestPayslip: payslipQ.data ?? null,
    scorecard: scorecardQ.data ?? null,
    attendanceHistory: (historyQ.data ?? []).slice(0, 5),
    refetch: () => {
      profileQuery.refetch()
      metricsQueries.forEach((q) => q.refetch())
    },
  }
}
