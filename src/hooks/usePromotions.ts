import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Promotion, PromotionListResponse, CreatePromotionDto, UpdatePromotionDto, CalendarPromotion } from '@/types/promotion';

interface PromotionFilters {
  page?: number;
  limit?: number;
  status?: string;
  customerId?: string;
  search?: string;
}

export function usePromotions(filters: PromotionFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.status) params.set('status', filters.status);
  if (filters.customerId) params.set('customerId', filters.customerId);
  if (filters.search) params.set('search', filters.search);

  const queryString = params.toString();
  const path = `/promotions${queryString ? `?${queryString}` : ''}`;

  return useQuery<PromotionListResponse>({
    queryKey: ['promotions', filters],
    queryFn: () => api.get<PromotionListResponse>(path),
  });
}

export function usePromotion(id: string | undefined) {
  return useQuery<{ data: Promotion }>({
    queryKey: ['promotion', id],
    queryFn: () => api.get<{ data: Promotion }>(`/promotions/${id}`),
    enabled: !!id,
  });
}

export function useCalendarPromotions(year?: number, month?: number) {
  const params = new URLSearchParams();
  if (year) params.set('year', String(year));
  if (month) params.set('month', String(month));

  const queryString = params.toString();
  const path = `/promotions/calendar${queryString ? `?${queryString}` : ''}`;

  return useQuery<{ data: CalendarPromotion[] }>({
    queryKey: ['calendar', year, month],
    queryFn: () => api.get<{ data: CalendarPromotion[] }>(path),
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePromotionDto) => api.post<{ data: Promotion }>('/promotions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromotionDto }) =>
      api.put<{ data: Promotion }>(`/promotions/${id}`, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({ queryKey: ['promotion', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}

export function useDeletePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ success: boolean }>(`/promotions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}
