import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import * as authApi from '@/lib/api/auth-api'
import { ApiError } from '@/lib/api/http'
import { clearMustChangePassword } from '@/lib/auth/storage'
import { setTenantSlug } from '@/lib/tenant/tenant'
export function ChangePasswordPage() {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authApi.changePassword({ currentPassword, newPassword })
      clearMustChangePassword()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update password')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Set your password</h1>
        <p className="text-sm text-muted-foreground">
          Your company HR created your account. Choose a personal password before continuing.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-password">Temporary password</Label>
          <Input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Updating…' : 'Update password'}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-brand-teal hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  )
}
export function CompanyRegisterPage() {
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState('')
  const [slug, setSlug] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await authApi.registerTenant({
        companyName,
        slug: slug.toLowerCase(),
        adminEmail,
        password,
        firstName,
        lastName,
      })
      setTenantSlug(response.tenantSlug ?? slug.toLowerCase())
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Register your company</h1>
        <p className="text-sm text-muted-foreground">
          Create an isolated NexusHR workspace for your organization (e.g. beans.nexushr.com).
        </p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="company-name">Company name</Label>
          <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="company-slug">Workspace slug</Label>
          <Input
            id="company-slug"
            placeholder="beans"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            required
          />
          <p className="text-xs text-muted-foreground">Login URL: {slug || 'your-company'}.nexushr.com</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-first">First name</Label>
          <Input id="admin-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-last">Last name</Label>
          <Input id="admin-last" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="admin-email">Admin email</Label>
          <Input
            id="admin-email"
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="admin-password">Password</Label>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400 sm:col-span-2">{error}</p>
        ) : null}
        <Button type="submit" className="sm:col-span-2" disabled={loading}>
          {loading ? 'Creating workspace…' : 'Create company workspace'}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already have a workspace?{' '}
        <Link to="/login" className="font-medium text-brand-teal hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
