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
export type PayslipSummary = {
  id: number
  payslipNumber: string
  payYear: number
  payMonth: number
  grossPay: number
  netPay: number
  status: string
}
export type PerformanceScorecard = {
  employeeId: number
  totalReviews: number
  averageOverallRating: number | null
  averageByCriterion: Record<string, number>
}
