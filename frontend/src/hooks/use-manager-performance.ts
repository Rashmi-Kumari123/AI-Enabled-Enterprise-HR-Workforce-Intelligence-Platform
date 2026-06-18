import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as employeeApi from '@/lib/api/employee-api'
import * as performanceApi from '@/lib/api/performance-api'
import type { CreateReviewInput, RatingInput } from '@/lib/api/performance-api'
import type { FeedbackType } from '@/types/hr'
import { ApiError } from '@/lib/api/http'

const LIVE_REFETCH_MS = 30_000
export function useManagerPerformance(selectedEmployeeId: number | null) {
  const queryClient = useQueryClient()
  const employeesQuery = useQuery({
    queryKey: ['employees-directory'],
    queryFn: () => employeeApi.fetchEmployees(),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })
  const reviewsQuery = useQuery({
    queryKey: ['performance-reviews', selectedEmployeeId],
    queryFn: () => performanceApi.fetchReviews(selectedEmployeeId!),
    enabled: Boolean(selectedEmployeeId),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })
  const scorecardQuery = useQuery({
    queryKey: ['performance-scorecard', selectedEmployeeId],
    queryFn: () => performanceApi.fetchScorecard(selectedEmployeeId!),
    enabled: Boolean(selectedEmployeeId),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })
  const reviews = reviewsQuery.data ?? []
  const draftReview = reviews.find((r) => r.status === 'DRAFT') ?? null
  const draftReviewId = draftReview?.id
  const feedbackQuery = useQuery({
    queryKey: ['performance-feedback', draftReviewId],
    queryFn: () => performanceApi.fetchReviewFeedback(draftReviewId!),
    enabled: Boolean(draftReviewId),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })
  const createMutation = useMutation({
    mutationFn: (payload: CreateReviewInput) => performanceApi.createReview(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews', variables.employeeId] })
      queryClient.invalidateQueries({ queryKey: ['performance-scorecard', variables.employeeId] })
      queryClient.invalidateQueries({ queryKey: ['performance-feedback'] })
    },
  })
  const updateMutation = useMutation({
    mutationFn: ({
      reviewId,
      goals,
      summaryComment,
    }: {
      reviewId: number
      goals?: string
      summaryComment?: string
    }) => performanceApi.updateReview(reviewId, { goals, summaryComment }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['performance-reviews'] }),
  })
  const ratingsMutation = useMutation({
    mutationFn: ({ reviewId, ratings }: { reviewId: number; ratings: RatingInput[] }) =>
      performanceApi.setReviewRatings(reviewId, ratings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['performance-feedback'] })
    },
  })
  const submitMutation = useMutation({
    mutationFn: (reviewId: number) => performanceApi.submitReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['performance-scorecard'] })
    },
  })
  const inviteMutation = useMutation({
    mutationFn: ({
      reviewId,
      feedbackType,
      emails,
    }: {
      reviewId: number
      feedbackType: FeedbackType
      emails: string[]
    }) => performanceApi.inviteFeedback(reviewId, feedbackType, emails),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['performance-feedback'] }),
  })
  const employees = (employeesQuery.data ?? []).filter((e) => e.employmentStatus !== 'TERMINATED')
  return {
    employees,
    reviews,
    draftReview,
    scorecard: scorecardQuery.data,
    feedback: feedbackQuery.data ?? [],
    selectedEmployee: employees.find((e) => e.id === selectedEmployeeId) ?? null,
    isLoading: employeesQuery.isLoading,
    error: employeesQuery.error instanceof ApiError ? employeesQuery.error.message : null,
    createReview: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError:
      createMutation.error instanceof ApiError ? createMutation.error.message : null,
    updateReview: updateMutation.mutateAsync,
    setRatings: ratingsMutation.mutateAsync,
    submitReview: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    inviteFeedback: inviteMutation.mutateAsync,
    refetch: () => {
      employeesQuery.refetch()
      reviewsQuery.refetch()
      scorecardQuery.refetch()
      feedbackQuery.refetch()
    },
  }
}
