import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DashboardKPI, WeeklyKpiData } from '@/types/analytics';

export function useAnalyticsDashboard() {
  return useQuery<{ data: DashboardKPI }>({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => api.get<{ data: DashboardKPI }>('/analytics/dashboard'),
  });
}

export function useWeeklyKpi() {
  return useQuery<{ data: WeeklyKpiData[] }>({
    queryKey: ['analytics', 'weekly-kpi'],
    queryFn: () => api.get<{ data: WeeklyKpiData[] }>('/analytics/weekly-kpi'),
  });
}
