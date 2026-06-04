import { apiConfig } from '@/lib/api/config'
import { fetchAuthedJson } from '@/lib/api/authenticated'
import type { PerformanceScorecard } from '@/types/hr'

const base = apiConfig.performance
export function fetchScorecard(employeeId: number): Promise<PerformanceScorecard> {
  return fetchAuthedJson(`${base}/api/v1/performance/reviews/employee/${employeeId}/scorecard`)
}
