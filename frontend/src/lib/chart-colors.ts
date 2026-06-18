/** Brand-aligned palette for Recharts (works on light + dark surfaces). */
export const chartColors = {
  teal: '#0d9488',
  purple: '#7c3aed',
  tealSoft: '#5eead4',
  purpleSoft: '#c4b5fd',
  amber: '#f59e0b',
  rose: '#f43f5e',
  blue: '#3b82f6',
  slate: '#94a3b8',
} as const

export const chartPalette = [
  chartColors.teal,
  chartColors.purple,
  chartColors.blue,
  chartColors.amber,
  chartColors.rose,
  chartColors.tealSoft,
  chartColors.purpleSoft,
  chartColors.slate,
]
