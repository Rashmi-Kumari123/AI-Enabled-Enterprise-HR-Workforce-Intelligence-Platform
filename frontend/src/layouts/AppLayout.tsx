import { BarChart3, Banknote, Bot, Brain, Building2, Calendar, ClipboardList, Clock, IndianRupee, LayoutDashboard, LogOut, Megaphone, Settings, Shield, Sparkles, Star, UserCircle, Users } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BrandLogo } from '@/components/layout/BrandLogo'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { usePermissions, type AppModule } from '@/hooks/use-permissions'
import { cn } from '@/lib/utils'
import { resolveTenantSlug } from '@/lib/tenant/tenant'

type NavItem = { to: string; end?: boolean; icon: typeof LayoutDashboard; label: string; module?: AppModule }

export function AppLayout() {
  const { user, logout } = useAuth()
  const { canAccess, isHrAdmin, isManagerView, isPayrollOps, isExecutiveOnly } = usePermissions()
  const navigate = useNavigate()
  const tenantSlug = resolveTenantSlug()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const navSections: { title: string; items: NavItem[] }[] = [
    {
      title: 'Overview',
      items: [
        { to: '/dashboard', end: true, icon: LayoutDashboard, label: 'Home', module: 'DASHBOARD' },
        ...(isManagerView && !isExecutiveOnly
          ? [{ to: '/dashboard/manager', icon: Users, label: 'Team Overview', module: 'DASHBOARD' as AppModule }]
          : !isExecutiveOnly
            ? [{ to: '/dashboard/employee', icon: UserCircle, label: 'My Workspace', module: 'DASHBOARD' as AppModule }]
            : []),
        ...(isHrAdmin ? [{ to: '/dashboard/hr-admin', icon: Building2, label: 'Command Center', module: 'DASHBOARD' as AppModule }] : []),
      ],
    },
    {
      title: 'People & Time',
      items: [
        ...(isHrAdmin ? [{ to: '/dashboard/lifecycle', icon: ClipboardList, label: 'Lifecycle', module: 'EMPLOYEES' as AppModule }] : []),
        ...(isHrAdmin ? [{ to: '/dashboard/announcements', icon: Megaphone, label: 'Announcements', module: 'EMPLOYEES' as AppModule }] : []),
        { to: '/dashboard/directory', icon: Users, label: 'Directory', module: 'EMPLOYEES' },
        { to: '/dashboard/attendance', icon: Clock, label: 'Attendance', module: 'ATTENDANCE' },
        { to: '/dashboard/leave', icon: Calendar, label: 'Leave', module: 'LEAVE' },
      ],
    },
    {
      title: 'Compensation & Growth',
      items: [
        { to: '/dashboard/payroll', end: true, icon: IndianRupee, label: 'Payroll', module: 'PAYROLL' },
        ...(isPayrollOps ? [{ to: '/dashboard/payroll/operations', icon: Banknote, label: 'Payroll Ops', module: 'PAYROLL' as AppModule }] : []),
        { to: '/dashboard/performance', end: true, icon: Sparkles, label: 'Performance', module: 'PERFORMANCE' },
        ...(isManagerView ? [{ to: '/dashboard/performance/operations', icon: Star, label: 'Review Ops', module: 'PERFORMANCE' as AppModule }] : []),
      ],
    },
    {
      title: 'Intelligence',
      items: [
        { to: '/dashboard/intelligence', icon: Brain, label: 'AI Intelligence', module: 'ANALYTICS' },
        ...(isManagerView ? [{ to: '/dashboard/insights', icon: Brain, label: 'Deep Insights', module: 'ANALYTICS' as AppModule }] : []),
        { to: '/dashboard/ai-assistant', icon: Bot, label: 'Nexus AI', module: 'AI_CHATBOT' },
        ...(canAccess('ANALYTICS') ? [{ to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics', module: 'ANALYTICS' as AppModule }] : []),
      ],
    },
    {
      title: 'Administration',
      items: [
        ...(canAccess('USER_MANAGEMENT') ? [{ to: '/dashboard/profile', icon: Shield, label: 'Users & Security', module: 'USER_MANAGEMENT' as AppModule }] : []),
      ],
    },
    {
      title: 'Account',
      items: [
        { to: '/dashboard/notifications', icon: Sparkles, label: 'Notifications', module: 'DASHBOARD' },
        { to: '/dashboard/profile', icon: Settings, label: 'Profile & Settings', module: 'DASHBOARD' },
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
        <div className="flex items-center justify-between gap-2">
          <BrandLogo showTagline />
          <NotificationBell />
        </div>
        <p className="mt-2 truncate px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {tenantSlug}
        </p>

        <nav className="mt-6 flex flex-1 flex-col gap-5 overflow-y-auto">
          {navSections.map((section) => {
            const items = section.items.filter((item) => !item.module || canAccess(item.module))
            if (items.length === 0) return null
            return (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                {section.title}
              </p>
              <div className="flex flex-col gap-0.5">
                {items.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          )})}
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
                {user?.roles.map((r: string) => r.replace('ROLE_', '')).join(', ')}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full rounded-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
