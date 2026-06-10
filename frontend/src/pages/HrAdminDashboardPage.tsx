import { Building2, CalendarClock, IndianRupee, TrendingDown, UserCheck, Users } from 'lucide-react'
import { AiInsightBanner } from '@/components/dashboard/AiInsightBanner'
import { ChartPlaceholder } from '@/components/dashboard/ChartPlaceholder'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useManagerDashboard } from '@/hooks/use-manager-dashboard'
export function HrAdminDashboardPage() {
  const { hasRole } = useAuth()
  const allowed = hasRole('HR') || hasRole('ADMIN')
  const { employees, pendingLeaves, metrics, isLoading, refetch } = useManagerDashboard()
  if (!allowed) {
    return (
      <div className="p-10">
        <Card className="surface-panel">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Workforce Command Center is available to HR and Admin roles.
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div>
      <DashboardHero
        eyebrow="HR Administration"
        titleHighlight="Workforce"
        titleRest="Command Center"
        description="Enterprise KPIs, analytics, and AI recommendations across your organization"
        onRefresh={refetch}
      />
      <div className="space-y-8 p-6 md:p-10">
        <AiInsightBanner message="Sales department shows increased attrition risk — 3 employees flagged for immediate review." />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <MetricCard title="Total Employees" value={metrics.totalEmployees} subtitle="Organization-wide" icon={Users} accent="teal" />
          <MetricCard title="Active Employees" value={metrics.activeEmployees} subtitle="Currently working" icon={UserCheck} accent="purple" />
          <MetricCard title="New Hires" value={12} subtitle="Last 30 days" icon={Users} accent="teal" />
          <MetricCard title="Attrition Rate" value="4.2%" subtitle="Rolling 90 days" icon={TrendingDown} accent="purple" />
          <MetricCard title="Payroll Status" value="On track" subtitle="March cycle processing" icon={IndianRupee} accent="teal" />
          <MetricCard title="Open Leave Requests" value={metrics.pendingLeaveRequests} subtitle="Awaiting approval" icon={CalendarClock} accent="purple" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <ChartPlaceholder title="Employee Growth Trend" values={[42, 48, 52, 58, 64, 71]} labels={['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']} />
          <ChartPlaceholder title="Attendance Analytics" values={[92, 94, 91, 95, 93, 96]} labels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6']} accent="purple" />
          <ChartPlaceholder title="Department Distribution" values={[35, 22, 18, 15, 10]} labels={['Eng', 'Sales', 'HR', 'Ops', 'Other']} />
        </div>

        <Card className="surface-panel border-0">
          <CardHeader>
            <SectionHeader title="Workforce Engagement Score" description={`${employees.length} employees · Live roster data`} />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-brand text-3xl font-bold text-white shadow-lg">
                78
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-medium">Company-wide engagement index</p>
                <p className="text-muted-foreground">+5 pts vs last quarter · Attendance, performance & leave signals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {!isLoading && pendingLeaves.length > 0 ? (
          <Card className="surface-panel border-0">
            <CardHeader>
              <SectionHeader title="Priority actions" description="Items requiring HR attention" />
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingLeaves.slice(0, 4).map((leave) => (
                <div key={leave.id} className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3 text-sm">
                  <span>Leave request · Employee #{leave.employeeId}</span>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
