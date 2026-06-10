import { Calendar, Clock, FileText, Loader2, Star, User, UserPen } from 'lucide-react'
import { AiInsightBanner } from '@/components/dashboard/AiInsightBanner'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEmployeeDashboard } from '@/hooks/use-employee-dashboard'

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
export function EmployeeDashboardPage() {
  const {
    profile,
    profileError,
    isLoading,
    todayAttendance,
    todayError,
    pendingLeaves,
    approvedLeaves,
    scorecard,
    leaves,
    attendanceHistory,
    refetch,
  } = useEmployeeDashboard()
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-teal" />
      </div>
    )
  }
  if (profileError || !profile) {
    return (
      <div className="p-10">
        <Card className="surface-panel border-destructive/30">
          <CardHeader>
            <CardTitle>Profile not linked</CardTitle>
            <CardDescription>
              Ask HR to create an employee record with the same email you use to sign in.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }
  return (
    <div>
      <DashboardHero
        eyebrow="My workspace"
        titleHighlight="Good Morning,"
        titleRest={`${profile.firstName} 👋`}
        description={`${profile.employeeCode} · ${profile.departmentName ?? 'General'} · Real-time HR metrics from your NexusHR services`}
        onRefresh={refetch}
      />
      <div className="space-y-8 p-6 md:p-10">
        <AiInsightBanner message="Your productivity increased by 12% this month based on attendance and performance signals." />

        <QuickActions
          actions={[
            { label: 'Mark Attendance', icon: Clock, to: '/dashboard/attendance', accent: 'teal' },
            { label: 'Apply Leave', icon: Calendar, to: '/dashboard/leave', accent: 'purple' },
            { label: 'View Payslip', icon: FileText, to: '/dashboard/payroll', accent: 'teal' },
            { label: 'Update Profile', icon: UserPen, to: '/dashboard/profile', accent: 'purple' },
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Today's attendance"
            value={todayError ? 'N/A' : (todayAttendance?.status ?? '—')}
            subtitle={
              todayAttendance
                ? `In ${formatTime(todayAttendance.clockIn)} · Out ${formatTime(todayAttendance.clockOut)}`
                : 'No record today'
            }
            icon={Clock}
            accent="teal"
          />
          <MetricCard
            title="Leave balance"
            value={pendingLeaves}
            subtitle={`${approvedLeaves} approved · days remaining`}
            icon={Calendar}
            accent="purple"
          />
          <MetricCard
            title="Upcoming holidays"
            value={2}
            subtitle="Next: Independence Day"
            icon={Calendar}
            accent="teal"
          />
          <MetricCard
            title="Performance score"
            value={scorecard?.averageOverallRating?.toFixed(2) ?? '—'}
            subtitle={
              scorecard && scorecard.totalReviews > 0
                ? `${scorecard.totalReviews} review(s)`
                : 'No reviews yet'
            }
            icon={Star}
            accent="purple"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="surface-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-brand-teal" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{profile.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hire date</span>
                <span>{profile.hireDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={profile.employmentStatus} />
              </div>
            </CardContent>
          </Card>

          <Card className="surface-panel">
            <CardHeader>
              <SectionHeader title="Recent leave" description="Your latest requests" />
            </CardHeader>
            <CardContent>
              {leaves.length === 0 ? (
                <p className="text-sm text-muted-foreground">No leave requests yet.</p>
              ) : (
                <ul className="space-y-3">
                  {leaves.slice(0, 4).map((leave) => (
                    <li
                      key={leave.id}
                      className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">{leave.leaveType}</p>
                        <p className="text-xs text-muted-foreground">
                          {leave.startDate} → {leave.endDate}
                        </p>
                      </div>
                      <StatusBadge status={leave.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="surface-panel">
          <CardHeader>
            <SectionHeader title="Attendance history" description="Last 5 working days" />
          </CardHeader>
          <CardContent>
            {attendanceHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No records yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">In</th>
                      <th className="pb-3 font-medium">Out</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.map((row) => (
                      <tr key={row.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3">{row.workDate}</td>
                        <td className="py-3">{formatTime(row.clockIn)}</td>
                        <td className="py-3">{formatTime(row.clockOut)}</td>
                        <td className="py-3">
                          <StatusBadge status={row.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
