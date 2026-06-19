export type EmployeeProfile = {
  id: number
  userId: number
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  departmentId: number | null
  departmentName: string | null
  hireDate: string
  employmentStatus: string
  onboardingCompleted?: boolean
  createdAt?: string
  updatedAt?: string
}
export type OnboardingTask = {
  id: number
  taskCode: string
  title: string
  completed: boolean
  completedAt: string | null
}
export type OnboardingStatus = {
  employeeId: number
  onboardingCompleted: boolean
  tasks: OnboardingTask[]
}
export type EmployeeOnboardingPipeline = {
  id: number
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  departmentName: string | null
  employmentStatus: string
  onboardingCompleted: boolean
  tasks: OnboardingTask[]
}
export type Department = {
  id: number
  code: string
  name: string
  description: string | null
}
export type HireEmployeeInput = {
  firstName: string
  lastName: string
  email: string
  temporaryPassword: string
  phone?: string
  departmentId: number
  hireDate: string
}
export type HireEmployeeResponse = {
  userId: number
  employeeId: number
  employeeCode: string
  email: string
  firstName: string
  lastName: string
  message: string
}
export type EmployeeDocument = {
  id: number
  employeeId: number
  originalFileName: string
  contentType: string | null
  fileSize: number
  documentType: string
  uploadedAt: string
}
export type AttendanceRecord = {
  id: number
  employeeId: number
  workDate: string
  clockIn: string | null
  clockOut: string | null
  status: string
  notes: string | null
}
export type LeaveRequest = {
  id: number
  employeeId: number
  leaveType: string
  startDate: string
  endDate: string
  reason: string
  status: string
  reviewedBy: string | null
  reviewComment: string | null
  submittedAt: string
}
export type LeaveBalance = {
  leaveType: string
  balanceYear: number
  entitledDays: number
  usedDays: number
  remainingDays: number
}
export type PayslipSummary = {
  id: number
  payslipNumber: string
  payYear: number
  payMonth: number
  grossPay: number
  netPay: number
  status: string
}
export type PayslipDetail = PayslipSummary & {
  employeeId: number
  employeeCode: string
  employeeName: string
  baseSalary: number
  hraAmount: number
  transportAllowance: number
  otherAllowance: number
  pfDeduction: number
  professionalTax: number
  incomeTax: number
  leaveDeduction: number
  totalDeductions: number
  currency: string
}
export type SalaryStructure = {
  id: number
  employeeId: number
  baseSalary: number
  hraPercent: number
  transportAllowance: number
  otherAllowance: number
  currency: string
}
export type PerformanceReview = {
  id: number
  employeeId: number
  reviewerEmail: string
  reviewYear: number
  reviewQuarter: number
  goals: string | null
  summaryComment: string | null
  overallRating: number | null
  status: string
  submittedAt: string | null
  acknowledgedAt: string | null
  ratings?: PerformanceRating[]
}
export type PerformanceRating = {
  id: number
  criterion: string
  score: number
  comment: string | null
}
export type FeedbackType = 'SELF' | 'MANAGER' | 'PEER' | 'DIRECT_REPORT'
export type PerformanceFeedback = {
  id: number
  reviewId: number
  employeeId: number
  respondentEmail: string
  feedbackType: FeedbackType
  status: string
  summaryComment: string | null
  overallRating: number | null
  submittedAt: string | null
  ratings: PerformanceRating[]
}
export type TrendPoint = {
  reviewYear: number
  reviewQuarter: number
  averageRating: number | null
}
export type PerformanceScorecard = {
  employeeId: number
  totalReviews: number
  averageOverallRating: number | null
  averageByCriterion: Record<string, number>
  averageByFeedbackType?: Record<string, number>
  trendByQuarter?: TrendPoint[]
  recentReviews?: PerformanceReview[]
}
