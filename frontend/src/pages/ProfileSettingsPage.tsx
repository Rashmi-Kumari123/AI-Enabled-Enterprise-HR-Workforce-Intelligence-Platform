import { FileText, Globe, Lock, Mail, Phone, Shield, User } from 'lucide-react'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
export function ProfileSettingsPage() {
  const { user } = useAuth()
  return (
    <div>
      <DashboardHero
        eyebrow="Account"
        titleHighlight="Profile &"
        titleRest="Settings"
        description="Manage your profile, security, notifications, and appearance preferences"
      />
      <div className="space-y-8 p-6 md:p-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="surface-panel border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-brand-teal" />
                Employee Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-xl font-bold text-white">
                  RK
                </div>
                <div>
                  <p className="font-semibold">Rashmi Kumari</p>
                  <p className="text-sm text-muted-foreground">Senior Software Engineer · Engineering</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={user?.email ?? 'rashmi@company.com'} className="rounded-xl" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue="+91 98765 43210" className="rounded-xl" />
                </div>
              </div>
              <Button variant="gradient" className="rounded-full">Save Profile</Button>
            </CardContent>
          </Card>

          <Card className="surface-panel border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-brand-purple" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { icon: Lock, label: 'Change password', desc: 'Last updated 30 days ago' },
                { icon: Shield, label: 'Two-factor authentication', desc: 'Enabled via authenticator app' },
                { icon: Mail, label: 'Login alerts', desc: 'Email on new device sign-in' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                >
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="surface-panel border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Offer Letter.pdf</p>
              <p>ID Verification.pdf</p>
              <p>Tax Declaration FY26.pdf</p>
            </CardContent>
          </Card>

          <Card className="surface-panel border-0">
            <CardHeader>
              <CardTitle className="text-base">Theme Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeToggle />
            </CardContent>
          </Card>

          <Card className="surface-panel border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4" />
                Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                <option>English (US)</option>
                <option>English (IN)</option>
                <option>Hindi</option>
              </select>
            </CardContent>
          </Card>
        </div>

        <Card className="surface-panel border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {['Email notifications', 'Push alerts', 'SMS for payroll', 'Weekly digest'].map((pref) => (
              <label key={pref} className="flex items-center gap-3 rounded-xl bg-muted/30 px-4 py-3 text-sm">
                <input type="checkbox" defaultChecked className="rounded border-border" />
                {pref}
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
