/**
 * Budget React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Budget, CreateBudgetInput, UpdateBudgetInput } from '@/types';

export const budgetKeys = {
  all: ['budgets'] as const,
  lists: () => [...budgetKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...budgetKeys.lists(), filters] as const,
  details: () => [...budgetKeys.all, 'detail'] as const,
  detail: (id: string) => [...budgetKeys.details(), id] as const,
};

interface ListParams {
  page?: number;
  pageSize?: number;
  year?: number;
  status?: string;
  category?: string;
  search?: string;
}

export function useBudgets(params: ListParams = {}) {
  return useQuery({
    queryKey: budgetKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/budgets', { params });
      return response.data;
    },
    select: (response) => ({
      budgets: response.data || [],
      metadata: response.metadata,
    }),
  });
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: budgetKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/budgets/${id}`);
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data as Budget,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBudgetInput) => {
      const response = await api.post('/budgets', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBudgetInput }) => {
      const response = await api.patch(`/budgets/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/budgets/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
    },
  });
}

export function useBudgetYears() {
  return useQuery({
    queryKey: [...budgetKeys.all, 'years'],
    queryFn: async () => {
      const response = await api.get('/budgets/years');
      return response.data;
    },
    select: (response) => response.data as number[],
  });
}
