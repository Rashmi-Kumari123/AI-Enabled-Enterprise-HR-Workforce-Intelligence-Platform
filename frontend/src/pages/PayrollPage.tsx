import { Download, IndianRupee, Loader2, Receipt, Settings2, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChartCard } from '@/components/charts/ChartCard'
import { InteractiveAreaChart } from '@/components/charts/InteractiveAreaChart'
import { InteractiveBarChart } from '@/components/charts/InteractiveBarChart'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { usePayroll } from '@/hooks/use-payroll'
import type { DateRangePreset } from '@/lib/chart-utils'

function formatInr(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
}

export function PayrollPage() {
  const { hasRole } = useAuth()
  const isHrAdmin = hasRole('HR') || hasRole('ADMIN')
  const { isLoading, latest, payslips, metrics, breakdown, downloadLatest, error, refetch } = usePayroll()
  const [dateRange, setDateRange] = useState<DateRangePreset>('1y')

  const salaryTrendData = useMemo(
    () =>
      [...payslips]
        .slice(0, 12)
        .reverse()
        .map((p) => ({
          name: `${p.payMonth}/${String(p.payYear).slice(2)}`,
          value: Number(p.netPay),
        })),
    [payslips],
  )

  const deductionTrendData = useMemo(
    () =>
      [...payslips]
        .slice(0, 12)
        .reverse()
        .map((p) => ({
          name: `${p.payMonth}/${String(p.payYear).slice(2)}`,
          value: Number(p.totalDeductions ?? 0),
        })),
    [payslips],
  )

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
        eyebrow="Compensation"
        titleHighlight="Payroll &"
        titleRest="Compensation"
        description="Live payslips and salary data from payroll-service"
        onRefresh={refetch}
      />
      <div className="space-y-8 p-6 md:p-10">
        {isHrAdmin ? (
          <Card className="surface-panel border-brand-teal/30 bg-teal-500/5">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium">HR payroll console</p>
                <p className="text-sm text-muted-foreground">
                  Configure salaries, run payroll, and mark payments from Payroll Ops.
                </p>
              </div>
              <Button variant="gradient" className="rounded-full" asChild>
                <Link to="/dashboard/payroll/operations">
                  <Settings2 className="h-4 w-4" />
                  Open Payroll Ops
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {error ? (
          <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            {error} — start payroll-service (8083) if needed.
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Current Salary" value={metrics.currentSalary} subtitle="Estimated monthly CTC" icon={IndianRupee} accent="teal" />
          <MetricCard title="Monthly Earnings" value={metrics.monthlyEarnings} subtitle="Latest gross pay" icon={TrendingUp} accent="purple" />
          <MetricCard title="Tax Deductions" value={metrics.taxDeductions} subtitle="Latest period" icon={Receipt} accent="teal" />
          <MetricCard title="Net Pay" value={metrics.netPay} subtitle="Take-home" icon={IndianRupee} accent="purple" />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="gradient" className="rounded-full" disabled={!latest} onClick={() => downloadLatest()}>
            <Download className="h-4 w-4" />
            Download Payslip
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="surface-panel border-0">
            <CardHeader>
              <SectionHeader title="Compensation Breakdown" description={latest ? latest.payslipNumber : 'No payslip yet'} />
            </CardHeader>
            <CardContent className="space-y-3">
              {breakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payslip data available yet.</p>
              ) : (
                <>
                  {breakdown.map((row) => (
                    <div key={row.label} className="flex justify-between rounded-xl bg-muted/30 px-4 py-3 text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-semibold">{row.amount}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                    <span>Net Pay</span>
                    <span className="stat-value-teal">{metrics.netPay}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <div className="space-y-6">
            <ChartCard
              title="Net pay trend"
              description="Monthly net salary from payslip history"
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              isEmpty={salaryTrendData.length === 0}
            >
              <InteractiveAreaChart
                data={salaryTrendData}
                color="#0d9488"
                valueFormatter={formatInr}
              />
            </ChartCard>
            <ChartCard
              title="Deduction analytics"
              description="Total deductions per pay period"
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              isEmpty={deductionTrendData.length === 0}
            >
              <InteractiveBarChart
                data={deductionTrendData}
                valueFormatter={formatInr}
              />
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  )
}
