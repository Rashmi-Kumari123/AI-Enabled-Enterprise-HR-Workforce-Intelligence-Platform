import heroImage from '@/assets/hero.png'
import { BrandLogo } from '@/components/layout/BrandLogo'
import { Outlet } from 'react-router-dom'
const stats = [
  { value: '6+', label: 'Microservices', tone: 'teal' as const },
  { value: '5K+', label: 'Employees supported', tone: 'purple' as const },
  { value: '99.9%', label: 'Uptime target', tone: 'teal' as const },
]
export function AuthLayout() {
  return (
    <div className="min-h-svh lg:grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-mesh lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative z-10">
          <BrandLogo linkTo="/login" showTagline />
        </div>
        <div className="relative z-10 space-y-8">
          <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            <span className="text-gradient-brand">Manage.</span>{' '}
            <span className="text-gradient-brand">Analyze.</span>{' '}
            <span className="text-foreground">Grow.</span>
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            AI-enabled enterprise HR platform for attendance, payroll, performance reviews, and
            workforce intelligence.
          </p>
          <div className="flex flex-wrap gap-10 pt-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p
                  className={
                    stat.tone === 'purple' ? 'text-3xl font-bold stat-value-purple' : 'text-3xl font-bold stat-value-teal'
                  }
                >
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-muted-foreground">Zidio Development · NexusHR v2</p>
      </div>

      <div className="flex flex-col items-center justify-center bg-mesh px-4 py-12">
        <div className="mb-8 lg:hidden">
          <BrandLogo linkTo="/login" showTagline />
        </div>
        <div className="glass-panel w-full max-w-md rounded-2xl p-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
