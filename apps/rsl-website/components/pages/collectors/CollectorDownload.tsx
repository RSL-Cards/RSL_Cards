import { Star } from 'lucide-react'
import StoreButtons from '@/components/shared/StoreButtons'

export default function CollectorDownload() {
  return (
    <section className="surface-grid px-5 py-20 lg:px-8" id="download">
      <div className="mx-auto max-w-5xl border border-rslRed/40 bg-rslRed p-8 text-center shadow-red md:p-12">
        <Star className="mx-auto h-10 w-10" />
        <h2 className="display-title mt-5 text-3xl leading-tight md:text-5xl">
          RSL Cards is free for collectors.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-xl font-bold">
          Download now and bring real comps, collection tracking, AI context, and card show discovery to every buy.
        </p>
        <div className="mt-8 flex justify-center">
          <StoreButtons />
        </div>
      </div>
    </section>
  )
}
