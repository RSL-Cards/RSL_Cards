import type { ReactNode } from 'react'
import { CtaRow } from './CtaButtons'

export default function ClosingCta({
  title,
  body,
  showLogIn = false,
  children,
}: {
  title: string
  body?: string
  showLogIn?: boolean
  children?: ReactNode
}) {
  return (
    <section className="bg-black py-16 sm:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-4 sm:items-center sm:px-5 sm:text-center lg:px-8">
        <h2 className="display-title text-2xl text-white sm:text-4xl">{title}</h2>
        {body && <p className="text-base text-neutral-300 sm:text-lg">{body}</p>}
        <CtaRow showLogIn={showLogIn} />
        {children}
      </div>
    </section>
  )
}
