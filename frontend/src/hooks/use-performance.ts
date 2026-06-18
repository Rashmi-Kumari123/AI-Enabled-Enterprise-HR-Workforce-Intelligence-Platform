import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as employeeApi from '@/lib/api/employee-api'
import * as performanceApi from '@/lib/api/performance-api'
import type { RatingInput } from '@/lib/api/performance-api'
import { ApiError } from '@/lib/api/http'
const LIVE_REFETCH_MS = 30_000
export function usePerformance() {
  const queryClient = useQueryClient()
  const profileQuery = useQuery({
    queryKey: ['employee-profile'],
    queryFn: () => employeeApi.fetchMyProfile(),
    retry: false,
  })
  const employeeId = profileQuery.data?.id

  const scorecardQuery = useQuery({
    queryKey: ['performance-scorecard', employeeId],
    queryFn: () => performanceApi.fetchScorecard(employeeId!),
    enabled: Boolean(employeeId),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })
  const pendingFeedbackQuery = useQuery({
    queryKey: ['performance-pending-feedback'],
    queryFn: () => performanceApi.fetchPendingFeedback(),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })
  const scorecard = scorecardQuery.data
  const latestReview = scorecard?.recentReviews?.[0]
  const reviewFeedbackQuery = useQuery({
    queryKey: ['performance-feedback', latestReview?.id],
    queryFn: () => performanceApi.fetchReviewFeedback(latestReview!.id),
    enabled: Boolean(latestReview?.id),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })

  const pendingFeedback = pendingFeedbackQuery.data ?? []
  const reviewFeedback = reviewFeedbackQuery.data ?? []
  const skillEntries = Object.entries(scorecard?.averageByCriterion ?? {}).map(([skill, score]) => ({
    skill: skill.replaceAll('_', ' '),
    level: Math.round((Number(score) / 5) * 100),
    score: Number(score),
  }))
  const feedbackTypeEntries = Object.entries(scorecard?.averageByFeedbackType ?? {}).map(
    ([type, score]) => ({
      type: type.replaceAll('_', ' '),
      score: Number(score),
    }),
  )
  const trendValues = (scorecard?.trendByQuarter ?? []).map((p) => Number(p.averageRating ?? 0))
  const trendLabels = (scorecard?.trendByQuarter ?? []).map((p) => `Q${p.reviewQuarter} ${String(p.reviewYear).slice(2)}`)
  const goals = latestReview?.goals
    ? latestReview.goals.split('\n').filter(Boolean).map((name) => ({ name }))
    : []

  const acknowledgeMutation = useMutation({
    mutationFn: (reviewId: number) => performanceApi.acknowledgeReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-scorecard'] })
    },
  })
  const submitFeedbackMutation = useMutation({
    mutationFn: ({
      feedbackId,
      ratings,
      summaryComment,
    }: {
      feedbackId: number
      ratings: RatingInput[]
      summaryComment?: string
    }) =>
      performanceApi.setFeedbackRatings(feedbackId, ratings).then(() =>
        performanceApi.submitFeedback(feedbackId, summaryComment),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-scorecard'] })
      queryClient.invalidateQueries({ queryKey: ['performance-pending-feedback'] })
    },
  })
  const canAcknowledge =
    latestReview?.status === 'SUBMITTED' &&
    reviewFeedback.some((f) => f.feedbackType === 'SELF' && f.status === 'SUBMITTED')
  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading || scorecardQuery.isLoading,
    scorecard,
    latestReview,
    pendingFeedback,
    goals,
    skills: skillEntries,
    feedbackByType: feedbackTypeEntries,
    trendValues,
    trendLabels,
    canAcknowledge,
    error: scorecardQuery.error instanceof ApiError ? scorecardQuery.error.message : null,
    metrics: {
      rating: scorecard?.averageOverallRating?.toFixed(1) ?? '—',
      reviewCount: scorecard?.totalReviews ?? 0,
      reviewCycle: latestReview
        ? `Q${latestReview.reviewQuarter} ${latestReview.reviewYear}`
        : '—',
      status: latestReview?.status ?? '—',
    },
    acknowledgeReview: acknowledgeMutation.mutateAsync,
    isAcknowledging: acknowledgeMutation.isPending,
    submitFeedback: submitFeedbackMutation.mutateAsync,
    isSubmittingFeedback: submitFeedbackMutation.isPending,
    refetch: () => {
      scorecardQuery.refetch()
      pendingFeedbackQuery.refetch()
    },
  }
}
