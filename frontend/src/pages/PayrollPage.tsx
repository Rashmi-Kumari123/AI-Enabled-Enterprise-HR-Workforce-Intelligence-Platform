import { Download, IndianRupee, Receipt, TrendingUp } from 'lucide-react'
import { ChartPlaceholder } from '@/components/dashboard/ChartPlaceholder'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const breakdown = [
  { label: 'Basic Salary', amount: '₹85,000' },
  { label: 'HRA', amount: '₹34,000' },
  { label: 'Special Allowance', amount: '₹12,500' },
  { label: 'Tax Deductions', amount: '-₹18,200' },
  { label: 'PF Contribution', amount: '-₹10,200' },
]

export function PayrollPage() {
  return (
    <div>
      <DashboardHero
        eyebrow="Compensation"
        titleHighlight="Payroll &"
        titleRest="Compensation"
        description="Salary overview, payslips, deductions, and compensation analytics"
      />
      <div className="space-y-8 p-6 md:p-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Current Salary" value="₹1,31,500" subtitle="CTC per month" icon={IndianRupee} accent="teal" />
          <MetricCard title="Monthly Earnings" value="₹1,31,500" subtitle="March 2026 gross" icon={TrendingUp} accent="purple" />
          <MetricCard title="Tax Deductions" value="₹18,200" subtitle="TDS + professional tax" icon={Receipt} accent="teal" />
          <MetricCard title="Net Pay" value="₹1,03,100" subtitle="Take-home this month" icon={IndianRupee} accent="purple" />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="gradient" className="rounded-full">
            <Download className="h-4 w-4" />
            Download Payslip
          </Button>
          <Button variant="outline" className="rounded-full bg-card">
            Payroll History
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="surface-panel border-0">
            <CardHeader>
              <SectionHeader title="Compensation Breakdown" description="March 2026" />
            </CardHeader>
            <CardContent className="space-y-3">
              {breakdown.map((row) => (
                <div key={row.label} className="flex justify-between rounded-xl bg-muted/30 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-semibold">{row.amount}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                <span>Net Pay</span>
                <span className="stat-value-teal">₹1,03,100</span>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <ChartPlaceholder title="Salary Trend" values={[98000, 99500, 101000, 103100, 103100, 103100]} labels={['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']} />
            <ChartPlaceholder title="Deduction Analytics" values={[15200, 16100, 16800, 17200, 17800, 18200]} labels={['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']} accent="purple" />
          </div>
        </div>
      </div>
    </div>
  )
}
