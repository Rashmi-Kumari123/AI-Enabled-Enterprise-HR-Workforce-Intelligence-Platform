import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as employeeApi from '@/lib/api/employee-api'
import * as payrollApi from '@/lib/api/payroll-api'
import type { GeneratePayslipInput, SalaryStructureInput } from '@/lib/api/payroll-api'
import { ApiError } from '@/lib/api/http'
import type { EmployeeProfile, PayslipDetail } from '@/types/hr'

const LIVE_REFETCH_MS = 30_000
function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
export function useHrPayroll(selectedEmployeeId: number | null) {
  const queryClient = useQueryClient()
  const employeesQuery = useQuery({
    queryKey: ['employees-directory'],
    queryFn: () => employeeApi.fetchEmployees(),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })
  const salaryStructuresQuery = useQuery({
    queryKey: ['salary-structures'],
    queryFn: () => payrollApi.fetchSalaryStructures(),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })
  const payslipsQuery = useQuery({
    queryKey: ['payslips', selectedEmployeeId],
    queryFn: () => payrollApi.fetchPayslips(selectedEmployeeId!),
    enabled: Boolean(selectedEmployeeId),
    retry: false,
    refetchInterval: LIVE_REFETCH_MS,
  })
  const selectedSalaryQuery = useQuery({
    queryKey: ['salary-structure', selectedEmployeeId],
    queryFn: () => payrollApi.fetchSalaryStructure(selectedEmployeeId!),
    enabled: Boolean(selectedEmployeeId),
    retry: false,
  })
  const saveSalaryMutation = useMutation({
    mutationFn: (payload: SalaryStructureInput) => payrollApi.upsertSalaryStructure(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] })
      queryClient.invalidateQueries({ queryKey: ['salary-structure', selectedEmployeeId] })
    },
  })
  const generateMutation = useMutation({
    mutationFn: (payload: GeneratePayslipInput) => payrollApi.generatePayslip(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payslips'] })
    },
  })
  const markPaidMutation = useMutation({
    mutationFn: (payslipId: number) => payrollApi.markPayslipPaid(payslipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payslips'] })
    },
  })
  const employees = (employeesQuery.data ?? []).filter((e) => e.employmentStatus !== 'TERMINATED')
  const salaryStructures = salaryStructuresQuery.data ?? []
  const configuredEmployeeIds = new Set(salaryStructures.map((s) => s.employeeId))
  const payslips = payslipsQuery.data ?? []
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId) ?? null
  const selectedSalary =
    selectedSalaryQuery.data ??
    salaryStructures.find((s) => s.employeeId === selectedEmployeeId) ??
    null

  const currentPeriodPayslip = payslips.find(
    (p) => p.payYear === new Date().getFullYear() && p.payMonth === new Date().getMonth() + 1,
  )
  async function runBatchPayroll(payYear: number, payMonth: number) {
    const results: { employee: EmployeeProfile; payslip?: PayslipDetail; error?: string }[] = []
    const configured = employees.filter((e) => configuredEmployeeIds.has(e.id))
    for (const employee of configured) {
      try {
        const payslip = await payrollApi.generatePayslip({
          employeeId: employee.id,
          employeeCode: employee.employeeCode,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          payYear,
          payMonth,
        })
        results.push({ employee, payslip })
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Generation failed'
        results.push({ employee, error: message })
      }
    }
    await queryClient.invalidateQueries({ queryKey: ['payslips'] })
    return results
  }
  return {
    employees,
    salaryStructures,
    configuredEmployeeIds,
    selectedEmployee,
    selectedSalary,
    payslips,
    currentPeriodPayslip,
    isLoading: employeesQuery.isLoading || salaryStructuresQuery.isLoading,
    isPayslipsLoading: payslipsQuery.isLoading,
    error:
      employeesQuery.error instanceof ApiError
        ? employeesQuery.error.message
        : salaryStructuresQuery.error instanceof ApiError
          ? salaryStructuresQuery.error.message
          : null,
    saveSalary: saveSalaryMutation.mutateAsync,
    isSavingSalary: saveSalaryMutation.isPending,
    saveSalaryError:
      saveSalaryMutation.error instanceof ApiError ? saveSalaryMutation.error.message : null,
    generatePayslip: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    generateError:
      generateMutation.error instanceof ApiError ? generateMutation.error.message : null,
    markPaid: markPaidMutation.mutateAsync,
    isMarkingPaid: markPaidMutation.isPending,
    runBatchPayroll,
    formatCurrency,
    refetch: () => {
      employeesQuery.refetch()
      salaryStructuresQuery.refetch()
      payslipsQuery.refetch()
      selectedSalaryQuery.refetch()
    },
  }
}
