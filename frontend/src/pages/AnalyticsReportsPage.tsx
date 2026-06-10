import { Download, FileSpreadsheet, Calendar, TrendingUp, Users, IndianRupee, Heart } from 'lucide-react'
import { ChartPlaceholder } from '@/components/dashboard/ChartPlaceholder'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent } from '@/components/ui/card'

export function AnalyticsReportsPage() {
  const { hasRole } = useAuth()
  const allowed = hasRole('HR') || hasRole('ADMIN') || hasRole('MANAGER')
  if (!allowed) {
    return (
      <div className="p-10">
        <Card className="surface-panel">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Workforce analytics is available to Manager, HR, and Admin roles.
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div>
      <DashboardHero
        eyebrow="Intelligence"
        titleHighlight="Workforce"
        titleRest="Analytics"
        description="Employee growth, hiring trends, payroll expenses, and diversity metrics"
      />
      <div className="space-y-8 p-6 md:p-10">
        <div className="flex flex-wrap gap-3">
          <Button variant="gradient" className="rounded-full">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" className="rounded-full bg-card">
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" className="rounded-full bg-card">
            <Calendar className="h-4 w-4" />
            Schedule Reports
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Employee Growth" value="+12%" subtitle="YoY headcount" accent="teal" icon={TrendingUp} />
          <MetricCard title="Hiring Trends" value="18" subtitle="New hires Q1" accent="purple" icon={Users} />
          <MetricCard title="Payroll Expenses" value="₹2.4Cr" subtitle="Monthly run rate" accent="teal" icon={IndianRupee} />
          <MetricCard title="Diversity Index" value="42%" subtitle="Women in leadership" accent="purple" icon={Heart} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <ChartPlaceholder title="Employee Growth" values={[120, 128, 135, 142, 151, 158]} labels={['Q3', 'Q4', 'Q1', 'Q2', 'Q3', 'Q4']} />
          <ChartPlaceholder title="Department Performance" values={[88, 76, 92, 84, 79]} labels={['Eng', 'Sales', 'HR', 'Ops', 'Mkt']} accent="purple" />
          <ChartPlaceholder title="Attrition Analysis" values={[5.2, 4.8, 4.5, 4.2, 3.9, 3.6]} labels={['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']} />
        </div>
      </div>
    </div>
  )
}
