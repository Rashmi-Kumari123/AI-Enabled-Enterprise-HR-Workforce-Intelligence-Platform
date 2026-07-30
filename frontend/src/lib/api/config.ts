export const apiConfig = {
  auth: import.meta.env.VITE_AUTH_API_URL ?? 'http://localhost:8080',
  employee: import.meta.env.VITE_EMPLOYEE_API_URL ?? 'http://localhost:8080',
  attendance: import.meta.env.VITE_ATTENDANCE_API_URL ?? 'http://localhost:8080',
  leave: import.meta.env.VITE_LEAVE_API_URL ?? 'http://localhost:8080',
  payroll: import.meta.env.VITE_PAYROLL_API_URL ?? 'http://localhost:8080',
  performance: import.meta.env.VITE_PERFORMANCE_API_URL ?? 'http://localhost:8080',
  notifications: import.meta.env.VITE_NOTIFICATION_API_URL ?? 'http://localhost:8080',
  aiInsights: import.meta.env.VITE_AI_INSIGHTS_API_URL ?? 'http://localhost:8080',
} as const
