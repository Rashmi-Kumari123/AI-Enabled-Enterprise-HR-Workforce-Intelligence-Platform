import { WorkforceIntelligencePage } from '@/pages/WorkforceIntelligencePage'
import { AnalyticsReportsPage } from '@/pages/AnalyticsReportsPage'

export function ExecutiveDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Executive Overview</h1>
        <p className="text-sm text-muted-foreground">
          Read-only workforce analytics and KPIs for leadership.
        </p>
      </div>
      <WorkforceIntelligencePage />
      <AnalyticsReportsPage />
    </div>
  )
}
