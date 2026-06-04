import { Building2, LayoutDashboard, LogOut, UserCircle, Users } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BrandLogo } from '@/components/layout/BrandLogo'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
export function AppLayout() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const isManager = hasRole('HR') || hasRole('ADMIN') || hasRole('MANAGER')

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const navItems = [
    { to: '/dashboard', end: true, icon: LayoutDashboard, label: 'Overview' },
    ...(isManager
      ? [{ to: '/dashboard/manager', end: false, icon: Users, label: 'Team' }]
      : [{ to: '/dashboard/employee', end: false, icon: UserCircle, label: 'My workspace' }]),
  ]

  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
      isActive
        ? 'bg-gradient-brand text-white shadow-md shadow-teal-500/20'
        : 'text-muted-foreground hover:bg-white hover:text-foreground',
    )

  return (
    <div className="flex min-h-svh bg-mesh">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/60 bg-white/70 p-5 backdrop-blur-md lg:flex">
        <BrandLogo showTagline />

        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3 rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">
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
        <header className="flex items-center justify-between border-b border-white/60 bg-white/60 px-4 py-3 backdrop-blur-md lg:hidden">
          <BrandLogo />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
