import { useQueries } from '@tanstack/react-query'
import * as employeeApi from '@/lib/api/employee-api'
import * as leaveApi from '@/lib/api/leave-api'
import { ApiError } from '@/lib/api/http'
export function useManagerDashboard() {
  const queries = useQueries({
    queries: [
      {
        queryKey: ['team-employees'],
        queryFn: () => employeeApi.fetchEmployees(),
        retry: false,
        refetchInterval: 30_000,
      },
      {
        queryKey: ['pending-leaves'],
        queryFn: () => leaveApi.fetchPendingLeaves(),
        retry: false,
        refetchInterval: 30_000,
      },
    ],
  })
  const [employeesQ, pendingQ] = queries
  const employees = employeesQ.data ?? []
  const pendingLeaves = pendingQ.data ?? []

  const activeCount = employees.filter((e) => e.employmentStatus === 'ACTIVE').length
  const departmentCount = new Set(employees.map((e) => e.departmentName).filter(Boolean)).size

  function errorMessage(error: unknown): string | null {
    if (!error) return null
    if (error instanceof ApiError) return error.message
    if (error instanceof Error) return error.message
    return 'Request failed'
  }
  return {
    isLoading: employeesQ.isLoading || pendingQ.isLoading,
    employeesFailed: employeesQ.isError,
    leavesFailed: pendingQ.isError,
    employeesError: errorMessage(employeesQ.error),
    leavesError: errorMessage(pendingQ.error),
    employees,
    pendingLeaves,
    metrics: {
      totalEmployees: employees.length,
      activeEmployees: activeCount,
      pendingLeaveRequests: pendingLeaves.length,
      departments: departmentCount,
    },
    refetch: () => {
      employeesQ.refetch()
      pendingQ.refetch()
    },
  }
}
