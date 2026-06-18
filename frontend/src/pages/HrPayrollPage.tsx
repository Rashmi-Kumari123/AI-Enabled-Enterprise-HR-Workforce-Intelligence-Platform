import { Banknote, CheckCircle2, Download, IndianRupee, Loader2, Play, Receipt, Users } from 'lucide-react';
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { useHrPayroll } from '@/hooks/use-hr-payroll'
import * as payrollApi from '@/lib/api/payroll-api'
import { cn } from '@/lib/utils'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
export function HrPayrollPage() {
  const { hasRole } = useAuth()
  const allowed = hasRole('HR') || hasRole('ADMIN')
  const now = new Date()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null)
  const [payYear, setPayYear] = useState(now.getFullYear())
  const [payMonth, setPayMonth] = useState(now.getMonth() + 1)
  const [baseSalary, setBaseSalary] = useState('50000')
  const [hraPercent, setHraPercent] = useState('40')
  const [transportAllowance, setTransportAllowance] = useState('2000')
  const [otherAllowance, setOtherAllowance] = useState('1000')
  const [batchSummary, setBatchSummary] = useState<string | null>(null)
  const [actingPayslipId, setActingPayslipId] = useState<number | null>(null)
  const [isBatchRunning, setIsBatchRunning] = useState(false)

  const { employees, configuredEmployeeIds, selectedEmployee, selectedSalary, payslips, isLoading, isPayslipsLoading, error, saveSalary, isSavingSalary,
    saveSalaryError, generatePayslip, isGenerating, generateError, markPaid, runBatchPayroll, formatCurrency, refetch } = useHrPayroll(selectedEmployeeId);

  useEffect(() => {
    if (!selectedEmployeeId && employees.length > 0) {
      setSelectedEmployeeId(employees[0].id)
    }
  }, [employees, selectedEmployeeId])

  useEffect(() => {
    if (selectedSalary) {
      setBaseSalary(String(selectedSalary.baseSalary))
      setHraPercent(String(selectedSalary.hraPercent))
      setTransportAllowance(String(selectedSalary.transportAllowance))
      setOtherAllowance(String(selectedSalary.otherAllowance))
    }
  }, [selectedSalary, selectedEmployeeId])

  if (!allowed) {
    return (
      <div className="p-10">
        <Card className="surface-panel">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Payroll operations are available to HR and Admin roles.
          </CardContent>
        </Card>
      </div>
    )
  }
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-teal" />
      </div>
    )
  }
  const configuredCount = configuredEmployeeIds.size
  async function handleSaveSalary(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedEmployeeId) return
    await saveSalary({
      employeeId: selectedEmployeeId,
      baseSalary: Number(baseSalary),
      hraPercent: Number(hraPercent),
      transportAllowance: Number(transportAllowance),
      otherAllowance: Number(otherAllowance),
    })
  }
  async function handleGeneratePayslip() {
    if (!selectedEmployee) return
    await generatePayslip({
      employeeId: selectedEmployee.id,
      employeeCode: selectedEmployee.employeeCode,
      employeeName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
      payYear,
      payMonth,
    })
  }
  async function handleBatchRun() {
    setIsBatchRunning(true)
    setBatchSummary(null)
    try {
      const results = await runBatchPayroll(payYear, payMonth)
      const created = results.filter((r) => r.payslip).length
      const skipped = results.filter((r) => r.error).length
      setBatchSummary(
        `Batch complete: ${created} payslip(s) generated, ${skipped} skipped (already exists or error).`,
      )
    } finally {
      setIsBatchRunning(false)
    }
  }
  async function handleMarkPaid(payslipId: number) {
    setActingPayslipId(payslipId)
    try {
      await markPaid(payslipId)
    } finally {
      setActingPayslipId(null)
    }
  }
  async function handleDownload(payslipId: number) {
    setActingPayslipId(payslipId)
    try {
      const payslip = payslips.find((p) => p.id === payslipId)
      if (payslip) {
        await payrollApi.downloadPayslip(payslip)
      }
    } finally {
      setActingPayslipId(null)
    }
  }
  return (
    <div>
      <DashboardHero
        eyebrow="People Operations"
        titleHighlight="Payroll"
        titleRest="Operations"
        description="Configure salary · generate payslips · mark paid · export PDF — end-to-end payroll-service"
        onRefresh={refetch}
      />
      <div className="space-y-8 p-6 md:p-10">
        {error ? (
          <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            {error} — ensure payroll-service (8083) and employee-service (8082) are running.
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="surface-panel border-0">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-brand-teal">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{employees.length}</p>
                <p className="text-sm text-muted-foreground">Active employees</p>
              </div>
            </CardContent>
          </Card>
          <Card className="surface-panel border-0">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-brand-purple">
                <IndianRupee className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{configuredCount}</p>
                <p className="text-sm text-muted-foreground">Salary configured</p>
              </div>
            </CardContent>
          </Card>
          <Card className="surface-panel border-0">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-brand-teal">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {MONTHS[payMonth - 1]?.slice(0, 3)} {payYear}
                </p>
                <p className="text-sm text-muted-foreground">Selected pay period</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="surface-panel border-0">
          <CardHeader>
            <SectionHeader
              title="Run payroll"
              description="Generate payslips for all employees with a configured salary structure"
            />
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="payYear">Year</Label>
              <Input
                id="payYear"
                type="number"
                className="w-28 rounded-xl"
                value={payYear}
                onChange={(e) => setPayYear(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payMonth">Month</Label>
              <select
                id="payMonth"
                className="h-11 rounded-xl border border-input bg-input px-3 text-sm"
                value={payMonth}
                onChange={(e) => setPayMonth(Number(e.target.value))}
              >
                {MONTHS.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="gradient"
              className="rounded-full"
              disabled={isBatchRunning || configuredCount === 0}
              onClick={handleBatchRun}
            >
              {isBatchRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Run batch payroll
            </Button>
            {batchSummary ? (
              <p className="w-full text-sm text-muted-foreground">{batchSummary}</p>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card className="surface-panel border-0">
            <CardHeader>
              <SectionHeader title="Workforce" description="Select employee to configure" />
            </CardHeader>
            <CardContent className="max-h-[420px] space-y-1 overflow-y-auto">
              {employees.map((employee) => {
                const hasSalary = configuredEmployeeIds.has(employee.id)
                const isSelected = employee.id === selectedEmployeeId
                return (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() => setSelectedEmployeeId(employee.id)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                      isSelected ? 'bg-gradient-brand text-white' : 'hover:bg-muted/60',
                    )}
                  >
                    <span>
                      <span className="block font-medium">
                        {employee.firstName} {employee.lastName}
                      </span>
                      <span className={cn('text-xs', isSelected ? 'text-white/80' : 'text-muted-foreground')}>
                        {employee.employeeCode}
                      </span>
                    </span>
                    {hasSalary ? (
                      <CheckCircle2 className={cn('h-4 w-4 shrink-0', isSelected ? 'text-white' : 'text-brand-teal')} />
                    ) : null}
                  </button>
                )
              })}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="surface-panel border-0">
              <CardHeader>
                <SectionHeader
                  title="Salary structure"
                  description={
                    selectedEmployee
                      ? `${selectedEmployee.firstName} ${selectedEmployee.lastName} · ${selectedEmployee.email}`
                      : 'Select an employee'
                  }
                />
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSalary} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="baseSalary">Base salary (INR)</Label>
                    <Input
                      id="baseSalary"
                      type="number"
                      min="1"
                      className="rounded-xl"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hraPercent">HRA %</Label>
                    <Input
                      id="hraPercent"
                      type="number"
                      min="0"
                      className="rounded-xl"
                      value={hraPercent}
                      onChange={(e) => setHraPercent(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transport">Transport allowance</Label>
                    <Input
                      id="transport"
                      type="number"
                      min="0"
                      className="rounded-xl"
                      value={transportAllowance}
                      onChange={(e) => setTransportAllowance(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="other">Other allowance</Label>
                    <Input
                      id="other"
                      type="number"
                      min="0"
                      className="rounded-xl"
                      value={otherAllowance}
                      onChange={(e) => setOtherAllowance(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 sm:col-span-2">
                    <Button type="submit" variant="gradient" className="rounded-full" disabled={!selectedEmployeeId || isSavingSalary}>
                      {isSavingSalary ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />}
                      Save salary structure
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      disabled={!selectedEmployee || !configuredEmployeeIds.has(selectedEmployee.id) || isGenerating}
                      onClick={handleGeneratePayslip}
                    >
                      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
                      Generate payslip
                    </Button>
                  </div>
                  {saveSalaryError ? (
                    <p className="text-sm text-red-600 sm:col-span-2">{saveSalaryError}</p>
                  ) : null}
                  {generateError ? (
                    <p className="text-sm text-red-600 sm:col-span-2">{generateError}</p>
                  ) : null}
                </form>
              </CardContent>
            </Card>

            <Card className="surface-panel border-0">
              <CardHeader>
                <SectionHeader
                  title="Payslip history"
                  description={
                    selectedEmployee
                      ? `Payslips for ${selectedEmployee.firstName} — employees see these on Payroll page`
                      : 'Select an employee'
                  }
                />
              </CardHeader>
              <CardContent>
                {isPayslipsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
                  </div>
                ) : payslips.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No payslips yet. Save a salary structure, then generate a payslip for{' '}
                    {MONTHS[payMonth - 1]} {payYear}.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-muted-foreground">
                          <th className="pb-3 pr-4 font-medium">Period</th>
                          <th className="pb-3 pr-4 font-medium">Gross</th>
                          <th className="pb-3 pr-4 font-medium">Net</th>
                          <th className="pb-3 pr-4 font-medium">Status</th>
                          <th className="pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payslips.map((payslip) => (
                          <tr key={payslip.id} className="border-b border-border/60">
                            <td className="py-3 pr-4">
                              {MONTHS[payslip.payMonth - 1]} {payslip.payYear}
                              <span className="mt-0.5 block text-xs text-muted-foreground">{payslip.payslipNumber}</span>
                            </td>
                            <td className="py-3 pr-4">{formatCurrency(payslip.grossPay, payslip.currency)}</td>
                            <td className="py-3 pr-4 font-semibold">
                              {formatCurrency(payslip.netPay, payslip.currency)}
                            </td>
                            <td className="py-3 pr-4">
                              <StatusBadge status={payslip.status} />
                            </td>
                            <td className="py-3">
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full"
                                  disabled={actingPayslipId === payslip.id}
                                  onClick={() => handleDownload(payslip.id)}
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  PDF
                                </Button>
                                {payslip.status === 'GENERATED' ? (
                                  <Button
                                    size="sm"
                                    variant="gradient"
                                    className="rounded-full"
                                    disabled={actingPayslipId === payslip.id}
                                    onClick={() => handleMarkPaid(payslip.id)}
                                  >
                                    {actingPayslipId === payslip.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                    )}
                                    Mark paid
                                  </Button>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Employees view their own payslips on{' '}
          <Link to="/dashboard/payroll" className="font-medium text-brand-teal hover:underline">
            Payroll
          </Link>
          . Payslip-ready notifications are sent when payroll is generated.
        </p>
      </div>
    </div>
  )
}
