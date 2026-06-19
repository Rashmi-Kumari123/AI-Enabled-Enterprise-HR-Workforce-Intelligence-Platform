import { Brain, GraduationCap, HeartPulse, Loader2, Sparkles, TrendingUp } from 'lucide-react'
import { AiInsightBanner } from '@/components/dashboard/AiInsightBanner'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { useAuth } from '@/hooks/use-auth'
import { useWorkforceIntelligence } from '@/hooks/use-workforce-intelligence'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const icons = [Brain, GraduationCap, HeartPulse, TrendingUp, Sparkles]

export function WorkforceIntelligencePage() {
  const { hasRole } = useAuth()
  const allowed = hasRole('HR') || hasRole('ADMIN') || hasRole('MANAGER')
  const { isLoading, isError, error, attrition, engagement, skills, refetch } = useWorkforceIntelligence()

  if (!allowed) {
    return (
      <div className="p-10">
        <Card className="surface-panel">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            AI Workforce Intelligence is available to HR, Manager, and Admin roles. Log in with an account like{' '}
            <span className="font-medium text-foreground">hr@nexushr.com</span> or{' '}
            <span className="font-medium text-foreground">manager@nexushr.com</span>.
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

  const topRisk = attrition?.predictions?.[0]
  const aiCards = [
    {
      title: 'Attrition Prediction',
      value: attrition ? `${attrition.highRiskCount} high` : '—',
      subtitle: topRisk ? `${topRisk.employeeName} · ${topRisk.riskLevel}` : 'Team scan',
      accent: 'purple' as const,
    },
    {
      title: 'Skill Gap Analysis',
      value: skills ? `${skills.totalGapCount} gaps` : '—',
      subtitle: `${skills?.employeesWithGaps ?? 0} employees affected`,
      accent: 'teal' as const,
    },
    {
      title: 'Engagement Score',
      value: engagement ? `${engagement.averageEngagementScore.toFixed(0)}/100` : '—',
      subtitle: `${engagement?.highEngagementCount ?? 0} high engagement`,
      accent: 'teal' as const,
    },
    {
      title: 'Employees Analyzed',
      value: attrition?.employeeCount ?? 0,
      subtitle: 'Attrition model coverage',
      accent: 'purple' as const,
    },
    {
      title: 'Development Focus',
      value: skills?.employeesWithGaps ?? 0,
      subtitle: 'Need skill development',
      accent: 'teal' as const,
    },
  ]

  return (
    <div>
      <DashboardHero
        eyebrow="AI Intelligence"
        titleHighlight="AI Workforce"
        titleRest="Intelligence"
        description="Live predictive analytics from ai-insights-service"
        onRefresh={refetch}
      />
      <div className="space-y-8 p-6 md:p-10">
        {isError ? (
          <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            {error}
          </p>
        ) : null}

        <AiInsightBanner
          message={
            topRisk
              ? `${topRisk.employeeName} (${topRisk.department ?? 'General'}) shows ${topRisk.riskLevel} attrition risk — score ${topRisk.riskScore}/100.`
              : 'Team workforce intelligence is up to date.'
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {aiCards.map((card, i) => {
            const Icon = icons[i] ?? Sparkles
            return (
              <MetricCard
                key={card.title}
                title={card.title}
                value={card.value}
                subtitle={card.subtitle}
                icon={Icon}
                accent={card.accent}
              />
            )
          })}
        </div>

        <Card className="ai-glow border border-brand-purple/20">
          <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold">Ask Nexus AI Anything</p>
              <p className="text-sm text-muted-foreground">
                Chat interface for workforce questions, HR recommendations, and predictive analytics
              </p>
            </div>
            <Button variant="gradient" className="rounded-full" asChild>
              <Link to="/dashboard/ai-assistant">
                <Sparkles className="h-4 w-4" />
                Open AI Assistant
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {['Attrition predictions', 'Engagement scores', 'Skill gap matrix', 'Team readiness'].map((viz) => (
            <div
              key={viz}
              className={cn(
                'surface-panel flex h-48 items-center justify-center rounded-2xl',
                'bg-gradient-to-br from-teal-500/5 via-transparent to-violet-500/10',
              )}
            >
              <p className="text-sm font-medium text-muted-foreground">{viz} · live AI data</p>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          For detailed AI analysis, see{' '}
          <Link to="/dashboard/insights" className="font-semibold text-brand-teal hover:underline">
            full insights dashboard
          </Link>
        </p>
      </div>
    </div>
  )
}
