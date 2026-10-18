import type { ReactNode } from 'react'

export function Section({
  id,
  className = '',
  children,
}: {
  id?: string
  className?: string
  children: ReactNode
}) {
  return (
    <section id={id} className={`border-b border-line py-16 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">{children}</div>
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  as: Tag = 'h2',
  className = '',
}: {
  eyebrow?: string
  title: string
  children?: ReactNode
  as?: 'h1' | 'h2' | 'h3'
  className?: string
}) {
  const size =
    Tag === 'h1' ? 'text-3xl sm:text-5xl md:text-6xl leading-[1.1]' : 'text-2xl sm:text-4xl leading-tight'
  return (
    <div className={`max-w-3xl ${className}`}>
      {eyebrow && (
        <div className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-rslRed">{eyebrow}</div>
      )}
      <Tag className={`display-title text-white ${size}`}>{title}</Tag>
      {children && (
        <div className="mt-4 space-y-4 text-base leading-relaxed text-neutral-300 sm:mt-5 sm:text-lg">
          {children}
        </div>
      )}
    </div>
  )
}
