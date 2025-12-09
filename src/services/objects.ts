import api from './api';
import type { AIObject, PaginatedResponse } from '../types';

export interface ObjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ObjectFormData {
  title: string;
  content: string;
}

export const objectsService = {
  getAll: async (params: ObjectsParams = {}): Promise<PaginatedResponse<AIObject>> => {
    const response = await api.get('/objects', { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<AIObject> => {
    const response = await api.get(`/objects/${id}`);
    return response.data.data;
  },

  create: async (data: ObjectFormData): Promise<AIObject> => {
    const response = await api.post('/objects', data);
    return response.data.data;
  },

  update: async (id: number, data: ObjectFormData): Promise<AIObject> => {
    const response = await api.put(`/objects/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/objects/${id}`);
  },
};
