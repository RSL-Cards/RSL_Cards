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

export function useBatchJobs() {
  return useQuery({
    queryKey: ['batch_jobs'],
    queryFn: async (): Promise<BatchJob[]> => {
      const { data } = await apiClient.get('/batch/jobs')
      return data
    },
    refetchInterval: 5000,
  })
}
