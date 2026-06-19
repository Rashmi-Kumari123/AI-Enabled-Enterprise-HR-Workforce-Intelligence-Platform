import { createContext } from 'react'
import type { Theme } from '@/lib/theme/storage'
export type { Theme }
export type ThemeContextValue = {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}
export const ThemeContext = createContext<ThemeContextValue | null>(null)
