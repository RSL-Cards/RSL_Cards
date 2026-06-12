import StoreButtons from '@/components/shared/StoreButtons'

export default function DownloadSection() {
  return (
    <section className="surface-grid px-5 py-20 lg:px-8" id="download">
      <div className="mx-auto max-w-5xl border border-rslRed/40 bg-rslRed p-8 text-center shadow-red md:p-12">
        <h2 className="display-title text-3xl leading-tight md:text-5xl">
          Start running your card business like a business.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-xl font-bold">
          Download RSL Cards Pro free. Start at your next show.
        </p>
        <div className="mt-8 flex justify-center">
          <StoreButtons />
        </div>
        <p className="mt-6 font-bold">
          Or try the web dashboard: <a className="underline" href="https://dashboard.rslcards.com">dashboard.rslcards.com</a>
        </p>
        <form className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="Email for launch updates"
            className="min-h-14 flex-1 border border-white/30 bg-black/20 px-4 font-bold text-white placeholder:text-red-100 outline-none"
          />
          <button className="min-h-14 bg-white px-6 font-black text-ink" type="submit">
            Notify Me
          </button>
        </form>
      </div>
    </section>
  )
}
