import type { WorkforceAnalytics } from '@/types/admin-analytics'
export function downloadWorkforceAnalyticsCsv(analytics: WorkforceAnalytics): void {
  const lines: string[] = [
    'NexusHR Workforce Analytics Export',
    `Generated,${new Date().toISOString()}`,
    '',
    'Metric,Value',
    `Total Employees,${analytics.totalEmployees}`,
    `Active Employees,${analytics.activeEmployees}`,
    `Inactive Employees,${analytics.inactiveEmployees}`,
    `Departments,${analytics.departmentCount}`,
    `Pending Leave Requests,${analytics.pendingLeaveRequests}`,
    `Average Engagement Score,${analytics.averageEngagementScore.toFixed(1)}`,
    `High Attrition Risk,${analytics.highAttritionRisk}`,
    `Medium Attrition Risk,${analytics.mediumAttritionRisk}`,
    `Employees With Skill Gaps,${analytics.employeesWithSkillGaps}`,
    `Total Skill Gaps,${analytics.totalSkillGaps}`,
    '',
    'Department,Employees,Active',
  ]
  for (const dept of analytics.departmentBreakdown) {
    lines.push(`${escapeCsv(dept.department)},${dept.employeeCount},${dept.activeCount}`)
  }
  if (analytics.topAttritionRisks.length > 0) {
    lines.push('', 'Top Attrition Risks,Score,Level')
    for (const risk of analytics.topAttritionRisks) {
      lines.push(
        `${escapeCsv(risk.employeeName)},${risk.riskScore},${risk.riskLevel}`,
      )
    }
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `nexushr-workforce-analytics-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"')) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}
