import { useQuery } from '@tanstack/react-query'
import { apiConfig } from '@/lib/api/config'
type HealthResponse = {
  status: string
  service: string
}
const services = [
  { key: 'auth', label: 'Auth', url: apiConfig.auth, path: '/api/v1/auth/health' },
  { key: 'employee', label: 'Employee', url: apiConfig.employee, path: '/api/v1/employees/health' },
  { key: 'attendance', label: 'Attendance', url: apiConfig.attendance, path: '/api/v1/attendance/health' },
  { key: 'leave', label: 'Leave', url: apiConfig.leave, path: '/api/v1/leaves/health' },
  { key: 'payroll', label: 'Payroll', url: apiConfig.payroll, path: '/api/v1/payroll/health' },
  { key: 'performance', label: 'Performance', url: apiConfig.performance, path: '/api/v1/performance/health' },
  { key: 'notifications', label: 'Notifications', url: apiConfig.notifications, path: '/api/v1/notifications/health' },
  { key: 'ai-insights', label: 'AI Insights', url: apiConfig.aiInsights, path: '/api/v1/ai/health' },
] as const

async function fetchServiceHealth(url: string, path: string): Promise<HealthResponse> {
  const response = await fetch(`${url}${path}`)
  if (!response.ok) {
    throw new Error(`${response.status}`)
  }
  return response.json() as Promise<HealthResponse>
}
export function useServicesHealth() {
  return useQuery({
    queryKey: ['services-health'],
    queryFn: async () => {
      const results = await Promise.allSettled(
        services.map(async (s) => {
          const data = await fetchServiceHealth(s.url, s.path)
          return { ...s, data, ok: true as const }
        }),
      )
      return results.map((result, index) => {
        const service = services[index]
        if (result.status === 'fulfilled') {
          return result.value
        }
        return { ...service, data: null, ok: false as const, error: String(result.reason) }
      })
    },
    refetchInterval: 30_000,
  })
}
