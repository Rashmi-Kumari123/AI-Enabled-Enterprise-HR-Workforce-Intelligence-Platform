export type DateRangePreset = '30d' | '90d' | '6m' | '1y' | 'all'
export type ChartPoint = {
  name: string
  value: number
  [key: string]: string | number
}
export const DATE_RANGE_OPTIONS: { id: DateRangePreset; label: string }[] = [
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: '6m', label: '6 months' },
  { id: '1y', label: '1 year' },
  { id: 'all', label: 'All time' },
]
export function presetStartDate(preset: DateRangePreset): Date | null {
  if (preset === 'all') return null
  const now = new Date()
  const start = new Date(now)
  switch (preset) {
    case '30d':
      start.setDate(start.getDate() - 30)
      return start
    case '90d':
      start.setDate(start.getDate() - 90)
      return start
    case '6m':
      start.setMonth(start.getMonth() - 6)
      return start
    case '1y':
      start.setFullYear(start.getFullYear() - 1)
      return start
    default:
      return null
  }
}
export function isOnOrAfter(dateIso: string, start: Date | null): boolean {
  if (!start) return true
  return new Date(dateIso) >= start
}
export function toChartPoints(labels: string[], values: number[]): ChartPoint[] {
  return labels.map((name, i) => ({ name, value: values[i] ?? 0 }))
}
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value)
}
type HireRecord = { hireDate: string; employmentStatus: string }

/** Cumulative active headcount by quarter from real hire dates. */
export function buildHeadcountTrend(
  employees: HireRecord[],
  preset: DateRangePreset,
): ChartPoint[] {
  const start = presetStartDate(preset)
  const active = employees.filter((e) => e.employmentStatus === 'ACTIVE' && e.hireDate)
  if (active.length === 0) return []
  const quarters = new Map<string, { label: string; sortKey: string; hires: number }>()
  const now = new Date()
  for (const emp of active) {
    const hired = new Date(emp.hireDate)
    if (start && hired < start) continue
    const q = Math.floor(hired.getMonth() / 3) + 1
    const key = `${hired.getFullYear()}-Q${q}`
    const label = `Q${q} ${String(hired.getFullYear()).slice(2)}`
    const existing = quarters.get(key)
    if (existing) {
      existing.hires += 1
    } else {
      quarters.set(key, { label, sortKey: key, hires: 1 })
    }
  }
  // Always include current quarter for trend endpoint
  const currentQ = Math.floor(now.getMonth() / 3) + 1
  const currentKey = `${now.getFullYear()}-Q${currentQ}`
  if (!quarters.has(currentKey)) {
    quarters.set(currentKey, {
      label: `Q${currentQ} ${String(now.getFullYear()).slice(2)}`,
      sortKey: currentKey,
      hires: 0,
    })
  }
  const sorted = [...quarters.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  let cumulative = 0
  if (start) {
    cumulative = active.filter((e) => new Date(e.hireDate) < start).length
  }
  return sorted.map(([, entry]) => {
    cumulative += entry.hires
    return { name: entry.label, value: cumulative, hires: entry.hires }
  })
}
export function filterAttendanceHistory<T extends { workDate: string }>(
  records: T[],
  preset: DateRangePreset,
): T[] {
  const start = presetStartDate(preset)
  if (!start) return records
  return records.filter((r) => isOnOrAfter(r.workDate, start))
}
