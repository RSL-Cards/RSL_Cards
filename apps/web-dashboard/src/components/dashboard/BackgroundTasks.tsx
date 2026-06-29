import { useBatchJobs, BatchJob } from '@/hooks/dashboard/useBatchJobs'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, XCircle, FileImage, FileText } from 'lucide-react'

export default function BackgroundTasks() {
  const { data: response, isLoading } = useBatchJobs()
  const router = useRouter()
  const jobs = response?.data || []

  if (isLoading || jobs.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Background Tasks</h3>
      </div>
      <div className="divide-y divide-gray-100">
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
              className={`flex items-center justify-between px-6 py-4 transition-colors ${isComplete ? 'cursor-pointer hover:bg-blue-50 bg-blue-50/50' : 'bg-white'} ${isFailed ? 'bg-red-50/50' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${isComplete ? 'bg-blue-100 text-blue-600' : isFailed ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                  {job.type === 'image_multi' ? <FileImage className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className={`font-semibold text-sm ${isComplete ? 'text-blue-900' : isFailed ? 'text-red-900' : 'text-gray-900'}`}>
                    {job.type === 'image_multi' ? 'Multi-Card Scan' : 'Batch File Upload'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(job.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                {job.status === 'pending' || job.status === 'processing' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                    Working...
                  </span>
                ) : isComplete ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Review & Save
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
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
