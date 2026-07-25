import { useBatchJobs, BatchJob } from '@/hooks/dashboard/useBatchJobs'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, XCircle, FileImage, FileText } from 'lucide-react'

export default function BackgroundTasks() {
  const { data: response, isLoading } = useBatchJobs()
  const router = useRouter()
  const jobs = response?.data || []

  if (isLoading || jobs.length === 0) return null

  return (
    <div className="bg-[#0D0D0D] rounded-2xl shadow-sm border border-[#252525] overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-[#252525] bg-[#141414] flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Background Tasks</h3>
      </div>
      <div className="divide-y divide-[#252525]">
        {jobs.map((job) => {
          const isComplete = job.status === 'completed'
          const isFailed = job.status === 'failed'
          
          return (
            <div 
              key={job.id}
              onClick={() => {
                if (isComplete) {
                  router.push(`/inventory/add?batchId=${job.id}`)
                }
              }}
              className={`flex items-center justify-between px-6 py-4 transition-colors ${isComplete ? 'cursor-pointer hover:bg-[#1A1A1A] bg-blue-500/10' : 'bg-[#0D0D0D]'} ${isFailed ? 'bg-red-500/10' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${isComplete ? 'bg-blue-500/20 text-blue-400' : isFailed ? 'bg-red-500/20 text-red-400' : 'bg-[#141414] text-zinc-400'}`}>
                  {job.type === 'image_multi' ? <FileImage className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className={`font-semibold text-sm ${isComplete ? 'text-blue-400' : isFailed ? 'text-red-400' : 'text-white'}`}>
                    {job.type === 'image_multi' ? 'Multi-Card Scan' : 'Batch File Upload'}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {new Date(job.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                {job.status === 'pending' || job.status === 'processing' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                    Working...
                  </span>
                ) : isComplete ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#E8001C] text-white shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Review & Save
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30">
                    <XCircle className="w-3.5 h-3.5" />
                    Failed
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
