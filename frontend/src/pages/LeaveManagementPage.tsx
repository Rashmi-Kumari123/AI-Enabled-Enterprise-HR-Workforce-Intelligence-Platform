import { Calendar, CheckCircle2, Clock } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const leaveBalances = [
  { type: 'Sick Leave', available: 8, total: 12 },
  { type: 'Casual Leave', available: 5, total: 10 },
  { type: 'Earned Leave', available: 14, total: 18 },
]

const leaveHistory = [
  { id: 1, type: 'Casual Leave', dates: 'Apr 12–14, 2026', status: 'PENDING' as const },
  { id: 2, type: 'Sick Leave', dates: 'Mar 3, 2026', status: 'APPROVED' as const },
  { id: 3, type: 'Earned Leave', dates: 'Feb 20–22, 2026', status: 'APPROVED' as const },
]

export function LeaveManagementPage() {
  return (
    <div>
      <DashboardHero
        eyebrow="Time off"
        titleHighlight="Leave"
        titleRest="Management"
        description="Apply for leave, track balances, and monitor approval status"
      />
      <div className="space-y-8 p-6 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="grid flex-1 gap-4 sm:grid-cols-3">
            {leaveBalances.map((lb) => (
              <MetricCard
                key={lb.type}
                title={lb.type}
                value={`${lb.available} days`}
                subtitle={`${lb.total - lb.available} used of ${lb.total}`}
                icon={Calendar}
                accent={lb.type.includes('Earned') ? 'purple' : 'teal'}
              />
            ))}
          </div>
        </div>

        <Button variant="gradient" className="rounded-full">
          Apply Leave
        </Button>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="surface-panel border-0">
            <CardHeader>
              <SectionHeader title="Leave History" description="Your recent requests" />
            </CardHeader>
            <CardContent className="space-y-3">
              {leaveHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
                  <div>
                    <p className="font-medium">{item.type}</p>
                    <p className="text-xs text-muted-foreground">{item.dates}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="surface-panel border-0">
            <CardHeader>
              <SectionHeader title="Approval Timeline" description="Manager review workflow" />
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {['Submitted', 'Manager Review', 'HR Approval', 'Confirmed'].map((step, i) => (
                  <li key={step} className="flex items-center gap-3 text-sm">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        i <= 1 ? 'bg-gradient-brand text-white' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {i <= 1 ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <span className={i <= 1 ? 'font-medium' : 'text-muted-foreground'}>{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <Card className="ai-glow border border-brand-teal/20">
          <CardContent className="flex items-center justify-between py-5">
            <div>
              <p className="text-sm font-semibold">Manager Approval Widget</p>
              <p className="text-xs text-muted-foreground">1 pending request awaiting your manager&apos;s review</p>
            </div>
            <StatusBadge status="PENDING" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
