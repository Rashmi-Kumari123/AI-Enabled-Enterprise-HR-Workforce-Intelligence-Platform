import { useState } from 'react'
import {AlertTriangle,Brain,GraduationCap, HeartPulse,Loader2,Sparkles,TrendingUp,} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { useWorkforceIntelligence } from '@/hooks/use-workforce-intelligence'
import type { AiProvider,  EngagementLevel,GapPriority, InsightsTab,  RiskLevel} from '@/types/ai-insights'
import { cn } from '@/lib/utils'

const tabs: { id: InsightsTab; label: string }[] = [
  { id: 'attrition', label: 'Attrition' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'skills', label: 'Skill gaps' },
]
function riskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case 'HIGH':
      return 'badge-danger'
    case 'MEDIUM':
      return 'badge-warning'
    default:
      return 'badge-success'
  }
}
function engagementBadgeClass(level: EngagementLevel): string {
  switch (level) {
    case 'HIGH':
      return 'badge-success'
    case 'MODERATE':
      return 'badge-warning'
    default:
      return 'badge-danger'
  }
}
function gapBadgeClass(priority: GapPriority): string {
  switch (priority) {
    case 'CRITICAL':
      return 'badge-danger'
    case 'HIGH':
      return 'badge-warning'
    case 'MEDIUM':
      return 'badge-info'
    default:
      return 'badge-neutral'
  }
}
function providerLabel(provider: AiProvider, aiEnabled: boolean): string {
  if (!aiEnabled) return 'Rule-based insights (enable OpenAI or Hugging Face for AI narrative)'
  return provider === 'OPENAI' ? 'Powered by OpenAI via Spring AI' : 'Powered by Hugging Face via Spring AI'
}
export function AttritionInsightsPage() {
  const { hasRole } = useAuth()
  const allowed = hasRole('HR') || hasRole('ADMIN') || hasRole('MANAGER')
  const [activeTab, setActiveTab] = useState<InsightsTab>('attrition')
  const { isLoading, isError, error, attrition, engagement, skills, refetch } = useWorkforceIntelligence()
  if (!allowed) {
    return (
      <div className="p-10">
        <Card className="rounded-2xl">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Workforce intelligence is available to HR, Admin, and Manager roles.
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
  const predictions = attrition?.predictions ?? []
  const engagementScores = engagement?.scores ?? []
  const skillAnalyses = skills?.analyses ?? []
  return (
    <div>
      <DashboardHero
        eyebrow="Workforce intelligence"
        titleHighlight="AI-powered"
        titleRest="people insights"
        description="Attrition prediction, engagement scoring, and skill gap analysis using live HR data and Spring AI recommendations"
        onRefresh={() => refetch()}
      />
      <div className="space-y-8 p-6 md:p-10">
        {isError ? (
          <Card className="rounded-2xl border-amber-200 bg-amber-50/80">
            <CardContent className="flex items-start gap-3 pt-6 text-sm">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div>
                <p className="font-medium text-amber-900">Could not load AI insights</p>
                <p className="mt-1 text-muted-foreground">{error}</p>
                <p className="mt-2 text-muted-foreground">
                  Start ai-insights-service (8088) plus employee, leave, attendance, and performance services.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}
        <div className="flex flex-wrap gap-2 rounded-2xl border border-border/60 surface-soft p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-gradient-brand text-white shadow-md shadow-teal-500/20'
                  : 'text-muted-foreground hover:bg-card hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === 'attrition' ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Employees analyzed"
                value={attrition?.employeeCount ?? 0}
                subtitle="Team-wide scan"
                icon={Brain}
                accent="teal"
              />
              <MetricCard
                title="High risk"
                value={attrition?.highRiskCount ?? 0}
                subtitle="Needs immediate attention"
                icon={AlertTriangle}
                accent="purple"
              />
              <MetricCard
                title="Medium risk"
                value={attrition?.mediumRiskCount ?? 0}
                subtitle="Monitor closely"
                icon={TrendingUp}
                accent="teal"
              />
              <MetricCard
                title="AI engine"
                value={predictions[0]?.aiEnabled ? 'Live' : 'Heuristic'}
                subtitle={
                  predictions[0]
                    ? providerLabel(predictions[0].provider, predictions[0].aiEnabled)
                    : 'Set OPENAI_API_KEY or HUGGINGFACE_API_KEY'
                }
                icon={Sparkles}
                accent="purple"
              />
            </div>

            <Card className="surface-panel border-0">
              <CardHeader>
                <SectionHeader title="Attrition predictions" description="Sorted by risk score" />
              </CardHeader>
              <CardContent>
                {predictions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No employees found.</p>
                ) : (
                  <InsightCards>
                    {predictions.map((item) => (
                      <div key={item.employeeId} className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                        <HeaderRow
                          name={item.employeeName}
                          meta={`${item.department ?? 'General'} · Risk ${item.riskScore}/100`}
                          badges={[
                            { label: `${item.riskLevel} RISK`, className: riskBadgeClass(item.riskLevel) },
                            { label: item.provider, className: 'bg-violet-500/10 text-violet-700' },
                          ]}
                        />
                        <p className="mt-4 text-sm leading-relaxed">{item.aiSummary}</p>
                        <ChipList items={item.riskFactors} />
                        <RecommendationList items={item.recommendations} />
                      </div>
                    ))}
                  </InsightCards>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}

        {activeTab === 'engagement' ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Avg engagement"
                value={engagement?.averageEngagementScore?.toFixed(0) ?? '—'}
                subtitle="Team score / 100"
                icon={HeartPulse}
                accent="teal"
              />
              <MetricCard
                title="High engagement"
                value={engagement?.highEngagementCount ?? 0}
                subtitle="Score 70+"
                icon={Sparkles}
                accent="purple"
              />
              <MetricCard
                title="Low engagement"
                value={engagement?.lowEngagementCount ?? 0}
                subtitle="Score below 40"
                icon={AlertTriangle}
                accent="teal"
              />
              <MetricCard
                title="Scoring model"
                value="Multi-signal"
                subtitle="Attendance · performance · leave · tenure"
                icon={Brain}
                accent="purple"
              />
            </div>

            <Card className="surface-panel border-0">
              <CardHeader>
                <SectionHeader
                  title="Engagement scores"
                  description="Composite score from attendance, performance, leave, and tenure signals"
                />
              </CardHeader>
              <CardContent>
                {engagementScores.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No employees found.</p>
                ) : (
                  <InsightCards>
                    {engagementScores.map((item) => (
                      <div key={item.employeeId} className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                        <HeaderRow
                          name={item.employeeName}
                          meta={`${item.department ?? 'General'} · Score ${item.engagementScore}/100`}
                          badges={[
                            {
                              label: `${item.engagementLevel} ENGAGEMENT`,
                              className: engagementBadgeClass(item.engagementLevel),
                            },
                          ]}
                        />
                        <ChipList items={item.scoreFactors} />
                        <RecommendationList items={item.recommendations} />
                      </div>
                    ))}
                  </InsightCards>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}

        {activeTab === 'skills' ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Employees analyzed"
                value={skills?.employeeCount ?? 0}
                subtitle="Performance scorecards"
                icon={GraduationCap}
                accent="teal"
              />
              <MetricCard
                title="With skill gaps"
                value={skills?.employeesWithGaps ?? 0}
                subtitle="Below target threshold"
                icon={AlertTriangle}
                accent="purple"
              />
              <MetricCard
                title="Total gaps"
                value={skills?.totalGapCount ?? 0}
                subtitle="Across all skills"
                icon={TrendingUp}
                accent="teal"
              />
              <MetricCard
                title="Target score"
                value="4.0"
                subtitle="Per performance criterion / 5"
                icon={Brain}
                accent="purple"
              />
            </div>

            <Card className="surface-panel border-0">
              <CardHeader>
                <SectionHeader
                  title="Skill gap analysis"
                  description="Compares performance review criteria against the 4.0 target"
                />
              </CardHeader>
              <CardContent>
                {skillAnalyses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No employees found.</p>
                ) : (
                  <InsightCards>
                    {skillAnalyses.map((item) => (
                      <div key={item.employeeId} className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                        <HeaderRow
                          name={item.employeeName}
                          meta={`${item.department ?? 'General'} · Readiness ${item.overallReadinessPercent}% · ${item.gapCount} gap(s)`}
                          badges={[
                            {
                              label: item.gapCount > 0 ? 'DEVELOPMENT NEEDED' : 'ON TARGET',
                              className:
                                item.gapCount > 0 ? 'badge-warning' : 'badge-success',
                            },
                          ]}
                        />

                        {item.gaps.length > 0 ? (
                          <div className="mt-4 space-y-3">
                            {item.gaps.map((gap) => (
                              <div
                                key={gap.skillCode}
                                className="rounded-xl bg-card/80 px-4 py-3 text-sm shadow-sm"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="font-medium">{gap.skill}</p>
                                  <span
                                    className={cn(
                                      'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                                      gapBadgeClass(gap.priority),
                                    )}
                                  >
                                    {gap.priority}
                                  </span>
                                </div>
                                <p className="mt-1 text-muted-foreground">
                                  Current {gap.currentScore} · Target {gap.targetScore} · Gap {gap.gap}
                                </p>
                                <p className="mt-2 text-muted-foreground">{gap.recommendation}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-4 text-sm text-muted-foreground">
                            All tracked skills meet the target threshold.
                          </p>
                        )}

                        <RecommendationList items={item.developmentPlan} title="Development plan" />
                      </div>
                    ))}
                  </InsightCards>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  )
}
function InsightCards({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>
}
function HeaderRow({
  name,
  meta,
  badges,
}: {
  name: string
  meta: string
  badges: { label: string; className: string }[]
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-lg font-semibold">{name}</p>
        <p className="text-sm text-muted-foreground">{meta}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {badges.map((badge) => (
          <span
            key={badge.label}
            className={cn('rounded-full px-3 py-1 text-xs font-semibold', badge.className)}
          >
            {badge.label}
          </span>
        ))}
      </div>
    </div>
  )
}
function ChipList({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-full bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
          {item}
        </li>
      ))}
    </ul>
  )
}
function RecommendationList({ items, title = 'Recommendations' }: { items: string[]; title?: string }) {
  if (items.length === 0) return null
  return (
    <div className="mt-4 rounded-xl bg-card/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-teal">{title}</p>
      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  )
}
