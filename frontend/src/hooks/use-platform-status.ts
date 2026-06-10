import { useQuery } from '@tanstack/react-query'
import { useServicesHealth } from '@/hooks/use-service-health'
export type PlatformStatusItem = {
  id: string
  label: string
  status: 'operational' | 'degraded' | 'down'
  detail: string
}
export function usePlatformStatus() {
  const health = useServicesHealth()
  const query = useQuery({
    queryKey: ['platform-status', health.data],
    queryFn: async (): Promise<PlatformStatusItem[]> => {
      const services = health.data ?? []
      return services.map((s) => ({
        id: s.key,
        label: s.label,
        status: s.ok ? ('operational' as const) : ('down' as const),
        detail: s.ok ? `${s.data?.service ?? s.label} is healthy` : 'Service unreachable',
      }))
    },
    enabled: !health.isLoading,
  })
  const items = query.data ?? []
  const operationalCount = items.filter((i) => i.status === 'operational').length
  return {
    items,
    operationalCount,
    totalCount: items.length,
    platformReady: operationalCount >= 4,
    aiInsightsOperational: items.some((i) => i.id === 'ai-insights' && i.status === 'operational'),
    notificationsOperational: items.some((i) => i.id === 'notifications' && i.status === 'operational'),
    isLoading: health.isLoading || query.isLoading,
    refetch: () => {
      health.refetch()
      query.refetch()
    },
  }
}
