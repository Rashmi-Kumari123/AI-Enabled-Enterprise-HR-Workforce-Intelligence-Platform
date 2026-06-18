import { apiConfig } from '@/lib/api/config'
import { fetchAuthedBlob, fetchAuthedJson } from '@/lib/api/authenticated'
import type { PayslipDetail, SalaryStructure } from '@/types/hr'
const base = apiConfig.payroll
export type SalaryStructureInput = {
  employeeId: number
  baseSalary: number
  hraPercent?: number
  transportAllowance?: number
  otherAllowance?: number
}
export type GeneratePayslipInput = {
  employeeId: number
  employeeCode: string
  employeeName: string
  payYear: number
  payMonth: number
  workingDays?: number
  unpaidLeaveDays?: number
}
export async function fetchPayslips(employeeId: number): Promise<PayslipDetail[]> {
  return fetchAuthedJson<PayslipDetail[]>(`${base}/api/v1/payroll/payslips/employee/${employeeId}`)
}
export async function fetchSalaryStructures(): Promise<SalaryStructure[]> {
  return fetchAuthedJson<SalaryStructure[]>(`${base}/api/v1/payroll/salary-structures`)
}

export function fetchSalaryStructure(employeeId: number): Promise<SalaryStructure> {
  return fetchAuthedJson(`${base}/api/v1/payroll/salary-structures/employee/${employeeId}`)
}
export function upsertSalaryStructure(payload: SalaryStructureInput): Promise<SalaryStructure> {
  return fetchAuthedJson(`${base}/api/v1/payroll/salary-structures`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
export function generatePayslip(payload: GeneratePayslipInput): Promise<PayslipDetail> {
  return fetchAuthedJson(`${base}/api/v1/payroll/payslips/generate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
export function markPayslipPaid(payslipId: number): Promise<PayslipDetail> {
  return fetchAuthedJson(`${base}/api/v1/payroll/payslips/${payslipId}/mark-paid`, {
    method: 'POST',
  })
}
export function downloadPayslipPdf(payslipId: number): Promise<Blob> {
  return fetchAuthedBlob(`${base}/api/v1/payroll/payslips/${payslipId}/download`)
}
export async function fetchLatestPayslip(employeeId: number): Promise<PayslipDetail | null> {
  const payslips = await fetchPayslips(employeeId)
  return payslips[0] ?? null
}
export async function downloadPayslip(payslip: PayslipDetail): Promise<void> {
  const blob = await downloadPayslipPdf(payslip.id)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${payslip.payslipNumber}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
