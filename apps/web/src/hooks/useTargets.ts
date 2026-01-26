/**
 * Target React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Target, CreateTargetInput } from '@/types';

export const targetKeys = {
  all: ['targets'] as const,
  lists: () => [...targetKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...targetKeys.lists(), filters] as const,
  detail: (id: string) => [...targetKeys.all, 'detail', id] as const,
};

interface ListParams {
  page?: number;
  pageSize?: number;
  year?: number;
  month?: number;
  targetType?: string;
  status?: string;
  [key: string]: unknown;
}

export function useTargets(params: ListParams = {}) {
  return useQuery({
    queryKey: targetKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/targets', { params });
      return response.data;
    },
    select: (response) => ({
      targets: response.data || [],
      metadata: response.metadata,
    }),
  });
}

export function useTarget(id: string) {
  return useQuery({
    queryKey: targetKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/targets/${id}`);
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data as Target,
  });
}

export function useCreateTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTargetInput) => {
      const response = await api.post('/targets', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: targetKeys.lists() });
    },
  });
}

export function useUpdateTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateTargetInput> }) => {
      const response = await api.patch(`/targets/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: targetKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: targetKeys.lists() });
    },
  });
}

export function useDeleteTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/targets/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: targetKeys.lists() });
    },
  });
}
