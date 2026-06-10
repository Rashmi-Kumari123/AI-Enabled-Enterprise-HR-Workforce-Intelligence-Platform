import { Bot, Send, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mockChatExamples } from '@/data/mock-ui-data'
import { cn } from '@/lib/utils'

type Message = { role: 'user' | 'assistant'; content: string }

const initialMessages: Message[] = [
  {
    role: 'assistant',
    content:
      'Hello! I\'m Nexus AI — your workforce intelligence assistant. Ask me about attrition risk, attendance trends, training recommendations, or HR insights.',
  },
]
export function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  function sendMessage(text: string) {
    if (!text.trim()) return
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text },
      {
        role: 'assistant',
        content: `Analyzing "${text}"… Based on current workforce data, I recommend reviewing department-level trends and scheduling a follow-up with HR leadership.`,
      },
    ])
    setInput('')
  }
  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col">
      <DashboardHero
        eyebrow="AI Assistant"
        titleHighlight="Nexus"
        titleRest="AI Assistant"
        description="Enterprise ChatGPT-style interface for workforce questions and predictive analytics"
      />
      <div className="flex flex-1 flex-col p-4 md:p-6 lg:mx-auto lg:w-full lg:max-w-4xl">
        <div className="mb-4 flex flex-wrap gap-2">
          {mockChatExamples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => sendMessage(example)}
              className="rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-brand-teal/40 hover:text-foreground"
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
                    'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-gradient-brand text-white'
                      : 'bg-muted/50 text-foreground',
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border/60 p-4">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage(input)
              }}
            >
              <div className="relative flex-1">
                <Bot className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Ask Nexus AI anything about your workforce…"
                  className="h-11 rounded-xl pl-10"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
              <Button type="submit" variant="gradient" size="icon" className="h-11 w-11 shrink-0 rounded-xl">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
