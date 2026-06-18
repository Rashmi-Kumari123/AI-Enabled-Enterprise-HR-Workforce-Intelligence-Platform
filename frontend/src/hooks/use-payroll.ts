import { useQuery } from '@tanstack/react-query'
import * as employeeApi from '@/lib/api/employee-api'
import * as payrollApi from '@/lib/api/payroll-api'
import { ApiError } from '@/lib/api/http'

const LIVE_REFETCH_MS = 60_000
function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
export function usePayroll() {
  const profileQuery = useQuery({
    queryKey: ['employee-profile'],
    queryFn: () => employeeApi.fetchMyProfile(),
    retry: false,
  })

  const employeeId = profileQuery.data?.id
  const payslipsQuery = useQuery({
    queryKey: ['payslips', employeeId],
    queryFn: () => payrollApi.fetchPayslips(employeeId!),
    enabled: Boolean(employeeId),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })
  const salaryQuery = useQuery({
    queryKey: ['salary-structure', employeeId],
    queryFn: () => payrollApi.fetchSalaryStructure(employeeId!),
    enabled: Boolean(employeeId),
    retry: false,
    retryOnMount: false,
  })
  const payslips = payslipsQuery.data ?? []
  const latest = payslips[0] ?? null
  const salary = salaryQuery.data

  const estimatedGross = salary
    ? Number(salary.baseSalary) +
      Number(salary.baseSalary) * (Number(salary.hraPercent) / 100) +
      Number(salary.transportAllowance) +
      Number(salary.otherAllowance)
    : latest?.grossPay ?? 0

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading || payslipsQuery.isLoading,
    payslips,
    latest,
    salary,
    error: payslipsQuery.error instanceof ApiError ? payslipsQuery.error.message : null,
    metrics: {
      currentSalary: formatCurrency(estimatedGross, salary?.currency ?? latest?.currency ?? 'INR'),
      monthlyEarnings: latest ? formatCurrency(latest.grossPay, latest.currency) : '—',
      taxDeductions: latest
        ? formatCurrency(
            latest.incomeTax + latest.professionalTax,
            latest.currency,
          )
        : '—',
      netPay: latest ? formatCurrency(latest.netPay, latest.currency) : '—',
    },
    breakdown: latest
      ? [
          { label: 'Basic Salary', amount: formatCurrency(latest.baseSalary, latest.currency) },
          { label: 'HRA', amount: formatCurrency(latest.hraAmount, latest.currency) },
          { label: 'Other Allowances', amount: formatCurrency(latest.otherAllowance + latest.transportAllowance, latest.currency) },
          { label: 'PF Deduction', amount: `-${formatCurrency(latest.pfDeduction, latest.currency)}` },
          { label: 'Income Tax', amount: `-${formatCurrency(latest.incomeTax, latest.currency)}` },
          { label: 'Professional Tax', amount: `-${formatCurrency(latest.professionalTax, latest.currency)}` },
        ]
      : [],
    downloadLatest: async () => {
      if (!latest) return
      await payrollApi.downloadPayslip(latest)
    },
    refetch: payslipsQuery.refetch,
  }
}
