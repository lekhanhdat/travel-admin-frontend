import api from './api';
import type { Festival, PaginatedResponse } from '../types';

export interface FestivalsParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  types?: string;
}

export interface FestivalFormData {
  name: string;
  types: string;
  description: string;
  event_time: string;
  location: string;
  price_level: number;
  images: string;
  videos: string;
  advise: string;
}

export const festivalsService = {
  getAll: async (params: FestivalsParams = {}): Promise<PaginatedResponse<Festival>> => {
    const response = await api.get('/festivals', { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<Festival> => {
    const response = await api.get(`/festivals/${id}`);
    return response.data.data;
  },

  getTypes: async (): Promise<string[]> => {
    const response = await api.get('/festivals/types');
    return response.data.data;
  },

  create: async (data: FestivalFormData): Promise<Festival> => {
    const response = await api.post('/festivals', data);
    return response.data.data;
  },

  update: async (id: number, data: FestivalFormData): Promise<Festival> => {
    const response = await api.put(`/festivals/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/festivals/${id}`);
  },
};
