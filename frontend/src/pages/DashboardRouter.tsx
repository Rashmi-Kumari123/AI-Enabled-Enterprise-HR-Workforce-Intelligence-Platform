import { useAuth } from '@/contexts/auth-context'
import { EmployeeDashboardPage } from '@/pages/EmployeeDashboardPage'
import { ManagerDashboardPage } from '@/pages/ManagerDashboardPage'
export function DashboardRouter() {
  const { hasRole } = useAuth()
  const isManagerView = hasRole('HR') || hasRole('ADMIN') || hasRole('MANAGER')
  if (isManagerView) {
    return <ManagerDashboardPage />
  }
  return <EmployeeDashboardPage />
}
