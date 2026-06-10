import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
type BrandLogoProps = {
  className?: string
  showTagline?: boolean
  linkTo?: string
}
export function BrandLogo({ className, showTagline = false, linkTo = '/dashboard' }: BrandLogoProps) {
  const content = (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white shadow-md">
        NH
      </div>
      <div>
        <p className="text-lg font-bold tracking-tight text-foreground">NexusHR</p>
        {showTagline ? (
          <p className="text-xs text-muted-foreground">Empowering Workforce Intelligence</p>
        ) : null}
      </div>
    </div>
  )
  if (linkTo) {
    return (
      <Link to={linkTo} className="no-underline">
        {content}
      </Link>
    )
  }
  return content
}
