import { usePermissions } from '@/hooks/use-permissions'
import { EmployeeDashboardPage } from '@/pages/EmployeeDashboardPage'
import { ExecutiveDashboardPage } from '@/pages/ExecutiveDashboardPage'
import { ManagerDashboardPage } from '@/pages/ManagerDashboardPage'

export function DashboardRouter() {
  const { isExecutiveOnly, isManagerView } = usePermissions()

  if (isExecutiveOnly) {
    return <ExecutiveDashboardPage />
  }
  if (isManagerView) {
    return <ManagerDashboardPage />
  }
  return <EmployeeDashboardPage />
}
