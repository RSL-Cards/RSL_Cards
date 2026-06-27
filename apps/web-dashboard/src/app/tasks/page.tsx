'use client'

import React from 'react'
import Shell from '@/components/layout/Shell'
import { useBatchJobs } from '@/hooks/dashboard/useBatchJobs'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, XCircle, FileImage, FileText, Search } from 'lucide-react'

export default function TasksPage() {
  const { data: jobs, isLoading } = useBatchJobs()
  const router = useRouter()

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Background Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor the status of your bulk AI scans and CSV uploads.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Clock className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : !jobs || jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No active tasks</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              Any bulk scans or uploads you process will appear here while Vertex AI extracts the data and fetches comps.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
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
                    className={`flex items-center justify-between px-6 py-5 transition-colors ${isComplete ? 'cursor-pointer hover:bg-blue-50 bg-blue-50/20' : 'bg-white'} ${isFailed ? 'bg-red-50/20' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${isComplete ? 'bg-blue-100 text-blue-600' : isFailed ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                        {job.type === 'image_multi' ? <FileImage className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className={`font-bold text-base ${isComplete ? 'text-blue-900' : isFailed ? 'text-red-900' : 'text-gray-900'}`}>
                          {job.type === 'image_multi' ? 'Multi-Card Scan' : 'Batch File Upload'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-500">
                            {new Date(job.createdAt).toLocaleString()}
                          </p>
                          <span className="text-gray-300">•</span>
                          <p className="text-sm text-gray-400 font-mono">
                            ID: {job.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {job.status === 'pending' || job.status === 'processing' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                          <Clock className="w-4 h-4 animate-pulse" />
                          Working...
                        </span>
                      ) : isComplete ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition">
                          <CheckCircle2 className="w-4 h-4" />
                          Review & Save
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700">
                          <XCircle className="w-4 h-4" />
                          Failed
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Shell>
  )
}
