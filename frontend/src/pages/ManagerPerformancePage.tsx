import { ClipboardList, Loader2, Send } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { useManagerPerformance } from '@/hooks/use-manager-performance'
import { RATING_CRITERIA } from '@/lib/api/performance-api'
import { cn } from '@/lib/utils'
import type { EmployeeProfile, PerformanceFeedback, PerformanceReview } from '@/types/hr'

const DEFAULT_SCORES = Object.fromEntries(RATING_CRITERIA.map((c) => [c, 4])) as Record<string, number>

export function ManagerPerformancePage() {
  const { hasRole } = useAuth()
  const allowed = hasRole('HR') || hasRole('ADMIN') || hasRole('MANAGER')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null)
  const { employees, draftReview, reviews, feedback, selectedEmployee, effectiveEmployeeId, isLoading, error, createReview, isCreating, createError, updateReview, setRatings, submitReview, isSubmitting, inviteFeedback, refetch } = useManagerPerformance(selectedEmployeeId);
  const highlightEmployeeId = selectedEmployeeId ?? effectiveEmployeeId
  if (!allowed) {
    return (
      <div className="p-10">
        <Card className="surface-panel">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Performance review operations are available to Manager, HR, and Admin roles.
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
  return (
    <div>
      <DashboardHero
        eyebrow="People & Growth"
        titleHighlight="Review"
        titleRest="Operations"
        description="Create cycles · manager ratings · invite peers & reports · 360° notifications"
        onRefresh={refetch}
      />
      <div className="space-y-8 p-6 md:p-10">
        {error ? (
          <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">{error}</p>
        ) : null}
        {createError ? (
          <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {createError} — ensure performance-service (8086) is running.
          </p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card className="surface-panel border-0">
            <CardHeader>
              <SectionHeader title="Team" description="Select employee" />
            </CardHeader>
            <CardContent className="max-h-[420px] space-y-1 overflow-y-auto">
              {employees.map((employee) => (
                <button
                  key={employee.id}
                  type="button"
                  onClick={() => setSelectedEmployeeId(employee.id)}
                  className={cn(
                    'flex w-full flex-col rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                    employee.id === highlightEmployeeId
                      ? 'bg-gradient-brand text-white'
                      : 'hover:bg-muted/60',
                  )}
                >
                  <span className="font-medium">
                    {employee.firstName} {employee.lastName}
                  </span>
                  <span className={cn('text-xs', employee.id === highlightEmployeeId ? 'text-white/80' : 'text-muted-foreground')}>
                    {employee.email}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>

          <EmployeeReviewWorkspace
            key={`${effectiveEmployeeId ?? 'none'}-${draftReview?.id ?? 'new'}`}
            selectedEmployee={selectedEmployee}
            employeeId={effectiveEmployeeId}
            draftReview={draftReview}
            reviews={reviews}
            feedback={feedback}
            createReview={createReview}
            isCreating={isCreating}
            updateReview={updateReview}
            setRatings={setRatings}
            submitReview={submitReview}
            isSubmitting={isSubmitting}
            inviteFeedback={inviteFeedback}
          />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Employees view scorecards on{' '}
          <Link to="/dashboard/performance" className="font-medium text-brand-teal hover:underline">
            Performance
          </Link>
          . Notifications fire on feedback requests and review submission.
        </p>
      </div>
    </div>
  )
}
type EmployeeReviewWorkspaceProps = {
  selectedEmployee: EmployeeProfile | null
  employeeId: number | null
  draftReview: PerformanceReview | null
  reviews: PerformanceReview[]
  feedback: PerformanceFeedback[]
  createReview: ReturnType<typeof useManagerPerformance>['createReview']
  isCreating: boolean
  updateReview: ReturnType<typeof useManagerPerformance>['updateReview']
  setRatings: ReturnType<typeof useManagerPerformance>['setRatings']
  submitReview: ReturnType<typeof useManagerPerformance>['submitReview']
  isSubmitting: boolean
  inviteFeedback: ReturnType<typeof useManagerPerformance>['inviteFeedback']
}

function EmployeeReviewWorkspace({ selectedEmployee, employeeId, draftReview, reviews, feedback, createReview, isCreating, updateReview, setRatings, submitReview, isSubmitting, inviteFeedback }: EmployeeReviewWorkspaceProps) {
  const now = new Date()
  const quarter = Math.floor(now.getMonth() / 3) + 1
  const [reviewYear, setReviewYear] = useState(now.getFullYear())
  const [reviewQuarter, setReviewQuarter] = useState(quarter)
  const [goals, setGoals] = useState(draftReview?.goals ?? '')
  const [summaryComment, setSummaryComment] = useState(draftReview?.summaryComment ?? '')
  const [peerEmails, setPeerEmails] = useState('')
  const [reportEmails, setReportEmails] = useState('')
  const [scores, setScores] = useState<Record<string, number>>(DEFAULT_SCORES)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  async function handleCreateReview() {
    if (!employeeId || !selectedEmployee) return
    setActionMessage(null)
    try {
      await createReview({
        employeeId,
        employeeEmail: selectedEmployee.email,
        reviewYear,
        reviewQuarter,
        goals,
      })
      setActionMessage(`Review cycle started for Q${reviewQuarter} ${reviewYear}.`)
    } catch {
      // createError from parent is shown in the banner
    }
  }

  async function handleSaveDraft() {
    if (!draftReview) return
    await updateReview({
      reviewId: draftReview.id,
      goals,
      summaryComment,
    })
  }

  async function handleSaveRatings() {
    if (!draftReview) return
    const ratings = RATING_CRITERIA.map((criterion) => ({
      criterion,
      score: scores[criterion] ?? 4,
    }))
    await setRatings({ reviewId: draftReview.id, ratings })
    await updateReview({ reviewId: draftReview.id, summaryComment })
  }

  async function handleSubmitReview() {
    if (!draftReview) return
    await handleSaveRatings()
    await submitReview(draftReview.id)
  }

  async function handleInvitePeers() {
    if (!draftReview || !peerEmails.trim()) return
    await inviteFeedback({
      reviewId: draftReview.id,
      feedbackType: 'PEER',
      emails: peerEmails.split(',').map((e) => e.trim()).filter(Boolean),
    })
    setPeerEmails('')
  }

  async function handleInviteReports() {
    if (!draftReview || !reportEmails.trim()) return
    await inviteFeedback({
      reviewId: draftReview.id,
      feedbackType: 'DIRECT_REPORT',
      emails: reportEmails.split(',').map((e) => e.trim()).filter(Boolean),
    })
    setReportEmails('')
  }

  return (
    <div className="space-y-6">
      {actionMessage ? (
        <p className="rounded-xl bg-teal-500/10 px-4 py-3 text-sm text-teal-800 dark:text-teal-300">{actionMessage}</p>
      ) : null}

      <Card className="surface-panel border-0">
        <CardHeader>
          <SectionHeader
            title="Review cycle"
            description={selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : 'Select employee'}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label>Year</Label>
              <Input type="number" className="w-28 rounded-xl" value={reviewYear} onChange={(e) => setReviewYear(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Quarter</Label>
              <select
                className="h-11 rounded-xl border border-input bg-input px-3 text-sm"
                value={reviewQuarter}
                onChange={(e) => setReviewQuarter(Number(e.target.value))}
              >
                {[1, 2, 3, 4].map((q) => (
                  <option key={q} value={q}>Q{q}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Goals (one per line)</Label>
            <textarea
              className="min-h-24 w-full rounded-xl border border-input bg-input p-3 text-sm"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Deliver Q2 roadmap&#10;Improve mentoring"
            />
          </div>
          {!draftReview ? (
            <Button
              type="button"
              variant="gradient"
              className="rounded-full"
              disabled={!employeeId || isCreating}
              onClick={() => void handleCreateReview()}
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
              Start review cycle
            </Button>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="rounded-full" onClick={handleSaveDraft}>Save draft</Button>
              <StatusBadge status={draftReview.status} />
            </div>
          )}
        </CardContent>
      </Card>

      {draftReview ? (
        <>
          <Card className="surface-panel border-0">
            <CardHeader>
              <SectionHeader title="Manager ratings" description="1–5 rubric across five criteria" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {RATING_CRITERIA.map((criterion) => (
                  <div key={criterion} className="space-y-1">
                    <Label>{criterion.replaceAll('_', ' ')}</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      className="rounded-xl"
                      value={scores[criterion]}
                      onChange={(e) => setScores((prev) => ({ ...prev, [criterion]: Number(e.target.value) }))}
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Summary comment</Label>
                <Input className="rounded-xl" value={summaryComment} onChange={(e) => setSummaryComment(e.target.value)} />
              </div>
              <Button variant="gradient" className="rounded-full" disabled={isSubmitting} onClick={handleSubmitReview}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Save ratings & submit review
              </Button>
            </CardContent>
          </Card>

          <Card className="surface-panel border-0">
            <CardHeader>
              <SectionHeader title="360° invitations" description="Invite peers and direct reports" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Input
                  className="max-w-md rounded-xl"
                  placeholder="Peer emails, comma-separated"
                  value={peerEmails}
                  onChange={(e) => setPeerEmails(e.target.value)}
                />
                <Button variant="outline" className="rounded-full" onClick={handleInvitePeers}>Invite peers</Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Input
                  className="max-w-md rounded-xl"
                  placeholder="Direct report emails, comma-separated"
                  value={reportEmails}
                  onChange={(e) => setReportEmails(e.target.value)}
                />
                <Button variant="outline" className="rounded-full" onClick={handleInviteReports}>Invite reports</Button>
              </div>
              <div className="space-y-2">
                {feedback.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-2 text-sm">
                    <span>
                      {item.feedbackType.replaceAll('_', ' ')} · {item.respondentEmail}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}

      <Card className="surface-panel border-0">
        <CardHeader>
          <SectionHeader title="Review history" description={`${reviews.length} cycle(s)`} />
        </CardHeader>
        <CardContent className="space-y-2">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet for this employee.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3 text-sm">
                <span>
                  Q{review.reviewQuarter} {review.reviewYear}
                  {review.overallRating != null ? ` · ${Number(review.overallRating).toFixed(1)}/5` : ''}
                </span>
                <StatusBadge status={review.status} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
