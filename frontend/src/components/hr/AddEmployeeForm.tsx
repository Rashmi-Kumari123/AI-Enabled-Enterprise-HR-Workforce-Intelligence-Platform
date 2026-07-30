import { Loader2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { hireEmployee } from '@/lib/api/auth-api'
import { fetchDepartments } from '@/lib/api/employee-api'
import { hireRoleOptions, type HireRole } from '@/lib/auth/signup-roles'
import type { HireEmployeeResponse } from '@/types/hr'
type AddEmployeeFormProps = {
  onHired?: (result: HireEmployeeResponse) => void
}
function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}
export function AddEmployeeForm({ onHired }: AddEmployeeFormProps) {
  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: () => fetchDepartments(),
    retry: 1,
  })
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [hireDate, setHireDate] = useState(todayIsoDate())
  const [role, setRole] = useState<HireRole>('EMPLOYEE')
  const [temporaryPassword, setTemporaryPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<HireEmployeeResponse | null>(null)
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('First name, last name, and email are required.')
      return
    }
    if (!departmentId) {
      setError('Select a department.')
      return
    }
    if (temporaryPassword.length < 8) {
      setError('Temporary password must be at least 8 characters.')
      return
    }
    setSubmitting(true)
    try {
      const result = await hireEmployee({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        departmentId: Number(departmentId),
        hireDate,
        temporaryPassword,
        role,
      })
      setSuccess(result)
      onHired?.(result)
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhone('')
      setDepartmentId('')
      setHireDate(todayIsoDate())
      setTemporaryPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to hire employee')
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <Card className="surface-panel border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserPlus className="h-5 w-5 text-brand-teal" />
          Add employee
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Creates login credentials and starts the onboarding checklist (PROBATION).
        </p>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="hire-first-name">First name</Label>
            <Input
              id="hire-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ananya"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hire-last-name">Last name</Label>
            <Input
              id="hire-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Kumar"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hire-email">Work email</Label>
            <Input
              id="hire-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ananya.kumar@nexushr.com"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hire-phone">Phone (optional)</Label>
            <Input
              id="hire-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hire-department">Department</Label>
            <select
              id="hire-department"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={departmentsQuery.isLoading || departmentsQuery.isError}
            >
              <option value="">Select department</option>
              {(departmentsQuery.data ?? []).map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
            {departmentsQuery.isError ? (
              <p className="text-xs text-red-600 dark:text-red-400">
                Could not load departments. Refresh the page or contact support.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="hire-role">Role</Label>
            <select
              id="hire-role"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={role}
              onChange={(e) => setRole(e.target.value as HireRole)}
            >
              {hireRoleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hire-date">Hire date</Label>
            <Input
              id="hire-date"
              type="date"
              value={hireDate}
              onChange={(e) => setHireDate(e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="hire-password">Temporary password</Label>
            <Input
              id="hire-password"
              type="password"
              value={temporaryPassword}
              onChange={(e) => setTemporaryPassword(e.target.value)}
              placeholder="Min. 8 characters — share securely with the employee"
              autoComplete="new-password"
            />
          </div>

          {error ? (
            <p className="md:col-span-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          ) : null}
          {success ? (
            <div className="md:col-span-2 rounded-xl bg-teal-500/10 px-4 py-3 text-sm text-teal-900 dark:text-teal-100">
              <p className="font-medium">
                {success.firstName} {success.lastName} hired ({success.employeeCode})
              </p>
              <p className="mt-1 text-muted-foreground">
                Login: {success.email} · {success.message}
              </p>
            </div>
          ) : null}

          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" variant="gradient" className="rounded-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Add employee
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
