import { Clock, LogIn, LogOut } from 'lucide-react'
import { ChartPlaceholder } from '@/components/dashboard/ChartPlaceholder'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const calendarDays = Array.from({ length: 28 }, (_, i) => ({
  day: i + 1,
  present: i % 5 !== 0 && i % 7 !== 0,
}))

export function AttendancePage() {
  return (
    <div>
      <DashboardHero
        eyebrow="Time & attendance"
        titleHighlight="Attendance &"
        titleRest="Time Tracking"
        description="Check in, track hours, and monitor monthly attendance patterns"
      />
      <div className="space-y-8 p-6 md:p-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Today's Check-In" value="9:02 AM" subtitle="On time" icon={LogIn} accent="teal" />
          <MetricCard title="Work Hours" value="6h 24m" subtitle="Today so far" icon={Clock} accent="purple" />
          <MetricCard title="Monthly Attendance" value="96%" subtitle="March 2026" icon={Clock} accent="teal" />
          <MetricCard title="Weekly Average" value="8.2h" subtitle="Per working day" icon={LogOut} accent="purple" />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="gradient" className="rounded-full">
            <LogIn className="h-4 w-4" />
            Check In
          </Button>
          <Button variant="outline" className="rounded-full bg-card">
            <LogOut className="h-4 w-4" />
            Check Out
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="surface-panel border-0">
            <CardHeader>
              <SectionHeader title="Attendance Calendar" description="March 2026" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center text-xs">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                  <span key={d} className="font-medium text-muted-foreground">
                    {d}
                  </span>
                ))}
                {calendarDays.map(({ day, present }) => (
                  <div
                    key={day}
                    className={`flex h-9 items-center justify-center rounded-lg text-sm font-medium ${
                      present ? 'bg-teal-500/15 text-teal-700 dark:text-teal-400' : 'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <ChartPlaceholder title="Attendance Trend" values={[88, 92, 90, 94, 96, 95]} labels={['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']} />
            <ChartPlaceholder title="Working Hours Analytics" values={[7.8, 8.1, 8.4, 8.2, 8.5, 8.3]} labels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6']} accent="purple" />
          </div>
        </div>
      </div>
    </div>
  )
}
