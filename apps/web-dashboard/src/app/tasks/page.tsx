'use client'

import React, { useState } from 'react'
import Shell from '@/components/layout/Shell'
import { useBatchJobs } from '@/hooks/dashboard/useBatchJobs'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Clock, XCircle, FileImage, FileText, Search, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

export default function TasksPageWrapper() {
  return (
    <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <TasksPage />
    </React.Suspense>
  )
}

function TasksPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialToast = searchParams.get('toast')
  const [toastMsg, setToastMsg] = useState(initialToast || '')

  React.useEffect(() => {
    if (initialToast) {
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
      setTimeout(() => setToastMsg(''), 5000)
    }
  }, [initialToast])
  
  const today = new Date().toISOString().split('T')[0]
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [page, setPage] = useState(1)
  const limit = 10

  const { data: response, isLoading } = useBatchJobs({ page, limit, fromDate, toDate })
  const jobs = response?.data || []
  const total = response?.total || 0
  const totalPages = Math.ceil(total / limit)

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-6">
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-[100] w-96 max-w-[calc(100vw-3rem)] transform rounded-2xl border border-green-200 bg-white p-4 shadow-xl flex items-center gap-3 transition-all duration-300 ease-out animate-bounce-short">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-900">Task Started</div>
              <p className="text-xs text-gray-500 mt-0.5">{toastMsg}</p>
            </div>
            <button 
              onClick={() => setToastMsg('')}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Background Tasks</h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor the status of your bulk RSL scans and CSV uploads.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 px-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input 
                type="date" 
                value={fromDate} 
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="text-sm border-none focus:ring-0 text-gray-700 bg-transparent p-0"
              />
            </div>
            <span className="text-gray-300">to</span>
            <div className="flex items-center gap-2 px-2">
              <input 
                type="date" 
                value={toDate} 
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="text-sm border-none focus:ring-0 text-gray-700 bg-transparent p-0"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Clock className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No tasks found</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              There are no tasks matching the selected date range.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
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
                            {job.type === 'image_multi' ? 'RSL Image Scan' : 'Batch File Upload'}
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm sm:px-6">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                      <span className="font-medium">{total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Shell>
  )
}
