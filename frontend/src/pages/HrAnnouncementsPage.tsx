import { Megaphone, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { dispatchNotification } from '@/lib/api/notification-api'

type Audience = 'MANAGERS' | 'USER'
export function HrAnnouncementsPage() {
  const { hasRole } = useAuth()
  const allowed = hasRole('HR') || hasRole('ADMIN')
  const [audience, setAudience] = useState<Audience>('MANAGERS')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  if (!allowed) {
    return (
      <div className="p-10">
        <Card className="surface-panel">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            HR announcements are available to HR and Admin roles.
          </CardContent>
        </Card>
      </div>
    )
  }
  async function handleSend() {
    setError(null)
    setFeedback(null)
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required.')
      return
    }
    if (audience === 'USER' && !recipientEmail.trim()) {
      setError('Recipient email is required for employee announcements.')
      return
    }
    setSending(true)
    try {
      await dispatchNotification({
        audience,
        recipientEmail: audience === 'USER' ? recipientEmail.trim() : undefined,
        title: title.trim(),
        message: message.trim(),
        type: 'SYSTEM',
      })
      setFeedback(
        audience === 'MANAGERS'
          ? 'Announcement sent to managers (in-app + email).'
          : `Announcement sent to ${recipientEmail.trim()} (in-app + email).`,
      )
      setTitle('')
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send announcement')
    } finally {
      setSending(false)
    }
  }
  return (
    <div>
      <DashboardHero
        eyebrow="Communication"
        titleHighlight="HR"
        titleRest="Announcements"
        description="Broadcast in-app and email alerts via notification-service"
      />
      <div className="p-6 md:p-10">
        <Card className="surface-panel max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Megaphone className="h-5 w-5 text-brand-teal" />
              Send announcement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {feedback ? (
              <p className="rounded-xl bg-teal-500/10 px-4 py-3 text-sm text-teal-800 dark:text-teal-300">
                {feedback}
              </p>
            ) : null}
            {error ? (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
            ) : null}

            <div className="space-y-2">
              <Label>Audience</Label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setAudience('MANAGERS')}
                  className={
                    audience === 'MANAGERS'
                      ? 'rounded-full bg-brand-teal px-4 py-2 text-sm font-medium text-white'
                      : 'rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground'
                  }
                >
                  All managers
                </button>
                <button
                  type="button"
                  onClick={() => setAudience('USER')}
                  className={
                    audience === 'USER'
                      ? 'rounded-full bg-brand-purple px-4 py-2 text-sm font-medium text-white'
                      : 'rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground'
                  }
                >
                  One employee
                </button>
              </div>
            </div>

            {audience === 'USER' ? (
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">Employee email</Label>
                <Input
                  id="recipientEmail"
                  className="rounded-xl"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="employee@nexushr.com"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                className="rounded-xl"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Policy update"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                className="min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share company-wide updates, reminders, or HR announcements."
              />
            </div>

            <Button variant="gradient" className="rounded-full" disabled={sending} onClick={handleSend}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
              Send announcement
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
