import { Download, FileSpreadsheet, FileText, Calendar, TrendingUp, Users, IndianRupee, Heart, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ChartCard } from '@/components/charts/ChartCard'
import { InteractiveBarChart } from '@/components/charts/InteractiveBarChart'
import { InteractiveLineChart } from '@/components/charts/InteractiveLineChart'
import { InteractivePieChart } from '@/components/charts/InteractivePieChart'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { ScheduleReportsPanel } from '@/components/reports/ScheduleReportsPanel'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useManagerDashboard } from '@/hooks/use-manager-dashboard'
import { useWorkforceAnalytics } from '@/hooks/use-workforce-analytics'
import {
  downloadWorkforceReportCsvFromApi,
  downloadWorkforceReportExcel,
  downloadWorkforceReportPdf,
} from '@/lib/api/report-api'
import { downloadWorkforceAnalyticsCsv } from '@/lib/export-workforce-csv'
import { buildHeadcountTrend, type ChartPoint, type DateRangePreset } from '@/lib/chart-utils'
import { Card, CardContent } from '@/components/ui/card'

export function AnalyticsReportsPage() {
  const { hasRole } = useAuth()
  const allowed = hasRole('HR') || hasRole('ADMIN')
  const { analytics, isLoading, isError, error, refetch } = useWorkforceAnalytics()
  const { employees } = useManagerDashboard()
  const [dateRange, setDateRange] = useState<DateRangePreset>('1y')
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [showSchedulePanel, setShowSchedulePanel] = useState(false)
  const [exporting, setExporting] = useState<'csv' | 'excel' | 'pdf' | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const departmentChartData = useMemo<ChartPoint[]>(
    () =>
      (analytics?.departmentBreakdown ?? []).map((d) => ({
        name: d.department.slice(0, 12),
        value: d.employeeCount,
        active: d.activeCount,
      })),
    [analytics?.departmentBreakdown],
  )

  const attritionChartData = useMemo<ChartPoint[]>(
    () => [
      { name: 'High', value: analytics?.highAttritionRisk ?? 0 },
      { name: 'Medium', value: analytics?.mediumAttritionRisk ?? 0 },
    ],
    [analytics],
  )

  const skillGapChartData = useMemo<ChartPoint[]>(
    () => [
      { name: 'Employees', value: analytics?.employeesWithSkillGaps ?? 0 },
      { name: 'Total gaps', value: analytics?.totalSkillGaps ?? 0 },
    ],
    [analytics],
  )

  const headcountTrend = useMemo(
    () => buildHeadcountTrend(employees, dateRange),
    [employees, dateRange],
  )

  async function handleExport(kind: 'csv' | 'excel' | 'pdf') {
    setExportError(null)
    setExporting(kind)
    try {
      if (kind === 'csv') {
        if (analytics) {
          downloadWorkforceAnalyticsCsv(analytics)
        } else {
          await downloadWorkforceReportCsvFromApi()
        }
      } else if (kind === 'excel') {
        await downloadWorkforceReportExcel()
      } else {
        await downloadWorkforceReportPdf()
      }
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed — is ai-insights-service (8088) running?')
    } finally {
      setExporting(null)
    }
  }

  if (!allowed) {
    return (
      <div className="p-10">
        <Card className="surface-panel">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Workforce analytics is available to HR and Admin roles.
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
        eyebrow="Intelligence"
        titleHighlight="Workforce"
        titleRest="Analytics"
        description="Live workforce analytics from ai-insights-service"
        onRefresh={refetch}
      />
      <div className="space-y-8 p-6 md:p-10">
        {isError ? (
          <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">{error}</p>
        ) : null}
        {exportError ? (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{exportError}</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button
            variant="gradient"
            className="rounded-full"
            disabled={!analytics || exporting !== null}
            onClick={() => handleExport('csv')}
          >
            {exporting === 'csv' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </Button>
          <Button
            variant="outline"
            className="rounded-full bg-card"
            disabled={exporting !== null}
            onClick={() => handleExport('excel')}
          >
            {exporting === 'excel' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Export Excel
          </Button>
          <Button
            variant="outline"
            className="rounded-full bg-card"
            disabled={exporting !== null}
            onClick={() => handleExport('pdf')}
          >
            {exporting === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Export PDF
          </Button>
          <Button
            variant="outline"
            className="rounded-full bg-card"
            onClick={() => setShowSchedulePanel((open) => !open)}
          >
            <Calendar className="h-4 w-4" />
            {showSchedulePanel ? 'Hide schedules' : 'Schedule reports'}
          </Button>
        </div>

        {showSchedulePanel ? <ScheduleReportsPanel onClose={() => setShowSchedulePanel(false)} /> : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Total Employees" value={analytics?.totalEmployees ?? '—'} subtitle="Organization-wide" icon={Users} accent="teal" />
          <MetricCard title="Active Employees" value={analytics?.activeEmployees ?? '—'} subtitle="Currently active" icon={TrendingUp} accent="purple" />
          <MetricCard title="Pending Leave" value={analytics?.pendingLeaveRequests ?? '—'} subtitle="Open requests" icon={IndianRupee} accent="teal" />
          <MetricCard title="Avg Engagement" value={analytics?.averageEngagementScore.toFixed(0) ?? '—'} subtitle="Team score / 100" icon={Heart} accent="purple" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <ChartCard
            title="Department distribution"
            description="Interactive breakdown · click to drill down"
            drillDownLabel={selectedDepartment}
            onClearDrillDown={() => setSelectedDepartment(null)}
            isEmpty={departmentChartData.length === 0}
          >
            <InteractivePieChart
              data={departmentChartData.length ? departmentChartData : [{ name: '—', value: 0 }]}
              onSliceClick={(entry) =>
                setSelectedDepartment((prev) => (prev === entry.name ? null : entry.name))
              }
              activeName={selectedDepartment}
            />
          </ChartCard>
          <ChartCard
            title="Attrition risk"
            description="High vs medium risk employees"
            isEmpty={attritionChartData.every((d) => d.value === 0)}
          >
            <InteractiveBarChart data={attritionChartData} />
          </ChartCard>
          <ChartCard
            title="Skill gaps"
            description="Affected employees vs total gaps"
            isEmpty={skillGapChartData.every((d) => d.value === 0)}
          >
            <InteractiveBarChart data={skillGapChartData} />
          </ChartCard>
        </div>
        <ChartCard
          title="Headcount trend (QoQ)"
          description="Cumulative active headcount from hire dates"
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
      </div>
    </div>
  )
}
