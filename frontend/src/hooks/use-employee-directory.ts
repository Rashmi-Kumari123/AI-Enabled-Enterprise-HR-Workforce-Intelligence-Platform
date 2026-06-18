import { useQuery } from '@tanstack/react-query'
import * as employeeApi from '@/lib/api/employee-api'
const LIVE_REFETCH_MS = 60_000
export function useEmployeeDirectory() {
  const query = useQuery({
    queryKey: ['team-employees'],
    queryFn: () => employeeApi.fetchEmployees(),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })
  return {
    employees: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}
