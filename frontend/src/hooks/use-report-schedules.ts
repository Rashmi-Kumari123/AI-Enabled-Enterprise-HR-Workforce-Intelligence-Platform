import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as reportApi from '@/lib/api/report-api'
import type { CreateReportScheduleInput } from '@/types/report-schedule'

export function useReportSchedules() {
  const queryClient = useQueryClient()
  const schedulesQuery = useQuery({
    queryKey: ['report-schedules'],
    queryFn: () => reportApi.fetchReportSchedules(),
    retry: false,
  })
  const createMutation = useMutation({
    mutationFn: (payload: CreateReportScheduleInput) => reportApi.createReportSchedule(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['report-schedules'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => reportApi.deleteReportSchedule(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['report-schedules'] }),
  })
  const runNowMutation = useMutation({
    mutationFn: (id: number) => reportApi.runReportScheduleNow(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['report-schedules'] }),
  })
  return {
    schedules: schedulesQuery.data ?? [],
    isLoading: schedulesQuery.isLoading,
    isError: schedulesQuery.isError,
    createSchedule: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteSchedule: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    runScheduleNow: runNowMutation.mutateAsync,
    isRunning: runNowMutation.isPending,
    refetch: schedulesQuery.refetch,
  }
}
