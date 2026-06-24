import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { ApiError } from '@/lib/api/http'

const authFieldClass =
  'h-11 rounded-xl border-border/80 bg-input text-foreground placeholder:text-muted-foreground'

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@nexushr.com' },
  { role: 'HR', email: 'hr@nexushr.com' },
  { role: 'Manager', email: 'manager@nexushr.com' },
  { role: 'Employee', email: 'employee@nexushr.com' },
] as const

const DEMO_PASSWORD = 'NexusHR@2026'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login({ email: email.trim(), password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold">Welcome to NexusHR</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Sign in to your company workspace.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            className={authFieldClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@nexushr.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            required
            className={authFieldClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : null}
          Sign in
        </Button>
      </form>

      <div className="mt-8 rounded-xl border border-border/60 bg-muted/20 p-4">
        <p className="text-xs font-medium text-muted-foreground">Demo accounts (password: {DEMO_PASSWORD})</p>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {DEMO_ACCOUNTS.map((account) => (
            <li key={account.email}>
              <span className="font-medium text-foreground">{account.role}:</span>{' '}
              <code className="rounded bg-muted px-1">{account.email}</code>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        HR or Manager self-registration?{' '}
        <Link to="/signup" className="font-semibold text-brand-teal hover:underline">
          Create account
        </Link>
      </p>
    </div>
  )
}
