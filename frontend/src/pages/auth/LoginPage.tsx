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
      <h2 className="text-2xl font-bold">Welcome Back to NexusHR</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage people, performance, and productivity from one platform.
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
            placeholder="you@company.com"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button type="button" className="text-xs font-medium text-brand-teal hover:underline">
              Forgot password?
            </button>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            required
            className={authFieldClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" className="rounded border-border" defaultChecked />
          Remember me
        </label>
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

      <div className="mt-6 space-y-3">
        <p className="text-center text-xs text-muted-foreground">Or continue with</p>
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" className="rounded-xl bg-white dark:bg-card">
            Google
          </Button>
          <Button type="button" variant="outline" className="rounded-xl bg-white dark:bg-card">
            Microsoft
          </Button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to NexusHR?{' '}
        <Link to="/signup" className="font-semibold text-brand-teal hover:underline">
          Create account
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Demo: <code className="rounded bg-muted px-1">hr@nexushr.com</code> ·{' '}
        <code className="rounded bg-muted px-1">manager@nexushr.com</code> ·{' '}
        <code className="rounded bg-muted px-1">employee@nexushr.com</code>
        <br />
        Password: <code className="rounded bg-muted px-1">NexusHR@2026</code>
      </p>
    </div>
  )
}
