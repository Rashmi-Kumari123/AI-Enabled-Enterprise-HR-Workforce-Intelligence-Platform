import { Bell, Brain, CheckCircle2, Loader2, Mail, Moon, Sparkles, Wifi, WifiOff, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { usePlatformStatus, type PlatformStatusItem } from '@/hooks/use-platform-status'
import { cn } from '@/lib/utils'

function statusIcon(status: PlatformStatusItem['status']) {
  switch (status) {
    case 'operational':
      return CheckCircle2
    case 'degraded':
      return Wifi
    default:
      return XCircle
  }
}
function statusClass(status: PlatformStatusItem['status']) {
  switch (status) {
    case 'operational':
      return 'badge-success'
    case 'degraded':
      return 'badge-warning'
    default:
      return 'badge-danger'
  }
}
const capabilities = [
  { label: 'Attrition prediction', description: 'AI-driven turnover risk scoring', icon: Brain },
  { label: 'Engagement & skill gaps', description: 'Workforce development intelligence', icon: Sparkles },
  { label: 'Real-time alerts', description: 'Instant in-app notifications', icon: Bell },
  { label: 'Workforce analytics', description: 'Executive HR dashboards and exports', icon: CheckCircle2 },
  { label: 'Email & SMS delivery', description: 'Multi-channel employee communications', icon: Mail },
  { label: 'Accessible UI', description: 'Light and dark mode across the platform', icon: Moon },
] as const

export function PlatformStatusPage() {
  const { hasRole } = useAuth()
  const allowed = hasRole('HR') || hasRole('ADMIN') || hasRole('MANAGER')
  const isAdminOrHr = hasRole('ADMIN') || hasRole('HR')
  const {
    items,
    operationalCount,
    totalCount,
    platformReady,
    aiInsightsOperational,
    notificationsOperational,
    isLoading,
    refetch,
  } = usePlatformStatus()
  if (!allowed) {
    return (
      <div className="p-10">
        <Card className="surface-panel">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Platform status is available to Manager, HR, and Admin roles.
          </CardContent>
        </Card>
      </div>
    )
  }
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-teal" />
      </div>
    )
  }
  return (
    <div>
      <DashboardHero
        eyebrow="Platform operations"
        titleHighlight="Intelligence &"
        titleRest="notifications status"
        description="Monitor AI workforce intelligence and employee notification channels across NexusHR"
        onRefresh={refetch}
      />
      <div className="space-y-8 p-6 md:p-10">
        <Card
          className={cn(
            'surface-panel border-2',
            platformReady ? 'border-teal-500/40' : 'border-amber-500/40',
          )}
        >
          <CardContent className="flex flex-wrap items-center gap-6 pt-6">
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-2xl',
                platformReady
                  ? 'bg-teal-500/15 text-brand-teal'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
              )}
            >
              {platformReady ? <CheckCircle2 className="h-8 w-8" /> : <WifiOff className="h-8 w-8" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold">
                {platformReady ? 'All systems operational' : 'Some services need attention'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {operationalCount}/{totalCount} checks passing · AI insights{' '}
                {aiInsightsOperational ? 'live' : 'offline'} · Notifications{' '}
                {notificationsOperational ? 'live' : 'offline'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="rounded-full bg-card">
                <Link to="/dashboard/insights">
                  <Sparkles className="h-4 w-4" />
                  AI insights
                </Link>
              </Button>
              {isAdminOrHr ? (
                <Button asChild variant="outline" className="rounded-full bg-card">
                  <Link to="/dashboard/admin">
                    <Brain className="h-4 w-4" />
                    Analytics
                  </Link>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => {
            const Icon = statusIcon(item.status)
            return (
              <Card key={item.id} className="surface-panel border-0">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <SectionHeader title={item.label} description={item.detail} />
                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase',
                        statusClass(item.status),
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {item.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
        <Card className="surface-panel border-0">
          <CardHeader>
            <SectionHeader
              title="Platform capabilities"
              description="Intelligence and communication features included in NexusHR"
            />
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 sm:grid-cols-2">
              {capabilities.map(({ label, description, icon: Icon }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-brand-teal">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
