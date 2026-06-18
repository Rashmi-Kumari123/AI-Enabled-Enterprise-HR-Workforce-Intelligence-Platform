import { apiConfig } from '@/lib/api/config'
import { fetchAuthedJson } from '@/lib/api/authenticated'
import type {
  FeedbackType,
  PerformanceFeedback,
  PerformanceReview,
  PerformanceScorecard,
} from '@/types/hr'

const base = apiConfig.performance
export const RATING_CRITERIA = [
  'TECHNICAL_SKILLS',
  'COMMUNICATION',
  'TEAMWORK',
  'DELIVERY',
  'INITIATIVE',
] as const

export type RatingInput = { criterion: string; score: number; comment?: string }
export type CreateReviewInput = {
  employeeId: number
  employeeEmail: string
  reviewYear: number
  reviewQuarter: number
  goals?: string
}
export async function fetchScorecard(employeeId: number): Promise<PerformanceScorecard> {
  return fetchAuthedJson(`${base}/api/v1/performance/reviews/employee/${employeeId}/scorecard`)
}
export function fetchReviews(employeeId: number): Promise<PerformanceReview[]> {
  return fetchAuthedJson(`${base}/api/v1/performance/reviews/employee/${employeeId}`)
}
export function fetchPendingFeedback(): Promise<PerformanceFeedback[]> {
  return fetchAuthedJson(`${base}/api/v1/performance/feedback/pending/me`)
}
export function fetchReviewFeedback(reviewId: number): Promise<PerformanceFeedback[]> {
  return fetchAuthedJson(`${base}/api/v1/performance/reviews/${reviewId}/feedback`)
}
export function createReview(payload: CreateReviewInput): Promise<PerformanceReview> {
  return fetchAuthedJson(`${base}/api/v1/performance/reviews`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
export function updateReview(
  reviewId: number,
  payload: { goals?: string; summaryComment?: string },
): Promise<PerformanceReview> {
  return fetchAuthedJson(`${base}/api/v1/performance/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
export function setReviewRatings(reviewId: number, ratings: RatingInput[]): Promise<PerformanceReview> {
  return fetchAuthedJson(`${base}/api/v1/performance/reviews/${reviewId}/ratings`, {
    method: 'PUT',
    body: JSON.stringify({ ratings }),
  })
}
export function submitReview(reviewId: number): Promise<PerformanceReview> {
  return fetchAuthedJson(`${base}/api/v1/performance/reviews/${reviewId}/submit`, {
    method: 'POST',
  })
}
export function acknowledgeReview(reviewId: number): Promise<PerformanceReview> {
  return fetchAuthedJson(`${base}/api/v1/performance/reviews/${reviewId}/acknowledge`, {
    method: 'POST',
  })
}
export function inviteFeedback(
  reviewId: number,
  feedbackType: FeedbackType,
  emails: string[],
): Promise<PerformanceFeedback[]> {
  return fetchAuthedJson(`${base}/api/v1/performance/reviews/${reviewId}/feedback/invite`, {
    method: 'POST',
    body: JSON.stringify({ feedbackType, emails }),
  })
}
export function setFeedbackRatings(feedbackId: number, ratings: RatingInput[]): Promise<PerformanceFeedback> {
  return fetchAuthedJson(`${base}/api/v1/performance/feedback/${feedbackId}/ratings`, {
    method: 'PUT',
    body: JSON.stringify({ ratings }),
  })
}
export function submitFeedback(
  feedbackId: number,
  summaryComment?: string,
): Promise<PerformanceFeedback> {
  return fetchAuthedJson(`${base}/api/v1/performance/feedback/${feedbackId}/submit`, {
    method: 'POST',
    body: JSON.stringify(summaryComment ? { summaryComment } : {}),
  })
}
