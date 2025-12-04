import api from './api';
import type { Location, PaginatedResponse } from '../types';

export interface LocationsParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  types?: string;
  hasMarker?: string;
}

export interface LocationFormData {
  name: string;
  types: string;
  description: string;
  long_description: string;
  address: string;
  lat: number;
  long: number;
  phone: string;
  website: string;
  opening_hours: string;
  images: string;
  videos: string;
  advise: string;
  marker: boolean;
}

export const locationsService = {
  getAll: async (params: LocationsParams = {}): Promise<PaginatedResponse<Location>> => {
    const response = await api.get('/locations', { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<Location> => {
    const response = await api.get(`/locations/${id}`);
    return response.data.data;
  },

  create: async (data: LocationFormData): Promise<Location> => {
    const response = await api.post('/locations', data);
    return response.data.data;
  },

  update: async (id: number, data: LocationFormData): Promise<Location> => {
    const response = await api.put(`/locations/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/locations/${id}`);
  },

  toggleMarker: async (id: number, marker: boolean): Promise<void> => {
    await api.patch(`/locations/${id}/marker`, { marker });
  },
};
