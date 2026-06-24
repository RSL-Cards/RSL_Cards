import StoreButtons from '@/components/shared/StoreButtons'

export default function FeaturesDownload() {
  return (
    <section className="surface-grid px-5 py-20 lg:px-8" id="download">
      <div className="mx-auto max-w-5xl border border-rslRed/40 bg-rslRed p-8 text-center shadow-red md:p-12">
        <h2 className="display-title text-3xl leading-tight md:text-5xl">
          Compare the features, then start free.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-xl font-bold">
          Download RSL Cards Pro for dealers and manage inventory from the web dashboard.
        </p>
        <div className="mt-8 flex justify-center">
          <StoreButtons />
        </div>
      </div>
    </section>
  )
}
