import { Clock, Loader2, LogIn, LogOut } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ChartCard } from '@/components/charts/ChartCard'
import { InteractiveAreaChart } from '@/components/charts/InteractiveAreaChart'
import { InteractiveBarChart } from '@/components/charts/InteractiveBarChart'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAttendance } from '@/hooks/use-attendance'
import { filterAttendanceHistory, type DateRangePreset } from '@/lib/chart-utils'

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function AttendancePage() {
  const { isLoading, profileError, today, history, monthRecords, metrics,
    clockIn, clockOut, isClockingIn, isClockingOut, actionError, refetch } = useAttendance();

  const [dateRange, setDateRange] = useState<DateRangePreset>('90d')
  const filteredHistory = useMemo(
    () => filterAttendanceHistory(history, dateRange).slice(0, 30),
    [history, dateRange],
  )
  const attendanceTrendData = useMemo(
    () =>
      [...filteredHistory].reverse().map((r) => ({
        name: r.workDate.slice(5),
        value: r.status === 'PRESENT' || r.status === 'LATE' ? 100 : 0,
      })),
    [filteredHistory],
  )
  const presentDaysData = useMemo(
    () =>
      [...filteredHistory].reverse().map((r) => ({
        name: r.workDate.slice(8),
        value: r.status === 'PRESENT' || r.status === 'LATE' ? 1 : 0,
      })),
    [filteredHistory],
  )
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-teal" />
      </div>
    )
  }
  if (profileError) {
    return (
      <div className="p-10">
        <Card className="surface-panel">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {profileError} — link your employee profile to use attendance tracking.
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div>
      <DashboardHero
        eyebrow="Time & attendance"
        titleHighlight="Attendance &"
        titleRest="Time Tracking"
        description="Live check-in/out and attendance history from attendance-service"
        onRefresh={refetch}
      />
      <div className="space-y-8 p-6 md:p-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Today's Check-In" value={metrics.checkIn} subtitle={today?.status ?? 'No record'} icon={LogIn} accent="teal" />
          <MetricCard title="Work Hours" value={metrics.workHours} subtitle="Today so far" icon={Clock} accent="purple" />
          <MetricCard title="Monthly Attendance" value={`${metrics.monthlyPercent}%`} subtitle={`${monthRecords.length} days tracked`} icon={Clock} accent="teal" />
          <MetricCard title="Status" value={today?.status ?? '—'} subtitle={today?.clockOut ? `Out ${formatTime(today.clockOut)}` : 'Not checked out'} icon={LogOut} accent="purple" />
        </div>

        {actionError ? (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
            {actionError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button
            variant="gradient"
            className="rounded-full"
            disabled={!metrics.canCheckIn || isClockingIn}
            onClick={() => clockIn()}
          >
            {isClockingIn ? <Loader2 className="animate-spin" /> : <LogIn className="h-4 w-4" />}
            Check In
          </Button>
          <Button
            variant="outline"
            className="rounded-full bg-card"
            disabled={!metrics.canCheckOut || isClockingOut}
            onClick={() => clockOut()}
          >
            {isClockingOut ? <Loader2 className="animate-spin" /> : <LogOut className="h-4 w-4" />}
            Check Out
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="surface-panel border-0">
            <CardHeader>
              <SectionHeader title="Recent Attendance" description="Latest working days" />
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attendance records yet.</p>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 10).map((row) => (
                    <div key={row.id} className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium">{row.workDate}</p>
                        <p className="text-xs text-foreground/65">
                          In {formatTime(row.clockIn)} · Out {formatTime(row.clockOut)}
                        </p>
                      </div>
                      <StatusBadge status={row.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="space-y-6">
            <ChartCard
              title="Attendance trend"
              description="% present per working day"
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              isEmpty={attendanceTrendData.length === 0}
            >
              <InteractiveAreaChart
                data={attendanceTrendData}
                valueFormatter={(v) => `${v}%`}
              />
            </ChartCard>
            <ChartCard
              title="Daily presence"
              description="1 = present · 0 = absent"
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              isEmpty={presentDaysData.length === 0}
            >
              <InteractiveBarChart
                data={presentDaysData}
                valueFormatter={(v) => (v === 1 ? 'Present' : 'Absent')}
              />
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  )
}
