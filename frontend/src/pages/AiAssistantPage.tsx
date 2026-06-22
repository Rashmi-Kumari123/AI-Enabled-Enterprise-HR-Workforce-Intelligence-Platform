import { Bot, Loader2, Send, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { useEmployeeProfile } from '@/hooks/use-employee-profile'
import { answerWorkforceQuestion, suggestedPrompts, type AssistantContext } from '@/lib/ai/workforce-assistant'
import { cn } from '@/lib/utils'
type Message = { role: 'user' | 'assistant'; content: string }
const initialMessages: Message[] = [
  {
    role: 'assistant',
    content:
      'Hello! I\'m Nexus AI. I pull live answers from your HR data — attendance, leave, payroll, and (for HR/Managers) workforce intelligence. Try a suggested prompt below or ask your own question.',
  },
]
export function AiAssistantPage() {
  const { hasRole } = useAuth()
  const { profile, profileLinked } = useEmployeeProfile()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const ctx: AssistantContext = useMemo(
    () => ({
      employeeId: profileLinked && profile ? profile.id : null,
      employeeName: profile ? `${profile.firstName} ${profile.lastName}` : null,
      isHrOrAdmin: hasRole('HR') || hasRole('ADMIN'),
      isManager: hasRole('MANAGER'),
      canViewTeamInsights: hasRole('HR') || hasRole('ADMIN') || hasRole('MANAGER'),
    }),
    [hasRole, profile, profileLinked],
  )
  const examples = useMemo(() => suggestedPrompts(ctx), [ctx])
  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isThinking) return
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setInput('')
    setIsThinking(true)
    try {
      const reply = await answerWorkforceQuestion(trimmed, ctx)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } finally {
      setIsThinking(false)
    }
  }
  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col">
      <DashboardHero
        eyebrow="AI Assistant"
        titleHighlight="Nexus"
        titleRest="AI Assistant"
        description="Ask workforce questions — answers come from live NexusHR services, not canned text"
      />
      <div className="flex flex-1 flex-col p-4 md:p-6 lg:mx-auto lg:w-full lg:max-w-4xl">
        {!ctx.canViewTeamInsights ? (
          <p className="mb-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Signed in as Employee — personal attendance, leave, and payslip questions work here. For team
            attrition and analytics, use an HR or Manager account, or open{' '}
            <Link to="/dashboard/intelligence" className="font-medium text-brand-teal hover:underline">
              Workforce Intelligence
            </Link>{' '}
            when permitted.
          </p>
        ) : null}
        <div className="mb-4 flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              disabled={isThinking}
              onClick={() => void sendMessage(example)}
              className="rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-brand-teal/40 hover:text-foreground disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>

        <div className="surface-panel flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.role === 'assistant' ? (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                ) : null}
                <div
                  className={cn(
                    'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-gradient-brand text-white'
                      : 'bg-muted/50 text-foreground',
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isThinking ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Fetching live workforce data…
              </div>
            ) : null}
          </div>

          <div className="border-t border-border/60 p-4">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                void sendMessage(input)
              }}
            >
              <div className="relative flex-1">
                <Bot className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Ask Nexus AI anything about your workforce…"
                  className="h-11 rounded-xl pl-10"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isThinking}
                />
              </div>
              <Button
                type="submit"
                variant="gradient"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-xl"
                disabled={isThinking || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
