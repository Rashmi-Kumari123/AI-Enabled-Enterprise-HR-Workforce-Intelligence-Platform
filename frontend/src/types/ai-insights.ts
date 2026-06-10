export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type EngagementLevel = 'LOW' | 'MODERATE' | 'HIGH'
export type GapPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type AiProvider = 'OPENAI' | 'HUGGINGFACE' | 'HEURISTIC'
export type InsightsTab = 'attrition' | 'engagement' | 'skills'

export type AttritionPrediction = {
  employeeId: number
  employeeName: string
  department: string | null
  riskScore: number
  riskLevel: RiskLevel
  aiSummary: string
  riskFactors: string[]
  recommendations: string[]
  aiEnabled: boolean
  provider: AiProvider
}
export type EngagementScore = {
  employeeId: number
  employeeName: string
  department: string | null
  engagementScore: number
  engagementLevel: EngagementLevel
  scoreFactors: string[]
  recommendations: string[]
}
export type SkillGap = {
  skillCode: string
  skill: string
  currentScore: number
  targetScore: number
  gap: number
  priority: GapPriority
  recommendation: string
}
export type SkillGapAnalysis = {
  employeeId: number
  employeeName: string
  department: string | null
  overallReadinessPercent: number
  gapCount: number
  gaps: SkillGap[]
  developmentPlan: string[]
}
export type AttritionReport = {
  employeeCount: number
  highRiskCount: number
  mediumRiskCount: number
  predictions: AttritionPrediction[]
}
export type EngagementReport = {
  averageEngagementScore: number
  highEngagementCount: number
  lowEngagementCount: number
  scores: EngagementScore[]
}
export type SkillGapReport = {
  employeeCount: number
  employeesWithGaps: number
  totalGapCount: number
  analyses: SkillGapAnalysis[]
}
