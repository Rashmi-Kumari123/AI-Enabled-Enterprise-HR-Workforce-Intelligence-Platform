import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import * as aiApi from '@/lib/api/ai-insights-api'
import { ApiError } from '@/lib/api/http'

const LIVE_REFETCH_MS = 60_000

export function useWorkforceIntelligence() {
  const { hasRole } = useAuth()
  const enabled = hasRole('HR') || hasRole('ADMIN') || hasRole('MANAGER')

  const attritionQuery = useQuery({
    queryKey: ['ai-attrition-team'],
    queryFn: () => aiApi.fetchTeamAttrition(),
    enabled,
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })

  const engagementQuery = useQuery({
    queryKey: ['ai-engagement-team'],
    queryFn: () => aiApi.fetchTeamEngagement(),
    enabled,
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })

  const skillsQuery = useQuery({
    queryKey: ['ai-skills-team'],
    queryFn: () => aiApi.fetchTeamSkillGaps(),
    enabled,
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })

  const isLoading = enabled && (attritionQuery.isLoading || engagementQuery.isLoading || skillsQuery.isLoading)
  const isError = attritionQuery.isError || engagementQuery.isError || skillsQuery.isError
  const error =
    [attritionQuery.error, engagementQuery.error, skillsQuery.error].find((e) => e instanceof ApiError) instanceof ApiError
      ? (() => {
          const apiErr = [attritionQuery.error, engagementQuery.error, skillsQuery.error].find(
            (e) => e instanceof ApiError,
          ) as ApiError
          if (apiErr.status === 403) {
            return 'Access denied — AI team insights require HR, Manager, or Admin role. Try logging in with hr@nexushr.com or manager@nexushr.com'
          }
          return apiErr.message
        })()
      : (attritionQuery.error instanceof ApiError ? attritionQuery.error.message : null) ??
        (engagementQuery.error instanceof ApiError ? engagementQuery.error.message : null) ??
        (skillsQuery.error instanceof ApiError ? skillsQuery.error.message : null) ??
        'Failed to load AI insights'

  return {
    isLoading,
    isError,
    error,
    attrition: attritionQuery.data,
    engagement: engagementQuery.data,
    skills: skillsQuery.data,
    refetch: () => {
      attritionQuery.refetch()
      engagementQuery.refetch()
      skillsQuery.refetch()
    },
  }
}
