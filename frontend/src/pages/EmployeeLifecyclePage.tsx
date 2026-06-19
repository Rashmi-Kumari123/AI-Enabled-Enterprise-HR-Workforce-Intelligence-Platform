import { CheckCircle2, ClipboardList, Loader2, LogOut, UserMinus, Users } from 'lucide-react'
import { useState } from 'react'
import { AddEmployeeForm } from '@/components/hr/AddEmployeeForm'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { useEmployeeLifecycle } from '@/hooks/use-employee-lifecycle'
import { cn } from '@/lib/utils'

export function EmployeeLifecyclePage() {
  const { hasRole } = useAuth()
  const allowed = hasRole('HR') || hasRole('ADMIN')
  const { pipeline, employees, isLoading, isError, error, completeTask, isCompleting, offboard, isOffboarding, refetch } = useEmployeeLifecycle();
  const [actingTask, setActingTask] = useState<string | null>(null)
  const [offboardingId, setOffboardingId] = useState<number | null>(null)
  if (!allowed) {
    return (
      <div className="p-10">
        <Card className="surface-panel">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Employee lifecycle management is available to HR and Admin roles.
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
  const activeEmployees = employees.filter((e) => e.employmentStatus !== 'TERMINATED')
  async function handleComplete(employeeId: number, taskId: number) {
    const key = `${employeeId}-${taskId}`
    setActingTask(key)
    try {
      await completeTask({ employeeId, taskId })
    } finally {
      setActingTask(null)
    }
  }
  async function handleOffboard(employeeId: number, name: string) {
    if (!window.confirm(`Offboard ${name}? This disables their login immediately.`)) {
      return
    }
    setOffboardingId(employeeId)
    try {
      await offboard({ employeeId, reason: 'Offboarded by HR via lifecycle console' })
    } finally {
      setOffboardingId(null)
    }
  }
  return (
    <div>
      <DashboardHero
        eyebrow="People Operations"
        titleHighlight="Employee"
        titleRest="Lifecycle"
        description="HR-owned hiring · onboarding pipeline · offboard employees"
        onRefresh={refetch}
      />
      <div className="space-y-8 p-6 md:p-10">
        {isError ? (
          <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">{error}</p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="surface-panel border-0">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-brand-teal">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pipeline.length}</p>
                <p className="text-sm text-muted-foreground">In onboarding</p>
              </div>
            </CardContent>
          </Card>
          <Card className="surface-panel border-0">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-brand-purple">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeEmployees.length}</p>
                <p className="text-sm text-muted-foreground">Active workforce</p>
              </div>
            </CardContent>
          </Card>
          <Card className="surface-panel border-0">
            <CardContent className="py-6 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Operating model</p>
              <p className="mt-2">
                New hires enter onboarding (PROBATION → ACTIVE). Admin, HR, and Manager accounts are auto-activated — no checklist for platform operators.
              </p>
            </CardContent>
          </Card>
        </div>

        <AddEmployeeForm onHired={() => refetch()} />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Onboarding pipeline</h2>
          {pipeline.length === 0 ? (
            <Card className="surface-panel border-dashed">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No employees in onboarding. Use <strong>Add employee</strong> above or wait for new signups — they enter PROBATION with a 4-step checklist.
              </CardContent>
            </Card>
          ) : (
            pipeline.map((employee) => {
              const pending = employee.tasks.filter((t) => !t.completed).length
              return (
                <Card key={employee.id} className="surface-panel border-0">
                  <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                    <div>
                      <CardTitle className="text-lg">
                        {employee.firstName} {employee.lastName}
                      </CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {employee.employeeCode} · {employee.email} · {employee.departmentName ?? 'Unassigned'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={employee.employmentStatus} />
                      <span className="text-xs text-muted-foreground">{pending} tasks pending</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {employee.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          'flex flex-col gap-3 rounded-xl border border-border/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
                          task.completed ? 'bg-teal-500/5' : 'bg-muted/30',
                        )}
                      >
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {task.taskCode.replaceAll('_', ' ')}
                          </p>
                          <p className="font-medium">{task.title}</p>
                        </div>
                        {task.completed ? (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-teal">
                            <CheckCircle2 className="h-4 w-4" />
                            Complete
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="gradient"
                            className="rounded-full"
                            disabled={isCompleting || actingTask === `${employee.id}-${task.id}`}
                            onClick={() => handleComplete(employee.id, task.id)}
                          >
                            {actingTask === `${employee.id}-${task.id}` ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : null}
                            Mark complete
                          </Button>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-end pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-red-600 hover:text-red-700"
                        disabled={isOffboarding || offboardingId === employee.id}
                        onClick={() => handleOffboard(employee.id, `${employee.firstName} ${employee.lastName}`)}
                      >
                        {offboardingId === employee.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <UserMinus className="h-3.5 w-3.5" />
                        )}
                        Offboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Active employees</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {activeEmployees.slice(0, 8).map((emp) => (
              <div
                key={emp.id}
                className="surface-panel flex items-center justify-between gap-3 rounded-2xl p-4"
              >
                <div>
                  <p className="font-semibold">
                    {emp.firstName} {emp.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{emp.employeeCode}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={emp.employmentStatus} />
                  {emp.employmentStatus !== 'TERMINATED' ? (
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-full"
                      title="Offboard"
                      disabled={isOffboarding || offboardingId === emp.id}
                      onClick={() => handleOffboard(emp.id, `${emp.firstName} ${emp.lastName}`)}
                    >
                      {offboardingId === emp.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <LogOut className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
