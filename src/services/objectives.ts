import api from './api';
import type { Item, PaginatedResponse } from '../types';

export interface ObjectivesParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  type?: string;
}

export interface ObjectiveFormData {
  name: string;
  type: string;
  description: string;
  points: number;
  image: string;
}

export const objectivesService = {
  getAll: async (params: ObjectivesParams = {}): Promise<PaginatedResponse<Item>> => {
    const response = await api.get('/objectives', { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<Item> => {
    const response = await api.get(`/objectives/${id}`);
    return response.data.data;
  },

  create: async (data: ObjectiveFormData): Promise<Item> => {
    const response = await api.post('/objectives', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<ObjectiveFormData>): Promise<Item> => {
    const response = await api.put(`/objectives/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/objectives/${id}`);
  },
};
