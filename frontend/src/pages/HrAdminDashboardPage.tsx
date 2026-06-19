import { Building2, CalendarClock, IndianRupee, TrendingDown, UserCheck, Users, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AiInsightBanner } from '@/components/dashboard/AiInsightBanner'
import { ChartCard } from '@/components/charts/ChartCard'
import { InteractiveBarChart } from '@/components/charts/InteractiveBarChart'
import { InteractiveLineChart } from '@/components/charts/InteractiveLineChart'
import { InteractivePieChart } from '@/components/charts/InteractivePieChart'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { useManagerDashboard } from '@/hooks/use-manager-dashboard'
import { useWorkforceAnalytics } from '@/hooks/use-workforce-analytics'
import { useWorkforceIntelligence } from '@/hooks/use-workforce-intelligence'
import { buildHeadcountTrend, type ChartPoint, type DateRangePreset } from '@/lib/chart-utils'

export function HrAdminDashboardPage() {
  const { hasRole } = useAuth()
  const allowed = hasRole('HR') || hasRole('ADMIN')
  const { employees, pendingLeaves, metrics, isLoading, refetch } = useManagerDashboard()
  const { analytics, refetch: refetchAnalytics } = useWorkforceAnalytics()
  const { attrition, engagement, refetch: refetchAi } = useWorkforceIntelligence()
  const [dateRange, setDateRange] = useState<DateRangePreset>('1y')
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)

  const departmentChartData = useMemo<ChartPoint[]>(() => {
    const breakdown = analytics?.departmentBreakdown ?? []
    if (breakdown.length === 0) {
      return [{ name: 'All', value: metrics.departments }]
    }
    return breakdown.map((d) => ({
      name: d.department.slice(0, 12),
      value: d.employeeCount,
      active: d.activeCount,
    }))
  }, [analytics?.departmentBreakdown, metrics.departments])

  const attritionChartData = useMemo<ChartPoint[]>(() => {
    const low =
      (attrition?.employeeCount ?? 0) -
      (attrition?.highRiskCount ?? 0) -
      (attrition?.mediumRiskCount ?? 0)
    return [
      { name: 'High', value: analytics?.highAttritionRisk ?? attrition?.highRiskCount ?? 0 },
      { name: 'Medium', value: analytics?.mediumAttritionRisk ?? attrition?.mediumRiskCount ?? 0 },
      { name: 'Low', value: Math.max(low, 0) },
    ]
  }, [analytics, attrition])

  const engagementChartData = useMemo<ChartPoint[]>(
    () => [
      { name: 'High', value: engagement?.highEngagementCount ?? 0 },
      {
        name: 'Moderate',
        value: engagement?.scores?.filter((s) => s.engagementLevel === 'MODERATE').length ?? 0,
      },
      { name: 'Low', value: engagement?.lowEngagementCount ?? 0 },
    ],
    [engagement],
  )

  const headcountTrend = useMemo(
    () => buildHeadcountTrend(employees, dateRange),
    [employees, dateRange],
  )

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

  const topRisk = attrition?.predictions?.[0]

  function handleRefresh() {
    refetch()
    refetchAnalytics()
    refetchAi()
  }

  return (
    <div>
      <DashboardHero
        eyebrow="HR Administration"
        titleHighlight="Workforce"
        titleRest="Command Center"
        description="Enterprise KPIs, analytics, and AI recommendations across your organization"
        onRefresh={handleRefresh}
      />
      <div className="space-y-8 p-6 md:p-10">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
          </div>
        ) : null}

        <AiInsightBanner
          message={
            topRisk
              ? `${topRisk.employeeName} (${topRisk.department ?? 'General'}) shows ${topRisk.riskLevel} attrition risk — score ${topRisk.riskScore}/100.`
              : 'Workforce intelligence is up to date — no critical attrition alerts.'
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <MetricCard
            title="Total Employees"
            value={analytics?.totalEmployees ?? metrics.totalEmployees}
            subtitle="Organization-wide"
            icon={Users}
            accent="teal"
          />
          <MetricCard
            title="Active Employees"
            value={analytics?.activeEmployees ?? metrics.activeEmployees}
            subtitle="Currently working"
            icon={UserCheck}
            accent="purple"
          />
          <MetricCard
            title="High Attrition Risk"
            value={analytics?.highAttritionRisk ?? attrition?.highRiskCount ?? '—'}
            subtitle="AI-flagged employees"
            icon={TrendingDown}
            accent="purple"
          />
          <MetricCard
            title="Skill Gaps"
            value={analytics?.totalSkillGaps ?? '—'}
            subtitle={`${analytics?.employeesWithSkillGaps ?? 0} employees`}
            icon={Users}
            accent="teal"
          />
          <MetricCard
            title="Avg Engagement"
            value={analytics?.averageEngagementScore.toFixed(0) ?? engagement?.averageEngagementScore.toFixed(0) ?? '—'}
            subtitle="Team score / 100"
            icon={IndianRupee}
            accent="teal"
          />
          <MetricCard
            title="Open Leave Requests"
            value={analytics?.pendingLeaveRequests ?? metrics.pendingLeaveRequests}
            subtitle="Awaiting approval"
            icon={CalendarClock}
            accent="purple"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <ChartCard
            title="Department distribution"
            description="Click a slice to drill down"
            drillDownLabel={selectedDepartment}
            onClearDrillDown={() => setSelectedDepartment(null)}
            isEmpty={departmentChartData.every((d) => d.value === 0)}
          >
            <InteractivePieChart
              data={departmentChartData}
              onSliceClick={(entry) =>
                setSelectedDepartment((prev) => (prev === entry.name ? null : entry.name))
              }
              activeName={selectedDepartment}
            />
          </ChartCard>
          <ChartCard
            title="Attrition risk bands"
            description="Live AI risk scoring across roster"
            isEmpty={attritionChartData.every((d) => d.value === 0)}
          >
            <InteractiveBarChart data={attritionChartData} />
          </ChartCard>
          <ChartCard
            title="Engagement bands"
            description="High · moderate · low engagement"
            isEmpty={engagementChartData.every((d) => d.value === 0)}
          >
            <InteractiveBarChart data={engagementChartData} />
          </ChartCard>
        </div>

        <ChartCard
          title="Headcount trend (QoQ)"
          description="Cumulative active employees by hire quarter"
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          isEmpty={headcountTrend.length === 0}
        >
          <InteractiveLineChart
            data={headcountTrend}
            series={[
              { key: 'value', label: 'Headcount', color: '#0d9488' },
              { key: 'hires', label: 'New hires', color: '#7c3aed' },
            ]}
            showLegend
          />
        </ChartCard>

        <Card className="surface-panel border-0">
          <CardHeader>
            <SectionHeader title="Workforce Engagement Score" description={`${employees.length} employees · Live roster data`} />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-brand text-3xl font-bold text-white shadow-lg">
                {engagement?.averageEngagementScore.toFixed(0) ?? analytics?.averageEngagementScore.toFixed(0) ?? '—'}
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-medium">Company-wide engagement index</p>
                <p className="text-muted-foreground">
                  {engagement?.highEngagementCount ?? 0} high · {engagement?.lowEngagementCount ?? 0} low engagement
                </p>
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
                  <span>
                    Leave request · Employee #{leave.employeeId} · {leave.leaveType}
                  </span>
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
