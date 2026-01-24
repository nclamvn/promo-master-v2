import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Claim, ClaimListResponse, CreateClaimDto, UpdateClaimDto } from '@/types/claim';

interface ClaimFilters {
  page?: number;
  limit?: number;
  status?: string;
  customerId?: string;
  promotionId?: string;
}

export function useClaims(filters: ClaimFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.status) params.set('status', filters.status);
  if (filters.customerId) params.set('customerId', filters.customerId);
  if (filters.promotionId) params.set('promotionId', filters.promotionId);

  const queryString = params.toString();
  const path = `/claims${queryString ? `?${queryString}` : ''}`;

  return useQuery<ClaimListResponse>({
    queryKey: ['claims', filters],
    queryFn: () => api.get<ClaimListResponse>(path),
  });
}

export function useClaim(id: string | undefined) {
  return useQuery<{ data: Claim }>({
    queryKey: ['claim', id],
    queryFn: () => api.get<{ data: Claim }>(`/claims/${id}`),
    enabled: !!id,
  });
}

export function useCreateClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClaimDto) => api.post<{ data: Claim }>('/claims', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}

export function useUpdateClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClaimDto }) =>
      api.put<{ data: Claim }>(`/claims/${id}`, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['claim', variables.id] });
    },
  });
}

export function useDeleteClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ success: boolean }>(`/claims/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}
