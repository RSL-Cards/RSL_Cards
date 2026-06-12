import StoreButtons from '@/components/shared/StoreButtons'

export default function DealerDownload() {
  return (
    <section className="surface-grid px-5 py-20 lg:px-8" id="download">
      <div className="mx-auto max-w-5xl border border-rslRed/40 bg-rslRed p-8 text-center shadow-red md:p-12">
        <h2 className="display-title text-3xl leading-tight md:text-5xl">
          Start your next show with a system.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-xl font-bold">
          Download RSL Cards Pro free and run the table with comps, inventory, payment notes, and
          profit tracking in one place.
        </p>
        <div className="mt-8 flex justify-center">
          <StoreButtons />
        </div>
        <p className="mt-6 font-bold">
          Or try the web dashboard:{' '}
          <a className="underline" href="https://dashboard.rslcards.com">
            dashboard.rslcards.com
          </a>
        </p>
      </div>
    </section>
  )
}
