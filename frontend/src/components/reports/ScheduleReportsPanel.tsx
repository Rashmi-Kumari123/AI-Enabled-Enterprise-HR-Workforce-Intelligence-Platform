import { Calendar, Loader2, Mail, Trash2, Zap } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { useReportSchedules } from '@/hooks/use-report-schedules'
import type { ReportFormat, ReportFrequency } from '@/types/report-schedule'

type ScheduleReportsPanelProps = {
  onClose?: () => void
}

const frequencies: { id: ReportFrequency; label: string }[] = [
  { id: 'WEEKLY', label: 'Weekly' },
  { id: 'MONTHLY', label: 'Monthly' },
]
const formats: { id: ReportFormat; label: string }[] = [
  { id: 'PDF', label: 'PDF' },
  { id: 'EXCEL', label: 'Excel' },
  { id: 'CSV', label: 'CSV' },
]
function formatWhen(iso: string | null): string {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleString()
}
export function ScheduleReportsPanel({ onClose }: ScheduleReportsPanelProps) {
  const { user } = useAuth()
  const { schedules, isLoading, createSchedule, isCreating, deleteSchedule, isDeleting, runScheduleNow, isRunning } = useReportSchedules();
  const [frequency, setFrequency] = useState<ReportFrequency>('WEEKLY')
  const [reportFormat, setReportFormat] = useState<ReportFormat>('PDF')
  const [recipientEmail, setRecipientEmail] = useState(user?.email ?? '')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  async function handleCreate() {
    setError(null)
    setMessage(null)
    try {
      await createSchedule({
        recipientEmail: recipientEmail.trim() || undefined,
        frequency,
        reportFormat,
      })
      setMessage('Report schedule saved. Email delivery runs on the cron schedule or use Run now.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save schedule')
    }
  }
  async function handleRunNow(id: number) {
    setError(null)
    try {
      await runScheduleNow(id)
      setMessage('Report sent via notification-service (email + in-app).')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run report')
    }
  }
  async function handleDelete(id: number) {
    setError(null)
    try {
      await deleteSchedule(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete schedule')
    }
  }
  return (
    <Card className="surface-panel border-brand-teal/20">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-brand-teal" />
            Schedule workforce reports
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Automated email summaries via notification-service · daily check at 08:00 UTC
          </p>
        </div>
        {onClose ? (
          <Button variant="outline" size="sm" className="rounded-full" onClick={onClose}>
            Close
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        {message ? (
          <p className="rounded-xl bg-teal-500/10 px-4 py-3 text-sm text-teal-800 dark:text-teal-300">{message}</p>
        ) : null}
        {error ? (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="reportEmail">Recipient email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="reportEmail"
                className="rounded-xl pl-9"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="hr@nexushr.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Frequency</Label>
            <div className="flex flex-wrap gap-2">
              {frequencies.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFrequency(item.id)}
                  className={
                    frequency === item.id
                      ? 'rounded-full bg-brand-teal px-3 py-1.5 text-xs font-medium text-white'
                      : 'rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground'
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Report format label in email</Label>
            <div className="flex flex-wrap gap-2">
              {formats.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setReportFormat(item.id)}
                  className={
                    reportFormat === item.id
                      ? 'rounded-full bg-brand-purple px-3 py-1.5 text-xs font-medium text-white'
                      : 'rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground'
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          variant="gradient"
          className="rounded-full"
          disabled={isCreating}
          onClick={handleCreate}
        >
          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
          Save schedule
        </Button>

        <div className="space-y-3">
          <p className="text-sm font-semibold">Active schedules</p>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-brand-teal" />
            </div>
          ) : schedules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No schedules yet.</p>
          ) : (
            <ul className="space-y-3">
              {schedules.map((schedule) => (
                <li
                  key={schedule.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {schedule.frequency} · {schedule.reportFormat} → {schedule.recipientEmail}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Next: {formatWhen(schedule.nextRunAt)} · Last: {formatWhen(schedule.lastRunAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-full"
                      disabled={isRunning}
                      onClick={() => handleRunNow(schedule.id)}
                    >
                      <Zap className="h-3.5 w-3.5" />
                      Run now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-full text-destructive"
                      disabled={isDeleting}
                      onClick={() => handleDelete(schedule.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
