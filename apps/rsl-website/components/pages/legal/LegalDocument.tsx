type LegalSection = {
  title: string
  body: string[]
}

interface LegalDocumentProps {
  label: string
  title: string
  updated: string
  intro: string
  sections: LegalSection[]
}

export default function LegalDocument({
  label,
  title,
  updated,
  intro,
  sections,
}: LegalDocumentProps) {
  return (
    <section className="px-5 pb-20 pt-32 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="border-b border-line pb-10">
          <div className="text-sm font-black uppercase tracking-[0.22em] text-rslRed">
            {label}
          </div>
          <h1 className="display-title mt-4 text-5xl font-black sm:text-6xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">{intro}</p>
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-muted">
            Last updated: {updated}
          </p>
        </div>

        <div className="mt-10 grid gap-8">
          {sections.map((section) => (
            <article key={section.title} className="border border-line bg-panel p-6">
              <h2 className="text-xl font-black">{section.title}</h2>
              <div className="mt-4 grid gap-4 text-base leading-8 text-neutral-300">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
