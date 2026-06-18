import { Loader2, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { Input } from '@/components/ui/input'
import { useEmployeeDirectory } from '@/hooks/use-employee-directory'
import { cn } from '@/lib/utils'

export function EmployeeDirectoryPage() {
  const { employees, isLoading, refetch } = useEmployeeDirectory()
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('All')

  const departments = useMemo(
    () => ['All', ...new Set(employees.map((e) => e.departmentName).filter(Boolean) as string[])],
    [employees],
  )

  const filtered = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase()
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      (emp.email ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesDept = department === 'All' || emp.departmentName === department
    return matchesSearch && matchesDept
  })
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-teal" />
      </div>
    )
  }
  return (
    <div>
      <DashboardHero
        eyebrow="People"
        titleHighlight="Employee"
        titleRest="Directory"
        description={`${employees.length} employees from employee-service`}
        onRefresh={refetch}
      />
      <div className="space-y-6 p-6 md:p-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="h-11 rounded-xl pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setDepartment(dept)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-all',
                  department === dept
                    ? 'bg-gradient-brand text-white shadow-md'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted',
                )}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((emp) => (
            <article key={emp.id} className="surface-panel flex gap-4 p-5 transition-shadow hover:shadow-xl">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-sm font-bold text-white">
                {emp.firstName[0]}
                {emp.lastName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {emp.firstName} {emp.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{emp.employeeCode}</p>
                <p className="mt-1 text-xs text-muted-foreground">{emp.departmentName ?? 'General'}</p>
                <div className="mt-3">
                  <StatusBadge status={emp.employmentStatus} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
