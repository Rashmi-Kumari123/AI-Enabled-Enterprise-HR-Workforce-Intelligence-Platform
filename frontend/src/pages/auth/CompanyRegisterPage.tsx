import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { ApiError } from '@/lib/api/http'
import { setTenantSlug } from '@/lib/tenant/tenant'

const authFieldClass =
  'h-11 rounded-xl border-border/80 bg-input text-foreground placeholder:text-muted-foreground'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
}

function isValidSlug(value: string): boolean {
  return /^[a-z0-9]([a-z0-9-]{0,30}[a-z0-9])?$/.test(value)
}

export function CompanyRegisterPage() {
  const { registerCompany } = useAuth()
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleCompanyNameChange(value: string) {
    setCompanyName(value)
    if (!slugTouched) {
      setSlug(slugify(value))
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const tenantSlug = slug.trim().toLowerCase()
      if (!isValidSlug(tenantSlug)) {
        setError('Company slug must use lowercase letters, numbers, and hyphens only.')
        setIsSubmitting(false)
        return
      }
      await registerCompany({
        companyName: companyName.trim(),
        slug: tenantSlug,
        adminEmail: adminEmail.trim().toLowerCase(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      })
      setTenantSlug(tenantSlug)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold">Register your company</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Create a new NexusHR workspace. You will be the Super Admin.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="company-name">Company name</Label>
          <Input
            id="company-name"
            required
            className={authFieldClass}
            value={companyName}
            onChange={(e) => handleCompanyNameChange(e.target.value)}
            placeholder="Acme Corp"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-slug">Company slug</Label>
          <Input
            id="company-slug"
            required
            minLength={2}
            maxLength={32}
            className={authFieldClass}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(e.target.value.toLowerCase())
            }}
            placeholder="acme"
          />
          <p className="text-xs text-muted-foreground">
            Used at login to identify your organization (e.g. slug: acme).
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first-name">First name</Label>
            <Input
              id="first-name"
              required
              className={authFieldClass}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last name</Label>
            <Input
              id="last-name"
              required
              className={authFieldClass}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-email">Work email</Label>
          <Input
            id="admin-email"
            type="email"
            autoComplete="email"
            required
            className={authFieldClass}
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="you@acme.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            required
            minLength={8}
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
          Create company
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have a workspace?{' '}
        <Link to="/login" className="font-semibold text-brand-teal hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
