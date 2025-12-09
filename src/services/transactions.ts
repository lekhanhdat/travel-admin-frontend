import api from './api';
import type { Transaction, TransactionStats, PaginatedResponse } from '../types';

export interface TransactionsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const transactionsService = {
  getAll: async (params: TransactionsParams = {}): Promise<PaginatedResponse<Transaction>> => {
    const response = await api.get('/transactions', { params });
    return response.data.data;
  },

  getStats: async (): Promise<TransactionStats> => {
    const response = await api.get('/transactions/stats');
    return response.data.data;
  },
};
