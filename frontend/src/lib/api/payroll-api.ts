import { apiConfig } from '@/lib/api/config'
import { fetchAuthedJson } from '@/lib/api/authenticated'
import type { PayslipSummary } from '@/types/hr'

const base = apiConfig.payroll
type PayslipResponse = PayslipSummary & {
  employeeId: number
  employeeName: string
  grossPay: number
  netPay: number
}
export async function fetchLatestPayslip(employeeId: number): Promise<PayslipSummary | null> {
  const payslips = await fetchAuthedJson<PayslipResponse[]>(
    `${base}/api/v1/payroll/payslips/employee/${employeeId}`,
  )
  if (payslips.length === 0) return null
  const latest = payslips[0]
  return {
    id: latest.id,
    payslipNumber: latest.payslipNumber,
    payYear: latest.payYear,
    payMonth: latest.payMonth,
    grossPay: latest.grossPay,
    netPay: latest.netPay,
    status: latest.status,
  }
}
