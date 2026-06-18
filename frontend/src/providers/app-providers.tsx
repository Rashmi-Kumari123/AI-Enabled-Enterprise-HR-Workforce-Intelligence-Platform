import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/auth-context'
import { NotificationProvider } from '@/contexts/notification-context'
import { ThemeProvider } from '@/contexts/theme-context'
import { QueryProvider } from '@/providers/query-provider'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryProvider>
  )
}
