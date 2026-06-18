import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as employeeApi from '@/lib/api/employee-api'
import { ApiError } from '@/lib/api/http'

const LIVE_REFETCH_MS = 30_000
export function useEmployeeLifecycle() {
  const queryClient = useQueryClient()
  const pipelineQuery = useQuery({
    queryKey: ['onboarding-pipeline'],
    queryFn: () => employeeApi.fetchOnboardingPipeline(),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })
  const employeesQuery = useQuery({
    queryKey: ['employees-directory'],
    queryFn: () => employeeApi.fetchEmployees(),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })
  const completeMutation = useMutation({
    mutationFn: ({ employeeId, taskId }: { employeeId: number; taskId: number }) =>
      employeeApi.completeOnboardingTask(employeeId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-pipeline'] })
      queryClient.invalidateQueries({ queryKey: ['employee-profile'] })
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] })
    },
  })
  const offboardMutation = useMutation({
    mutationFn: ({ employeeId, reason }: { employeeId: number; reason?: string }) =>
      employeeApi.offboardEmployee(employeeId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-pipeline'] })
      queryClient.invalidateQueries({ queryKey: ['employees-directory'] })
    },
  })
  return {
    pipeline: pipelineQuery.data ?? [],
    employees: employeesQuery.data ?? [],
    isLoading: pipelineQuery.isLoading || employeesQuery.isLoading,
    isError: pipelineQuery.isError,
    error: pipelineQuery.error instanceof ApiError ? pipelineQuery.error.message : null,
    completeTask: completeMutation.mutateAsync,
    isCompleting: completeMutation.isPending,
    offboard: offboardMutation.mutateAsync,
    isOffboarding: offboardMutation.isPending,
    refetch: () => {
      pipelineQuery.refetch()
      employeesQuery.refetch()
    },
  }
}
