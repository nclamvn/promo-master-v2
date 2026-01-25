/**
 * Claims React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Claim } from '@/types';

// Query keys
export const claimKeys = {
  all: ['claims'] as const,
  lists: () => [...claimKeys.all, 'list'] as const,
  list: (filters: object) => [...claimKeys.lists(), filters] as const,
  details: () => [...claimKeys.all, 'detail'] as const,
  detail: (id: string) => [...claimKeys.details(), id] as const,
};

// Types
interface ListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  promotionId?: string;
  customerId?: string;
  search?: string;
}

interface CreateClaimInput {
  promotionId: string;
  claimDate: string;
  claimAmount: number;
  description?: string;
  invoiceNumber?: string;
  evidenceUrls?: string[];
}

// Hooks
export function useClaims(params: ListParams = {}) {
  return useQuery({
    queryKey: claimKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/claims', { params });
      return response.data;
    },
    select: (response) => ({
      claims: response.data || [],
      metadata: response.metadata,
    }),
  });
}

export function useClaim(id: string) {
  return useQuery({
    queryKey: claimKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/claims/${id}`);
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data as Claim,
  });
}

export function useCreateClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateClaimInput) => {
      const response = await api.post('/claims', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimKeys.lists() });
    },
  });
}

export function useUpdateClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateClaimInput> }) => {
      const response = await api.patch(`/claims/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: claimKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: claimKeys.lists() });
    },
  });
}

export function useDeleteClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/claims/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimKeys.lists() });
    },
  });
}

export function useSubmitClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/claims/${id}/submit`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: claimKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: claimKeys.lists() });
    },
  });
}

export function useApproveClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, approvedAmount }: { id: string; approvedAmount: number }) => {
      const response = await api.post(`/claims/${id}/approve`, { approvedAmount });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: claimKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: claimKeys.lists() });
    },
  });
}

export function useRejectClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.post(`/claims/${id}/reject`, { reason });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: claimKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: claimKeys.lists() });
    },
  });
}
