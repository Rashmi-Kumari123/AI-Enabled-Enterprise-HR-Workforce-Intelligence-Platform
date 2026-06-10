type SectionHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  centered?: boolean
}
export function SectionHeader({ eyebrow, title, description, centered = false }: SectionHeaderProps) {
  return (
    <div className={centered ? 'text-center' : ''}>
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-teal">{eyebrow}</p>
      ) : null}
      <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">{title}</h2>
      {description ? (
        <p className={`mt-2 max-w-2xl text-sm font-medium leading-relaxed text-foreground/70 ${centered ? 'mx-auto' : ''}`}>
          {description}
        </p>
      ) : null}
    </div>
  )
}
