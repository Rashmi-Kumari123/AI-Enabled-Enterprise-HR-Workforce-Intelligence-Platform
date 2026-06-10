export type WorkforceAnalytics = {
  totalEmployees: number
  activeEmployees: number
  inactiveEmployees: number
  departmentCount: number
  pendingLeaveRequests: number
  averageEngagementScore: number
  highAttritionRisk: number
  mediumAttritionRisk: number
  employeesWithSkillGaps: number
  totalSkillGaps: number
  departmentBreakdown: { department: string; employeeCount: number; activeCount: number }[]
  topAttritionRisks: { employeeName: string; riskScore: number; riskLevel: string }[]
}
