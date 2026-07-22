import { ENDPOINTS } from '@/config/api'
import { apiClient } from '@/lib/axios'

export interface DailyLog {
  id: string;
  name: string;
  status: 'open' | 'closed';
  userId: string;
  startingCash: string;
  stats?: {
    moneyIn: string;
    moneyOut: string;
    profit: string;
    expenses: string;
  };
  createdAt: string;
}

export const dailyLogService = {
  async getActiveLog(): Promise<DailyLog | null> {
    try {
      const response = await apiClient.get<DailyLog | null>(ENDPOINTS.dailyLogs.active);
      return response.data ?? null;
    } catch (e) {
      return null;
    }
  },

  async createLog(name: string, startingCash: number = 0): Promise<DailyLog> {
    const response = await apiClient.post<DailyLog>(ENDPOINTS.dailyLogs.create, { name, startingCash });
    return response.data;
  },

  async closeLog(id: string): Promise<void> {
    await apiClient.patch(ENDPOINTS.dailyLogs.close(id));
  },

  async addExpense(data: { category: string; amount: number; description?: string; dailyLogId?: string }): Promise<void> {
    await apiClient.post(ENDPOINTS.analytics.expenses, data);
  },

  async updateExpense(id: string, data: { category: string; amount: number; description?: string }): Promise<void> {
    await apiClient.patch(ENDPOINTS.analytics.expense(id), data);
  },

  async deleteExpense(id: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.analytics.expense(id));
  },

  async getLogTransactions(id: string, page: number = 1, limit: number = 20): Promise<any[]> {
    const response = await apiClient.get<any[]>(`${ENDPOINTS.dailyLogs.transactions(id)}?page=${page}&limit=${limit}`);
    return response.data;
  }
};
