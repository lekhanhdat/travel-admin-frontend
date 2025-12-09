import api from './api';
import type { Account, PaginatedResponse } from '../types';

export interface UsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface UserFormData {
  userName?: string;
  email: string;
  password?: string;
  fullName: string;
  avatar: string;
  phone: string;
  address: string;
  birthday: string;
  gender: string;
}

export const usersService = {
  getAll: async (params: UsersParams = {}): Promise<PaginatedResponse<Account>> => {
    const response = await api.get('/users', { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<Account> => {
    const response = await api.get('/users/' + id);
    return response.data.data;
  },

  create: async (data: UserFormData): Promise<Account> => {
    const response = await api.post('/users', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<UserFormData>): Promise<Account> => {
    const response = await api.put('/users/' + id, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete('/users/' + id);
  },
};
