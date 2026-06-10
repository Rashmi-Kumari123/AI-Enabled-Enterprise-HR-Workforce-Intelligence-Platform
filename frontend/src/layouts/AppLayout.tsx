import { BarChart3, Bot, Brain, Building2, Calendar, Clock, IndianRupee, LayoutDashboard, LogOut, Settings, Sparkles, UserCircle, Users } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BrandLogo } from '@/components/layout/BrandLogo'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

type NavItem = { to: string; end?: boolean; icon: typeof LayoutDashboard; label: string; roles?: string[] }

export function AppLayout() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const isManager = hasRole('HR') || hasRole('ADMIN') || hasRole('MANAGER')
  const isHrAdmin = hasRole('HR') || hasRole('ADMIN')

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const navSections: { title: string; items: NavItem[] }[] = [
    {
      title: 'Overview',
      items: [
        { to: '/dashboard', end: true, icon: LayoutDashboard, label: 'Home' },
        ...(isManager
          ? [{ to: '/dashboard/manager', icon: Users, label: 'Team Overview' }]
          : [{ to: '/dashboard/employee', icon: UserCircle, label: 'My Workspace' }]),
        ...(isHrAdmin ? [{ to: '/dashboard/hr-admin', icon: Building2, label: 'Command Center' }] : []),
      ],
    },
    {
      title: 'People & Time',
      items: [
        { to: '/dashboard/directory', icon: Users, label: 'Directory' },
        { to: '/dashboard/attendance', icon: Clock, label: 'Attendance' },
        { to: '/dashboard/leave', icon: Calendar, label: 'Leave' },
      ],
    },
    {
      title: 'Compensation & Growth',
      items: [
        { to: '/dashboard/payroll', icon: IndianRupee, label: 'Payroll' },
        { to: '/dashboard/performance', icon: Sparkles, label: 'Performance' },
      ],
    },
    {
      title: 'Intelligence',
      items: [
        { to: '/dashboard/intelligence', icon: Brain, label: 'AI Intelligence' },
        ...(isManager ? [{ to: '/dashboard/insights', icon: Brain, label: 'Deep Insights' }] : []),
        { to: '/dashboard/ai-assistant', icon: Bot, label: 'Nexus AI' },
        ...(isManager ? [{ to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' }] : []),
      ],
    },
    {
      title: 'Account',
      items: [
        { to: '/dashboard/notifications', icon: Sparkles, label: 'Notifications' },
        { to: '/dashboard/profile', icon: Settings, label: 'Profile & Settings' },
      ],
    },
  ]

  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
      isActive
        ? 'bg-gradient-brand text-white shadow-md shadow-teal-500/20'
        : 'text-foreground/70 hover:bg-muted hover:text-foreground',
    )

  return (
    <div className="flex min-h-svh bg-mesh">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-card p-4 lg:flex">
        <BrandLogo showTagline />

        <nav className="mt-6 flex flex-1 flex-col gap-5 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                {section.title}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto space-y-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <ThemeToggle compact />
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400">
              <UserCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{user?.email}</p>
              <p className="text-[10px] text-muted-foreground">
                {user?.roles.map((r) => r.replace('ROLE_', '')).join(', ')}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full rounded-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3 lg:hidden">
          <BrandLogo linkTo="/dashboard" />
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
