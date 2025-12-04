import api from './api';

export interface DashboardStats {
  locations: number;
  festivals: number;
  accounts: number;
  items: number;
}

export interface ChartData {
  locationTypes: { type: string; count: number }[];
  festivalsByMonth: { month: string; count: number }[];
  userRegistrations: { date: string; count: number }[];
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data.data;
  },

  getCharts: async (): Promise<ChartData> => {
    const response = await api.get('/dashboard/charts');
    return response.data.data;
  },
};
