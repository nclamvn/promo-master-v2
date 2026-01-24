import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Budget, BudgetListResponse, CreateBudgetDto, UpdateBudgetDto } from '@/types/budget';

interface BudgetFilters {
  page?: number;
  limit?: number;
  year?: number;
  type?: string;
  search?: string;
}

export function useBudgets(filters: BudgetFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.year) params.set('year', String(filters.year));
  if (filters.type) params.set('type', filters.type);
  if (filters.search) params.set('search', filters.search);

  const queryString = params.toString();
  const path = `/budgets${queryString ? `?${queryString}` : ''}`;

  return useQuery<BudgetListResponse>({
    queryKey: ['budgets', filters],
    queryFn: () => api.get<BudgetListResponse>(path),
  });
}

export function useBudget(id: string | undefined) {
  return useQuery<{ data: Budget }>({
    queryKey: ['budget', id],
    queryFn: () => api.get<{ data: Budget }>(`/budgets/${id}`),
    enabled: !!id,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBudgetDto) => api.post<{ data: Budget }>('/budgets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetDto }) =>
      api.put<{ data: Budget }>(`/budgets/${id}`, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget', variables.id] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ success: boolean }>(`/budgets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
