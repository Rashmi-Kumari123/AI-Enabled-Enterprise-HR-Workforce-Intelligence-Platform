import { Award, Star, Target, TrendingUp } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
const goals = [
  { name: 'Deliver Q1 platform milestone', progress: 85 },
  { name: 'Complete leadership training', progress: 60 },
  { name: 'Mentor 2 junior engineers', progress: 100 },
]
const skills = [
  { skill: 'System Design', level: 82 },
  { skill: 'Team Leadership', level: 68 },
  { skill: 'Communication', level: 90 },
]
export function PerformancePage() {
  return (
    <div>
      <DashboardHero
        eyebrow="Growth"
        titleHighlight="Performance"
        titleRest="Insights"
        description="Goals, ratings, feedback, and skill development tracking"
      />
      <div className="space-y-8 p-6 md:p-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Performance Rating" value="4.2 / 5" subtitle="Latest review cycle" icon={Star} accent="teal" />
          <MetricCard title="Goal Progress" value="82%" subtitle="3 active goals" icon={Target} accent="purple" />
          <MetricCard title="Review Cycle" value="Q1 2026" subtitle="Closes Apr 30" icon={TrendingUp} accent="teal" />
          <MetricCard title="Achievements" value="4" subtitle="Badges earned" icon={Award} accent="purple" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="surface-panel border-0">
            <CardHeader>
              <SectionHeader title="Goal Progress" description="Current quarter objectives" />
            </CardHeader>
            <CardContent className="space-y-5">
              {goals.map((goal) => (
                <div key={goal.name}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-muted-foreground">{goal.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-brand transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="surface-panel border-0">
            <CardHeader>
              <SectionHeader title="Manager Feedback" description="Latest review summary" />
            </CardHeader>
            <CardContent>
              <blockquote className="rounded-xl bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
                &ldquo;Consistently delivers high-quality work with strong collaboration. Recommended for
                expanded scope in the next cycle.&rdquo;
              </blockquote>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Top Performer', 'Team Player', 'Innovation', 'Mentorship'].map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-400"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="surface-panel border-0">
          <CardHeader>
            <SectionHeader title="Skill Development Tracker" description="Competency growth areas" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {skills.map((s) => (
              <div key={s.skill} className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-center">
                <p className="text-sm font-medium">{s.skill}</p>
                <p className="mt-2 text-2xl font-bold stat-value-teal">{s.level}%</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
