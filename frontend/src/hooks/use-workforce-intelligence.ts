import { useQuery } from '@tanstack/react-query'
import type { AttritionReport, EngagementReport, SkillGapReport } from '@/types/ai-insights'
const mockAttrition: AttritionReport = {
  employeeCount: 5,
  highRiskCount: 1,
  mediumRiskCount: 2,
  predictions: [
    {
      employeeId: 4,
      employeeName: 'Vikram Singh',
      department: 'Sales',
      riskScore: 78,
      riskLevel: 'HIGH',
      aiSummary: 'Elevated attrition risk driven by attendance variance and pending leave patterns.',
      riskFactors: ['Attendance below team average', 'Extended leave requests', 'Tenure under 18 months'],
      recommendations: ['Schedule stay interview', 'Review compensation band', 'Assign mentor'],
      aiEnabled: false,
      provider: 'HEURISTIC',
    },
  ],
}
const mockEngagement: EngagementReport = {
  averageEngagementScore: 72,
  highEngagementCount: 2,
  lowEngagementCount: 1,
  scores: [
    {
      employeeId: 1,
      employeeName: 'Rashmi Kumari',
      department: 'Engineering',
      engagementScore: 85,
      engagementLevel: 'HIGH',
      scoreFactors: ['Strong attendance', 'High performance ratings'],
      recommendations: ['Consider leadership track'],
    },
  ],
}
const mockSkills: SkillGapReport = {
  employeeCount: 5,
  employeesWithGaps: 2,
  totalGapCount: 4,
  analyses: [
    {
      employeeId: 1,
      employeeName: 'Rashmi Kumari',
      department: 'Engineering',
      overallReadinessPercent: 88,
      gapCount: 1,
      gaps: [
        {
          skillCode: 'LEADERSHIP',
          skill: 'Team Leadership',
          currentScore: 3.2,
          targetScore: 4.0,
          gap: 0.8,
          priority: 'MEDIUM',
          recommendation: 'Enroll in management fundamentals workshop',
        },
      ],
      developmentPlan: ['Complete Q2 leadership training', 'Lead cross-team initiative'],
    },
  ],
}
export function useWorkforceIntelligence() {
  const query = useQuery({
    queryKey: ['workforce-intelligence'],
    queryFn: async () => ({
      attrition: mockAttrition,
      engagement: mockEngagement,
      skills: mockSkills,
    }),
  })
  return {
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error instanceof Error ? query.error.message : 'Failed to load insights',
    attrition: query.data?.attrition,
    engagement: query.data?.engagement,
    skills: query.data?.skills,
    refetch: query.refetch,
  }
}
