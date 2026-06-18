import { useQuery } from '@tanstack/react-query'
import * as aiApi from '@/lib/api/ai-insights-api'
import { ApiError } from '@/lib/api/http'

const LIVE_REFETCH_MS = 60_000
export function useWorkforceAnalytics() {
  const query = useQuery({
    queryKey: ['workforce-analytics'],
    queryFn: () => aiApi.fetchWorkforceAnalytics(),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })
  return {
    analytics: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error instanceof ApiError ? query.error.message : null,
    refetch: query.refetch,
  }
}
