import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
type AiInsightBannerProps = {
  message: string
  className?: string
}
export function AiInsightBanner({ message, className }: AiInsightBannerProps) {
  return (
    <div
      className={cn(
        'ai-glow flex items-start gap-3 rounded-2xl border border-brand-teal/20 px-5 py-4',
        className,
      )}
      role="status"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-md">
        <Sparkles className="h-4 w-4" aria-hidden />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-teal">AI Insight</p>
        <p className="mt-0.5 text-sm font-medium leading-relaxed text-foreground">{message}</p>
      </div>
    </div>
  )
}
