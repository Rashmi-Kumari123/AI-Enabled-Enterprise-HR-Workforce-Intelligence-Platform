import { Brain, GraduationCap, HeartPulse, Sparkles, TrendingUp } from 'lucide-react'
import { AiInsightBanner } from '@/components/dashboard/AiInsightBanner'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { mockAiCards } from '@/data/mock-ui-data'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
const icons = [Brain, GraduationCap, HeartPulse, TrendingUp, Sparkles]
export function WorkforceIntelligencePage() {
  return (
    <div>
      <DashboardHero
        eyebrow="AI Intelligence"
        titleHighlight="AI Workforce"
        titleRest="Intelligence"
        description="Predictive analytics, skill gaps, engagement scoring, and promotion readiness"
      />
      <div className="space-y-8 p-6 md:p-10">
        <AiInsightBanner message="Sales department attrition risk elevated — review retention strategies for 3 flagged employees." />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {mockAiCards.map((card, i) => {
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
          {['Attrition heatmap', 'Skill gap matrix', 'Engagement radar', 'Productivity forecast'].map(
            (viz) => (
              <div
                key={viz}
                className={cn(
                  'surface-panel flex h-48 items-center justify-center rounded-2xl',
                  'bg-gradient-to-br from-teal-500/5 via-transparent to-violet-500/10',
                )}
              >
                <p className="text-sm font-medium text-muted-foreground">{viz} · AI visualization</p>
              </div>
            ),
          )}
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
