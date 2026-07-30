import { useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth'

export type AppModule =
  | 'DASHBOARD'
  | 'EMPLOYEES'
  | 'DEPARTMENTS'
  | 'ATTENDANCE'
  | 'LEAVE'
  | 'PAYROLL'
  | 'PERFORMANCE'
  | 'ANALYTICS'
  | 'AI_CHATBOT'
  | 'USER_MANAGEMENT'
  | 'AUDIT_LOGS'

const ROLE_MODULES: Record<string, AppModule[]> = {
  ROLE_PLATFORM_ADMIN: [
    'DASHBOARD', 'EMPLOYEES', 'DEPARTMENTS', 'ATTENDANCE', 'LEAVE', 'PAYROLL',
    'PERFORMANCE', 'ANALYTICS', 'AI_CHATBOT', 'USER_MANAGEMENT', 'AUDIT_LOGS',
  ],
  ROLE_SUPER_ADMIN: [
    'DASHBOARD', 'EMPLOYEES', 'DEPARTMENTS', 'ATTENDANCE', 'LEAVE', 'PAYROLL',
    'PERFORMANCE', 'ANALYTICS', 'AI_CHATBOT', 'USER_MANAGEMENT', 'AUDIT_LOGS',
  ],
  ROLE_ADMIN: [
    'DASHBOARD', 'EMPLOYEES', 'DEPARTMENTS', 'ATTENDANCE', 'LEAVE', 'PAYROLL',
    'PERFORMANCE', 'ANALYTICS', 'AI_CHATBOT', 'USER_MANAGEMENT', 'AUDIT_LOGS',
  ],
  ROLE_HR: [
    'DASHBOARD', 'EMPLOYEES', 'DEPARTMENTS', 'ATTENDANCE', 'LEAVE', 'PAYROLL',
    'PERFORMANCE', 'ANALYTICS', 'AI_CHATBOT', 'USER_MANAGEMENT', 'AUDIT_LOGS',
  ],
  ROLE_MANAGER: [
    'DASHBOARD', 'EMPLOYEES', 'ATTENDANCE', 'LEAVE', 'PAYROLL', 'PERFORMANCE', 'ANALYTICS', 'AI_CHATBOT',
  ],
  ROLE_PAYROLL: [
    'DASHBOARD', 'EMPLOYEES', 'ATTENDANCE', 'LEAVE', 'PAYROLL', 'PERFORMANCE', 'ANALYTICS', 'AI_CHATBOT',
  ],
  ROLE_EMPLOYEE: [
    'DASHBOARD', 'EMPLOYEES', 'ATTENDANCE', 'LEAVE', 'PAYROLL', 'PERFORMANCE', 'AI_CHATBOT',
  ],
  ROLE_IT_ADMIN: ['DASHBOARD', 'EMPLOYEES', 'USER_MANAGEMENT', 'AUDIT_LOGS', 'AI_CHATBOT'],
  ROLE_EXECUTIVE: ['DASHBOARD', 'ANALYTICS', 'AI_CHATBOT', 'EMPLOYEES'],
}

export function usePermissions() {
  const { user } = useAuth()

  const modules = useMemo(() => {
    const allowed = new Set<AppModule>()
    for (const role of user?.roles ?? []) {
      for (const module of ROLE_MODULES[role] ?? []) {
        allowed.add(module)
      }
    }
    return allowed
  }, [user?.roles])

  const canAccess = (module: AppModule) => modules.has(module)

  const isExecutiveOnly =
    (user?.roles.includes('ROLE_EXECUTIVE') ?? false) &&
    !(user?.roles.some((r) => !['ROLE_EXECUTIVE', 'ROLE_EMPLOYEE'].includes(r)) ?? false)

  const isPayrollOps = user?.roles.some((r) =>
    ['ROLE_PAYROLL', 'ROLE_HR', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN'].includes(r),
  ) ?? false

  const isHrAdmin = user?.roles.some((r) =>
    ['ROLE_HR', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN'].includes(r),
  ) ?? false

  const isManagerView = user?.roles.some((r) =>
    ['ROLE_MANAGER', 'ROLE_HR', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_PAYROLL'].includes(r),
  ) ?? false

  return { canAccess, isExecutiveOnly, isPayrollOps, isHrAdmin, isManagerView, modules }
}
