import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { Input } from '@/components/ui/input'
import { mockEmployees } from '@/data/mock-ui-data'
import { cn } from '@/lib/utils'

export function EmployeeDirectoryPage() {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('All')

  const departments = useMemo(
    () => ['All', ...new Set(mockEmployees.map((e) => e.department))],
    [],
  )

  const filtered = mockEmployees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase())
    const matchesDept = department === 'All' || emp.department === department
    return matchesSearch && matchesDept
  })

  return (
    <div>
      <DashboardHero
        eyebrow="People"
        titleHighlight="Employee"
        titleRest="Directory"
        description="Search, filter, and browse your organization roster"
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
            <article
              key={emp.id}
              className="surface-panel flex gap-4 p-5 transition-shadow hover:shadow-xl"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-sm font-bold text-white">
                {emp.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{emp.name}</p>
                <p className="text-sm text-muted-foreground">{emp.designation}</p>
                <p className="mt-1 text-xs text-muted-foreground">{emp.department}</p>
                <div className="mt-3">
                  <StatusBadge status={emp.status} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
