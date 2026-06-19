import { Calendar, Clock, FileText, Loader2, Rocket, Star, User, UserPen } from 'lucide-react'
import { useState } from 'react'
import { AiInsightBanner } from '@/components/dashboard/AiInsightBanner'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { useEmployeeDashboard } from '@/hooks/use-employee-dashboard'
import * as employeeApi from '@/lib/api/employee-api'
import { ApiError } from '@/lib/api/http'

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function defaultNameFromEmail(email: string): { firstName: string; lastName: string } {
  const local = email.split('@')[0] ?? 'employee'
  const parts = local.replace(/[._-]+/g, ' ').trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return {
      firstName: parts[0].charAt(0).toUpperCase() + parts[0].slice(1),
      lastName: parts.slice(1).join(' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    }
  }
  return {
    firstName: local.charAt(0).toUpperCase() + local.slice(1),
    lastName: 'User',
  }
}

export function EmployeeDashboardPage() {
  const { user } = useAuth()
  const { profile, profileError, isLoading, todayAttendance, todayError,
    pendingLeaves, approvedLeaves, scorecard, leaves, attendanceHistory, refetch } = useEmployeeDashboard();

  const defaults = defaultNameFromEmail(user?.email ?? '')
  const [firstName, setFirstName] = useState(defaults.firstName)
  const [lastName, setLastName] = useState(defaults.lastName)
  const [provisioning, setProvisioning] = useState(false)
  const [provisionError, setProvisionError] = useState<string | null>(null)

  async function activateWorkspace() {
    setProvisionError(null)
    setProvisioning(true)
    try {
      await employeeApi.provisionMyProfile({ firstName: firstName.trim(), lastName: lastName.trim() })
      await refetch()
    } catch (err) {
      setProvisionError(err instanceof ApiError ? err.message : 'Could not activate workspace')
    } finally {
      setProvisioning(false)
    }
  }
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-teal" />
      </div>
    )
  }
  if (profileError?.status === 404 || !profile) {
    return (
      <div className="p-6 md:p-10">
        <Card className="surface-panel mx-auto max-w-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Rocket className="h-5 w-5 text-brand-teal" />
              Activate your workspace
            </CardTitle>
            <CardDescription>
              NexusHR links your login to an employee record so you can mark attendance, apply leave, and view payslips.
              Signup does this automatically — use the button below if your profile was not created yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  className="rounded-xl"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  className="rounded-xl"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Account: <strong>{user?.email}</strong> · HR can also onboard you from Lifecycle if you were hired
              before self-signup.
            </p>
            {provisionError ? (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{provisionError}</p>
            ) : null}
            <Button
              variant="gradient"
              className="w-full rounded-full sm:w-auto"
              disabled={provisioning || !firstName.trim() || !lastName.trim()}
              onClick={activateWorkspace}
            >
              {provisioning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              Activate my workspace
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  if (profileError) {
    return (
      <div className="p-10">
        <Card className="surface-panel border-destructive/30">
          <CardHeader>
            <CardTitle>Could not load profile</CardTitle>
            <CardDescription>{profileError.message}</CardDescription>
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
