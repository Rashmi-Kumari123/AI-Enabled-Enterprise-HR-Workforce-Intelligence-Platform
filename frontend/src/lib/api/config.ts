export const apiConfig = {
  auth: import.meta.env.VITE_AUTH_API_URL ?? 'http://localhost:8081',
  employee: import.meta.env.VITE_EMPLOYEE_API_URL ?? 'http://localhost:8082',
  attendance: import.meta.env.VITE_ATTENDANCE_API_URL ?? 'http://localhost:8084',
  leave: import.meta.env.VITE_LEAVE_API_URL ?? 'http://localhost:8085',
  payroll: import.meta.env.VITE_PAYROLL_API_URL ?? 'http://localhost:8083',
  performance: import.meta.env.VITE_PERFORMANCE_API_URL ?? 'http://localhost:8086',
  notifications: import.meta.env.VITE_NOTIFICATION_API_URL ?? 'http://localhost:8087',
  aiInsights: import.meta.env.VITE_AI_INSIGHTS_API_URL ?? 'http://localhost:8088',
} as const
