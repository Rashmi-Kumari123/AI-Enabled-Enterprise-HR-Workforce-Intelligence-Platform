import { CheckCircle2, FileText, Globe, Loader2, Mail, Phone, Shield, User, Wifi, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNotifications } from '@/hooks/use-notifications'
import { useEmployeeProfile } from '@/hooks/use-employee-profile'
import { cn } from '@/lib/utils'

const NOTIFICATION_PREFS_KEY = 'nexushr-notification-prefs'
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

type NotificationPrefs = {
  email: boolean
  push: boolean
  weeklyDigest: boolean
}

const defaultPrefs: NotificationPrefs = {
  email: true,
  push: true,
  weeklyDigest: true,
}

function loadPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFS_KEY)
    return raw ? { ...defaultPrefs, ...JSON.parse(raw) } : defaultPrefs
  } catch {
    return defaultPrefs
  }
}

function initials(first?: string, last?: string): string {
  const a = first?.trim().charAt(0) ?? ''
  const b = last?.trim().charAt(0) ?? ''
  return (a + b).toUpperCase() || '?'
}

function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDocType(type: string): string {
  return type.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

export function ProfileSettingsPage() {
  const { account, profile, onboarding, documents, isLoading, profileMissing, profileError, profileLinked, roles, updatePhone, uploadDocument, isSaving,
    isUploading, saveError, uploadError, refetch } = useEmployeeProfile();
  const { connected, unreadCount, notifications } = useNotifications()
  const [phoneDraft, setPhoneDraft] = useState<string | null>(null)
  const [prefs, setPrefs] = useState<NotificationPrefs>(loadPrefs)
  const [saved, setSaved] = useState(false)
  const [uploadValidationError, setUploadValidationError] = useState<string | null>(null)
  const phone = phoneDraft ?? profile?.phone ?? ''

  useEffect(() => {
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs))
  }, [prefs])

  async function handleSaveProfile() {
    setSaved(false)
    await updatePhone(phone.trim())
    setPhoneDraft(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }
  async function handleUpload(file: File) {
    if (!profile) return
    setUploadValidationError(null)
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadValidationError('File is too large. Maximum size is 10 MB.')
      return
    }
    await uploadDocument({ file, documentType: 'IDENTITY' })
  }
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-teal" />
      </div>
    )
  }
  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : account?.email?.split('@')[0] ?? 'User'

  return (
    <div>
      <DashboardHero
        eyebrow="My account"
        titleHighlight={displayName.split(' ')[0]}
        titleRest={displayName.split(' ').slice(1).join(' ') || 'Profile'}
        description={
          profile
            ? `${profile.employeeCode} · ${profile.departmentName ?? 'Unassigned'} · ${roles}`
            : 'Manage your login, contact details, and preferences'
        }
        onRefresh={refetch}
      />
      <div className="space-y-8 p-6 md:p-10">
        {profileMissing ? (
          <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            No employee record is linked to <strong>{account?.email}</strong>. Sign up creates a profile automatically;
            otherwise ask HR to complete onboarding from Lifecycle.
          </p>
        ) : profileError ? (
          <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">{profileError}</p>
        ) : profile && account && !profileLinked ? (
          <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            Profile data may be out of sync with your login. Sign out and sign in again with{' '}
            <strong>{account.email}</strong> (demo: hr@nexushr.com / NexusHR@2026).
          </p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="surface-panel border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-brand-teal" />
                Work profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-xl font-bold text-white">
                      {initials(profile.firstName, profile.lastName)}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {profile.firstName} {profile.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {profile.employeeCode} · {profile.departmentName ?? 'No department'}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <StatusBadge status={profile.employmentStatus} />
                        {onboarding?.onboardingCompleted ? (
                          <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-xs font-medium text-brand-teal">
                            Onboarded
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                            Onboarding in progress
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-xl bg-muted/30 p-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hire date</p>
                      <p className="font-medium">{formatDate(profile.hireDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Employee ID</p>
                      <p className="font-medium">{profile.id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Work email</p>
                      <p className="font-medium break-all">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last updated</p>
                      <p className="font-medium">{formatDate(profile.updatedAt)}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="phone">Mobile number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhoneDraft(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">Used for payroll and HR contact — you can update this yourself.</p>
                  </div>

                  {saveError ? <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p> : null}
                  {saved ? (
                    <p className="flex items-center gap-2 text-sm text-brand-teal">
                      <CheckCircle2 className="h-4 w-4" />
                      Contact number saved
                    </p>
                  ) : null}

                  <Button
                    variant="gradient"
                    className="rounded-full"
                    disabled={isSaving}
                    onClick={handleSaveProfile}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save contact number
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Employee profile unavailable. Your login and preferences below still apply.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="surface-panel border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-brand-purple" />
                Login & access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                {
                  icon: Mail,
                  label: 'Sign-in email',
                  desc: account?.email ?? '—',
                },
                {
                  icon: Shield,
                  label: 'Application roles',
                  desc: roles,
                },
                {
                  icon: Shield,
                  label: 'Account ID',
                  desc: account?.id != null ? String(account.id) : '—',
                },
                {
                  icon: connected ? Wifi : WifiOff,
                  label: 'In-app notifications',
                  desc: connected
                    ? `Live updates · ${unreadCount} unread`
                    : `Inbox active · ${unreadCount} unread (live push reconnecting)`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex w-full items-center gap-3 rounded-xl bg-muted/30 px-4 py-3 text-left"
                >
                  <item.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="surface-panel border-0 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Onboarding checklist & my documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {!profile ? (
                <p className="text-muted-foreground">Link an employee profile to manage onboarding items.</p>
              ) : (
                <>
                  {!onboarding?.tasks.length ? (
                    <p className="text-muted-foreground">Onboarding tasks will appear here after HR starts your record.</p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {onboarding.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            'flex items-center justify-between rounded-lg px-3 py-2',
                            task.completed ? 'bg-teal-500/10' : 'bg-muted/40',
                          )}
                        >
                          <span>{task.title}</span>
                          <span
                            className={cn(
                              'text-xs font-medium',
                              task.completed ? 'text-brand-teal' : 'text-muted-foreground',
                            )}
                          >
                            {task.completed ? 'Done' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-border/60 pt-4">
                    <p className="mb-1 font-medium">Your uploaded files</p>
                    <p className="mb-3 text-xs text-muted-foreground">
                      Only documents attached to your employee record are shown here.
                    </p>
                    {documents.length === 0 ? (
                      <p className="text-muted-foreground">No documents yet — upload ID or tax proof (PDF, JPG, PNG).</p>
                    ) : (
                      <ul className="space-y-2">
                        {documents.map((doc) => (
                          <li
                            key={doc.id}
                            className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-muted-foreground"
                          >
                            <span className="truncate pr-2">{doc.originalFileName}</span>
                            <span className="shrink-0 text-xs">
                              {formatDocType(doc.documentType)} · {(doc.fileSize / 1024).toFixed(0)} KB
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {uploadValidationError || uploadError ? (
                      <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                        {uploadValidationError ??
                          (uploadError?.includes('413') ? 'File too large — maximum 10 MB.' : uploadError)}
                      </p>
                    ) : null}
                    <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-medium hover:bg-muted/40">
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                      {isUploading ? 'Uploading…' : 'Upload identity document'}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        disabled={!profile || isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) void handleUpload(file)
                          e.target.value = ''
                        }}
                      />
                    </label>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="surface-panel border-0">
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeToggle />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="surface-panel border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4" />
                Recent alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {notifications.length === 0 ? (
                <p>No notifications yet — leave updates and HR announcements appear here.</p>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="rounded-lg bg-muted/30 px-3 py-2">
                    <p className="font-medium text-foreground">{n.title}</p>
                    <p className="truncate text-xs">{n.message}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="surface-panel border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Phone className="h-4 w-4" />
                Notification preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {(
                [
                  ['email', 'Email notifications'],
                  ['push', 'In-app push (WebSocket)'],
                  ['weeklyDigest', 'Weekly digest'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 rounded-xl bg-muted/30 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={prefs[key]}
                    onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                    className="rounded border-border"
                  />
                  {label}
                </label>
              ))}
              <p className="text-xs text-muted-foreground">
                Preferences are stored on this device. Server-side delivery uses email and in-app channels.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
