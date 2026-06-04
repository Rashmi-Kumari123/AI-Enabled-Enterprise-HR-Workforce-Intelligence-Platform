import { Building2, CalendarClock, Loader2, UserCheck, Users } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useManagerDashboard } from '@/hooks/use-manager-dashboard'

export function ManagerDashboardPage() {
  const { hasRole } = useAuth()
  const {
    isLoading,
    employees,
    pendingLeaves,
    metrics,
    employeesFailed,
    leavesFailed,
    employeesError,
    leavesError,
    refetch,
  } = useManagerDashboard()

  const roleLabel = hasRole('HR') ? 'HR' : hasRole('ADMIN') ? 'Admin' : 'Manager'

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
        eyebrow={`Team overview · ${roleLabel}`}
        titleHighlight="Manage"
        titleRest="your workforce"
        description="Track headcount, pending leave approvals, and team roster — powered by live NexusHR APIs"
        onRefresh={refetch}
      />
      <div className="space-y-8 p-6 md:p-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total employees"
            value={metrics.totalEmployees}
            subtitle="Across departments"
            icon={Users}
            accent="teal"
          />
          <MetricCard
            title="Active"
            value={metrics.activeEmployees}
            subtitle="ACTIVE status"
            icon={UserCheck}
            accent="purple"
          />
          <MetricCard
            title="Pending leave"
            value={metrics.pendingLeaveRequests}
            subtitle="Needs approval"
            icon={CalendarClock}
            accent="teal"
          />
          <MetricCard
            title="Departments"
            value={metrics.departments}
            subtitle="With staff assigned"
            icon={Building2}
            accent="purple"
          />
        </div>
        {(employeesFailed || leavesFailed) && (
          <Card className="rounded-2xl border-amber-200 bg-amber-50/80 shadow-sm">
            <CardContent className="pt-6 text-sm">
              {employeesFailed ? <p>Employees: {employeesError}</p> : null}
              {leavesFailed ? <p>Leaves: {leavesError}</p> : null}
              <p className="mt-2 text-muted-foreground">Start employee-service (8082) and leave-service (8085).</p>
            </CardContent>
          </Card>
        )}
        {!employeesFailed && employees.length === 0 && (
          <Card className="rounded-2xl border-dashed border-border bg-white/80">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No employees in database. Restart employee-service for Flyway seed or add via Postman.
            </CardContent>
          </Card>
        )}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-0 bg-white shadow-lg shadow-black/[0.04]">
            <CardHeader>
              <SectionHeader
                title="Pending approvals"
                description="Leave requests awaiting action"
              />
            </CardHeader>
            <CardContent>
              {pendingLeaves.length === 0 ? (
                <p className="text-sm text-muted-foreground">All caught up — no pending requests.</p>
              ) : (
                <ul className="space-y-3">
                  {pendingLeaves.slice(0, 6).map((leave) => (
                    <li key={leave.id} className="rounded-xl border border-border/60 bg-muted/30 p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Employee #{leave.employeeId}</p>
                        <StatusBadge status={leave.status} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {leave.leaveType} · {leave.startDate} → {leave.endDate}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-0 bg-white shadow-lg shadow-black/[0.04]">
            <CardHeader>
              <CardTitle className="text-lg">Team roster</CardTitle>
              <CardDescription>{employees.length} people</CardDescription>
            </CardHeader>
            <CardContent>
              {employees.length === 0 ? (
                <p className="text-sm text-muted-foreground">No employees found.</p>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 font-medium">Name</th>
                        <th className="pb-3 font-medium">Dept</th>
                        <th className="pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr key={emp.id} className="border-b border-border/40 last:border-0">
                          <td className="py-3">
                            <p className="font-medium">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">{emp.employeeCode}</p>
                          </td>
                          <td className="py-3 text-muted-foreground">{emp.departmentName ?? '—'}</td>
                          <td className="py-3">
                            <StatusBadge status={emp.employmentStatus} />
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
    </div>
  )
}
