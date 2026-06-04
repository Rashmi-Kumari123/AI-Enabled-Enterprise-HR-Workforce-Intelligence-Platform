import { Calendar, Clock, IndianRupee, Loader2, Star, User } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEmployeeDashboard } from '@/hooks/use-employee-dashboard'

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function monthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString('en', { month: 'short' })
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
    latestPayslip,
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
        <Card className="rounded-2xl border-destructive/20 bg-white shadow-lg">
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
        titleHighlight="Hello,"
        titleRest={`${profile.firstName}`}
        description={`${profile.employeeCode} · ${profile.departmentName ?? 'General'} · Real-time HR metrics from your NexusHR services`}
        onRefresh={refetch}
      />
      <div className="space-y-8 p-6 md:p-10">
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
            title="Pending leave"
            value={pendingLeaves}
            subtitle={`${approvedLeaves} approved`}
            icon={Calendar}
            accent="purple"
          />
          <MetricCard
            title="Latest net pay"
            value={latestPayslip ? `₹${latestPayslip.netPay.toLocaleString('en-IN')}` : '—'}
            subtitle={
              latestPayslip ? `${monthName(latestPayslip.payMonth)} ${latestPayslip.payYear}` : 'No payslip yet'
            }
            icon={IndianRupee}
            accent="teal"
          />
          <MetricCard
            title="Performance"
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
          <Card className="rounded-2xl border-0 bg-white shadow-lg shadow-black/[0.04]">
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

          <Card className="rounded-2xl border-0 bg-white shadow-lg shadow-black/[0.04]">
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

        <Card className="rounded-2xl border-0 bg-white shadow-lg shadow-black/[0.04]">
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
