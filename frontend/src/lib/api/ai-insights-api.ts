import { fetchAuthedJson } from '@/lib/api/authenticated'
import { apiConfig } from '@/lib/api/config'
import type { WorkforceAnalytics } from '@/types/admin-analytics'
import type { AttritionPrediction, AttritionReport, EngagementReport, EngagementScore, SkillGap, SkillGapAnalysis, SkillGapReport } from '@/types/ai-insights';
const base = apiConfig.aiInsights
type BackendAttritionPrediction = Omit<AttritionPrediction, 'department'> & {
  department: string
}
type TeamAttritionResponse = {
  employeeCount: number
  highRiskCount: number
  mediumRiskCount: number
  predictions: BackendAttritionPrediction[]
}
type TeamEngagementResponse = {
  employeeCount: number
  averageEngagementScore: number
  highEngagementCount: number
  lowEngagementCount: number
  scores: EngagementScore[]
}
type BackendSkillGapItem = {
  skill: string
  skillCode: string
  currentScore: number
  targetScore: number
  gap: number
  priority: SkillGap['priority']
  recommendation: string
}
type BackendSkillGapAnalysis = {
  employeeId: number
  employeeName: string
  department: string
  overallReadinessPercent: number
  gapCount: number
  gaps: BackendSkillGapItem[]
  developmentPlan: string[]
}
type TeamSkillGapResponse = {
  employeeCount: number
  employeesWithGaps: number
  totalGapCount: number
  analyses: BackendSkillGapAnalysis[]
}
type WorkforceAnalyticsResponse = {
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
function mapAttrition(data: TeamAttritionResponse): AttritionReport {
  return {
    employeeCount: data.employeeCount,
    highRiskCount: data.highRiskCount,
    mediumRiskCount: data.mediumRiskCount,
    predictions: data.predictions.map((p) => ({
      ...p,
      department: p.department ?? null,
    })),
  }
}
function mapSkillAnalysis(item: BackendSkillGapAnalysis): SkillGapAnalysis {
  return {
    employeeId: item.employeeId,
    employeeName: item.employeeName,
    department: item.department ?? null,
    overallReadinessPercent: item.overallReadinessPercent,
    gapCount: item.gapCount,
    gaps: item.gaps,
    developmentPlan: item.developmentPlan,
  }
}
export function fetchTeamAttrition(): Promise<AttritionReport> {
  return fetchAuthedJson<TeamAttritionResponse>(`${base}/api/v1/ai/attrition/team`).then(mapAttrition)
}
export function fetchTeamEngagement(): Promise<EngagementReport> {
  return fetchAuthedJson<TeamEngagementResponse>(`${base}/api/v1/ai/engagement/team`).then((data) => ({
    averageEngagementScore: data.averageEngagementScore,
    highEngagementCount: data.highEngagementCount,
    lowEngagementCount: data.lowEngagementCount,
    scores: data.scores.map((s) => ({ ...s, department: s.department ?? null })),
  }))
}
export function fetchTeamSkillGaps(): Promise<SkillGapReport> {
  return fetchAuthedJson<TeamSkillGapResponse>(`${base}/api/v1/ai/skills/gaps/team`).then((data) => ({
    employeeCount: data.employeeCount,
    employeesWithGaps: data.employeesWithGaps,
    totalGapCount: data.totalGapCount,
    analyses: data.analyses.map(mapSkillAnalysis),
  }))
}
export function fetchWorkforceAnalytics(): Promise<WorkforceAnalytics> {
  return fetchAuthedJson<WorkforceAnalyticsResponse>(`${base}/api/v1/ai/analytics/workforce`).then(
    (data) => ({
      totalEmployees: data.totalEmployees,
      activeEmployees: data.activeEmployees,
      inactiveEmployees: data.inactiveEmployees,
      departmentCount: data.departmentCount,
      pendingLeaveRequests: data.pendingLeaveRequests,
      averageEngagementScore: data.averageEngagementScore,
      highAttritionRisk: data.highAttritionRisk,
      mediumAttritionRisk: data.mediumAttritionRisk,
      employeesWithSkillGaps: data.employeesWithSkillGaps,
      totalSkillGaps: data.totalSkillGaps,
      departmentBreakdown: data.departmentBreakdown,
      topAttritionRisks: data.topAttritionRisks,
    }),
  )
}
