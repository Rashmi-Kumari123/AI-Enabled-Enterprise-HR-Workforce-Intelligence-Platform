import { fetchAuthedBlob, fetchAuthedJson, fetchAuthedVoid } from '@/lib/api/authenticated'
import { apiConfig } from '@/lib/api/config'
import type { CreateReportScheduleInput, ReportSchedule } from '@/types/report-schedule'

const base = `${apiConfig.aiInsights}/api/v1/ai/reports`
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
function datedFilename(ext: string): string {
  return `nexushr-workforce-analytics-${new Date().toISOString().slice(0, 10)}.${ext}`
}
export async function downloadWorkforceReportPdf(): Promise<void> {
  const blob = await fetchAuthedBlob(`${base}/export/pdf`)
  downloadBlob(blob, datedFilename('pdf'))
}
export async function downloadWorkforceReportExcel(): Promise<void> {
  const blob = await fetchAuthedBlob(`${base}/export/excel`)
  downloadBlob(blob, datedFilename('xlsx'))
}
export async function downloadWorkforceReportCsvFromApi(): Promise<void> {
  const blob = await fetchAuthedBlob(`${base}/export/csv`)
  downloadBlob(blob, datedFilename('csv'))
}
export function fetchReportSchedules(): Promise<ReportSchedule[]> {
  return fetchAuthedJson<ReportSchedule[]>(`${base}/schedules`)
}
export function createReportSchedule(payload: CreateReportScheduleInput): Promise<ReportSchedule> {
  return fetchAuthedJson<ReportSchedule>(`${base}/schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
export function deleteReportSchedule(id: number): Promise<void> {
  return fetchAuthedVoid(`${base}/schedules/${id}`, { method: 'DELETE' })
}
export function runReportScheduleNow(id: number): Promise<void> {
  return fetchAuthedVoid(`${base}/schedules/${id}/run-now`, { method: 'POST' })
}
