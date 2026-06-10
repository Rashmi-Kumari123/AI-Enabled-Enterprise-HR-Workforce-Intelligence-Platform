import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
export function SplashPage() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 12, 100))
    }, 180)
    const timeout = setTimeout(() => navigate('/login', { replace: true }), 2400)
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [navigate])

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-brand px-6">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-white/40"
            style={{ left: `${(i * 17) % 90 + 5}%`, top: `${(i * 23) % 85 + 5}%` }}
          />
        ))}
      </div>
        <div className="relative z-10 flex flex-col items-center text-center text-white">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/40 bg-white/20 text-3xl font-bold shadow-2xl backdrop-blur-sm">
          NH
        </div>
        <p className="text-3xl font-bold tracking-tight">NexusHR</p>
        <p className="text-xs text-white/80">Workforce Intelligence</p>
        <p className="mt-3 text-sm text-white/85">Empowering Workforce Intelligence</p>
        <div className="mt-12 h-1 w-48 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <Loader2 className="mt-6 h-6 w-6 animate-spin text-white/70" aria-label="Loading" />
      </div>
    </div>
  )
}
