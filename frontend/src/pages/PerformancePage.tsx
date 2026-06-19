import { Award, CheckCircle2, Loader2, Star, Target, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChartCard } from '@/components/charts/ChartCard'
import { InteractiveBarChart } from '@/components/charts/InteractiveBarChart'
import { InteractiveLineChart } from '@/components/charts/InteractiveLineChart'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { usePerformance } from '@/hooks/use-performance'
import { RATING_CRITERIA } from '@/lib/api/performance-api'

const DEFAULT_SCORES = Object.fromEntries(RATING_CRITERIA.map((c) => [c, 4])) as Record<string, number>

export function PerformancePage() {
  const { hasRole } = useAuth()
  const isManager = hasRole('HR') || hasRole('ADMIN') || hasRole('MANAGER')
  const { isLoading, goals, skills, feedbackByType, trendValues, trendLabels, latestReview, pendingFeedback, canAcknowledge, metrics, error, acknowledgeReview, isAcknowledging,
    submitFeedback, isSubmittingFeedback, refetch } = usePerformance();
  const [activeFeedbackId, setActiveFeedbackId] = useState<number | null>(null)
  const [scores, setScores] = useState<Record<string, number>>(DEFAULT_SCORES)
  const [selfComment, setSelfComment] = useState('')

  const ratingTrendData = useMemo(
    () =>
      trendLabels.map((name, i) => ({
        name,
        value: trendValues[i] ?? 0,
      })),
    [trendLabels, trendValues],
  )

  const feedbackChartData = useMemo(
    () =>
      feedbackByType.map((entry) => ({
        name: entry.type.replaceAll('_', ' '),
        value: entry.score,
      })),
    [feedbackByType],
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-teal" />
      </div>
    )
  }
  async function handleSubmitFeedback() {
    if (!activeFeedbackId) return
    await submitFeedback({
      feedbackId: activeFeedbackId,
      ratings: RATING_CRITERIA.map((criterion) => ({
        criterion,
        score: scores[criterion] ?? 4,
      })),
      summaryComment: selfComment || undefined,
    })
    setActiveFeedbackId(null)
    setSelfComment('')
    setScores(DEFAULT_SCORES)
  }

  return (
    <div>
      <DashboardHero
        eyebrow="Growth"
        titleHighlight="Performance"
        titleRest="Insights"
        description="360° scorecards · quarter trends · live feedback from performance-service"
        onRefresh={refetch}
      />
      <div className="space-y-8 p-6 md:p-10">
        {error ? (
          <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            {error} — start performance-service (8086) if needed.
          </p>
        ) : null}

        {isManager ? (
          <Card className="surface-panel border-brand-teal/30 bg-teal-500/5">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium">Manager performance console</p>
                <p className="text-sm text-muted-foreground">
                  Create reviews, invite peers, and submit manager ratings.
                </p>
              </div>
              <Button variant="gradient" className="rounded-full" asChild>
                <Link to="/dashboard/performance/operations">Open Review Ops</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Performance Rating" value={`${metrics.rating} / 5`} subtitle={`${metrics.reviewCount} review(s)`} icon={Star} accent="teal" />
          <MetricCard title="Goals" value={goals.length ? `${goals.length} set` : '—'} subtitle="Current review cycle" icon={Target} accent="purple" />
          <MetricCard title="Review Cycle" value={metrics.reviewCycle} subtitle={metrics.status} icon={TrendingUp} accent="teal" />
          <MetricCard title="360 sources" value={feedbackByType.length || '—'} subtitle="Feedback types submitted" icon={Award} accent="purple" />
        </div>

        {pendingFeedback.length > 0 ? (
          <Card className="surface-panel border-amber-500/30">
            <CardHeader>
              <SectionHeader
                title="Pending feedback"
                description="Complete your 360° feedback — refreshes every 30s"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingFeedback.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/30 p-4">
                  <div>
                    <p className="font-medium">{item.feedbackType.replaceAll('_', ' ')} feedback</p>
                    <p className="text-sm text-muted-foreground">
                      Review Q{item.reviewId} · employee #{item.employeeId}
                    </p>
                  </div>
                  <Button
                    variant="gradient"
                    className="rounded-full"
                    onClick={() => {
                      setActiveFeedbackId(item.id)
                      setScores(DEFAULT_SCORES)
                    }}
                  >
                    Complete feedback
                  </Button>
                </div>
              ))}

              {activeFeedbackId ? (
                <div className="space-y-4 rounded-xl border border-border p-4">
                  <p className="text-sm font-medium">Rate each criterion (1–5)</p>
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
                          onChange={(e) =>
                            setScores((prev) => ({
                              ...prev,
                              [criterion]: Number(e.target.value),
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="selfComment">Comments (optional)</Label>
                    <Input
                      id="selfComment"
                      className="rounded-xl"
                      value={selfComment}
                      onChange={(e) => setSelfComment(e.target.value)}
                      placeholder="Summary comment"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="gradient"
                      className="rounded-full"
                      disabled={isSubmittingFeedback}
                      onClick={handleSubmitFeedback}
                    >
                      {isSubmittingFeedback ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Submit feedback
                    </Button>
                    <Button variant="outline" className="rounded-full" onClick={() => setActiveFeedbackId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {canAcknowledge && latestReview ? (
          <Card className="surface-panel border-teal-500/30">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
              <div>
                <p className="font-medium">Review ready for acknowledgement</p>
                <p className="text-sm text-muted-foreground">
                  Q{latestReview.reviewQuarter} {latestReview.reviewYear} · self-assessment complete
                </p>
              </div>
              <Button
                variant="gradient"
                className="rounded-full"
                disabled={isAcknowledging}
                onClick={() => acknowledgeReview(latestReview.id)}
              >
                {isAcknowledging ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Acknowledge review
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="Quarter-over-quarter rating trend"
            description="Average overall rating by review period"
            isEmpty={ratingTrendData.length === 0 || ratingTrendData.every((d) => d.value === 0)}
          >
            <InteractiveLineChart
              data={ratingTrendData}
              yDomain={[0, 5]}
              valueFormatter={(v) => `${v.toFixed(1)} / 5`}
            />
          </ChartCard>
          <ChartCard
            title="360° feedback breakdown"
            description="Average score by feedback source"
            isEmpty={feedbackChartData.length === 0}
          >
            <InteractiveBarChart
              data={feedbackChartData}
              valueFormatter={(v) => `${v.toFixed(1)} / 5`}
            />
          </ChartCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="surface-panel border-0">
            <CardHeader>
              <SectionHeader title="Goals" description="From latest review" />
            </CardHeader>
            <CardContent className="space-y-3">
              {goals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No goals recorded in the latest review.</p>
              ) : (
                goals.map((goal) => (
                  <div key={goal.name} className="rounded-xl bg-muted/30 px-4 py-3 text-sm">
                    {goal.name}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="surface-panel border-0">
            <CardHeader>
              <SectionHeader title="Manager feedback" description="Latest review summary" />
            </CardHeader>
            <CardContent>
              {latestReview?.summaryComment ? (
                <blockquote className="rounded-xl bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{latestReview.summaryComment}&rdquo;
                </blockquote>
              ) : (
                <p className="text-sm text-muted-foreground">No manager summary yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="surface-panel border-0">
          <CardHeader>
            <SectionHeader title="Skill scorecard" description="Average scores by criterion" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {skills.length === 0 ? (
              <p className="text-sm text-muted-foreground sm:col-span-3">No criterion ratings yet.</p>
            ) : (
              skills.map((s) => (
                <div key={s.skill} className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-center">
                  <p className="text-sm font-medium">{s.skill}</p>
                  <p className="mt-2 text-2xl font-bold stat-value-teal">{s.score.toFixed(1)} / 5</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
