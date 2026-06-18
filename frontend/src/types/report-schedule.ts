export type ReportFrequency = 'WEEKLY' | 'MONTHLY'
export type ReportFormat = 'CSV' | 'EXCEL' | 'PDF'
export type ReportSchedule = {
  id: number
  recipientEmail: string
  createdByEmail: string
  frequency: ReportFrequency
  reportFormat: ReportFormat
  enabled: boolean
  nextRunAt: string
  lastRunAt: string | null
  createdAt: string
}
export type CreateReportScheduleInput = {
  recipientEmail?: string
  frequency: ReportFrequency
  reportFormat: ReportFormat
}
