import { Section, SectionHeading } from './Section'
import Screenshot from './Screenshot'
import { ASK_RSL_SCREENSHOT } from './site'

// The two confirmed Ask RSL examples. Answers come from a real product screenshot,
// not written copy, so we never promise coverage the assistant does not have.
export const ASK_RSL_EXAMPLES = ['How many cards do I have?', 'What was my profit for this show?']

export default function AskRslSection({
  title = 'Ask a question. Get to your numbers.',
  body = 'Ask RSL questions about your business from either the mobile app or web dashboard.',
}: {
  title?: string
  body?: string
}) {
  return (
    <Section>
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Ask RSL" title={title}>
            <p>{body}</p>
          </SectionHeading>
          <ul className="mt-8 space-y-3">
            {ASK_RSL_EXAMPLES.map((q) => (
              <li
                key={q}
                className="w-fit max-w-full border border-white/15 bg-panel px-4 py-3 text-sm font-semibold text-white sm:text-base"
              >
                &ldquo;{q}&rdquo;
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center">
          <Screenshot file="ask-rsl.png" src={ASK_RSL_SCREENSHOT} alt="Ask RSL answering a sample question" device="phone" />
        </div>
      </div>
    </Section>
  )
}
