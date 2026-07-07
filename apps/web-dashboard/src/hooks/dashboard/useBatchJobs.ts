import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

export interface BatchJob {
  id: string
  userId: string
  type: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string | null
  createdAt: string
}

export interface BatchJobResponse {
  data: BatchJob[]
  total: number
}

interface UseBatchJobsParams {
  page?: number
  limit?: number
  fromDate?: string
  toDate?: string
}

export function useBatchJobs({ page = 1, limit = 10, fromDate, toDate }: UseBatchJobsParams = {}) {
  return useQuery({
    queryKey: ['batch_jobs', page, limit, fromDate, toDate],
    queryFn: async (): Promise<BatchJobResponse> => {
      const { data } = await apiClient.get('/batch/jobs', {
        params: { page, limit, fromDate, toDate }
      })
      return data
    },
    refetchInterval: 5000,
  })
}
