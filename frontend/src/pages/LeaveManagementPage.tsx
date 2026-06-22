import { Calendar, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLeaveManagement } from '@/hooks/use-leave-management'

export function LeaveManagementPage() {
  const [showForm, setShowForm] = useState(false)
  const [leaveType, setLeaveType] = useState('ANNUAL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  const { isLoading, leaves, pending, balances, leaveTypes, submitLeave,
    isSubmitting, submitError, refetch } = useLeaveManagement();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    await submitLeave({ leaveType, startDate, endDate, reason })
    setShowForm(false)
    setReason('')
    setStartDate('')
    setEndDate('')
  }
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-teal" />
      </div>
    )
  }
  const latestPending = pending[0]
  return (
    <div>
      <DashboardHero
        eyebrow="Time off"
        titleHighlight="Leave"
        titleRest="Management"
        description="Live leave balances from leave-service · validated on submit & deducted on approval"
        onRefresh={refetch}
      />
      <div className="space-y-8 p-6 md:p-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {balances.length === 0 ? (
            <Card className="surface-panel border-dashed sm:col-span-2">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No leave balances yet. Balances are created when your employee profile is onboarded.
              </CardContent>
            </Card>
          ) : (
            balances.map((lb, i) => (
              <MetricCard
                key={lb.code}
                title={lb.type}
                value={`${lb.remaining} left`}
                subtitle={`${lb.used} used of ${lb.entitled} entitled · ${pending.filter((p) => p.leaveType === lb.code).length} pending`}
                icon={Calendar}
                accent={i % 2 === 0 ? 'teal' : 'purple'}
              />
            ))
          )}
        </div>

        <Button variant="gradient" className="rounded-full" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'Apply Leave'}
        </Button>

        {showForm ? (
          <Card className="surface-panel max-w-xl border-0">
            <CardContent className="space-y-4 pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="leaveType">Leave type</Label>
                  <select
                    id="leaveType"
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground dark:bg-input"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                  >
                    {leaveTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start date</Label>
                    <Input id="startDate" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End date</Label>
                    <Input id="endDate" type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Input id="reason" required value={reason} onChange={(e) => setReason(e.target.value)} className="h-11 rounded-xl" placeholder="Brief reason for leave" />
                </div>
                {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
                <Button type="submit" variant="gradient" className="rounded-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : null}
                  Submit request
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="surface-panel border-0">
            <CardHeader>
              <SectionHeader title="Leave History" description="Your recent requests" />
            </CardHeader>
            <CardContent className="space-y-3">
              {leaves.length === 0 ? (
                <p className="text-sm text-muted-foreground">No leave requests yet.</p>
              ) : (
                leaves.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
                    <div>
                      <p className="font-medium">{item.leaveType}</p>
                      <p className="text-xs text-foreground/65">
                        {item.startDate} → {item.endDate}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="surface-panel border-0">
            <CardHeader>
              <SectionHeader title="Approval Timeline" description="Latest request workflow" />
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {['Submitted', 'Manager Review', 'HR Approval', 'Confirmed'].map((step, i) => {
                  const active =
                    latestPending ? i <= 1 : leaves.some((l) => l.status === 'APPROVED') ? i <= 3 : i === 0
                  return (
                    <li key={step} className="flex items-center gap-3 text-sm">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          active ? 'bg-gradient-brand text-white' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {active ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <span className={active ? 'font-medium' : 'text-muted-foreground'}>{step}</span>
                    </li>
                  )
                })}
              </ol>
            </CardContent>
          </Card>
        </div>

        {latestPending ? (
          <Card className="ai-glow border border-brand-teal/20">
            <CardContent className="flex items-center justify-between py-5">
              <div>
                <p className="text-sm font-semibold">Pending approval</p>
                <p className="text-xs text-muted-foreground">
                  {latestPending.leaveType} · {latestPending.startDate} → {latestPending.endDate}
                </p>
              </div>
              <StatusBadge status={latestPending.status} />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
