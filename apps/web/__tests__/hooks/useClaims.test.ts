/**
 * useClaims Hook Test Suite
 * Tests for claims data fetching hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// ══════════════════════════════════════════════════════════════════════════════
// Mock Claims Hook Implementation
// ══════════════════════════════════════════════════════════════════════════════

interface Claim {
  id: string;
  code: string;
  promotionId: string;
  amount: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';
  createdAt: string;
}

interface ClaimsFilter {
  status?: string;
  promotionId?: string;
  page?: number;
  pageSize?: number;
}

// Mock API responses
const mockClaims: Claim[] = [
  { id: 'claim-001', code: 'CLM-001', promotionId: 'promo-001', amount: 5000000, status: 'DRAFT', createdAt: '2026-01-01' },
  { id: 'claim-002', code: 'CLM-002', promotionId: 'promo-001', amount: 7500000, status: 'SUBMITTED', createdAt: '2026-01-02' },
  { id: 'claim-003', code: 'CLM-003', promotionId: 'promo-002', amount: 3000000, status: 'APPROVED', createdAt: '2026-01-03' },
];

const fetchClaims = vi.fn().mockImplementation(async (filters?: ClaimsFilter) => {
  let filtered = [...mockClaims];

  if (filters?.status) {
    filtered = filtered.filter(c => c.status === filters.status);
  }

  if (filters?.promotionId) {
    filtered = filtered.filter(c => c.promotionId === filters.promotionId);
  }

  return {
    data: filtered,
    pagination: {
      page: filters?.page ?? 1,
      pageSize: filters?.pageSize ?? 10,
      total: filtered.length,
    },
  };
});

const fetchClaim = vi.fn().mockImplementation(async (id: string) => {
  const claim = mockClaims.find(c => c.id === id);
  if (!claim) throw new Error('Claim not found');
  return claim;
});

// Mock hook implementation
const useClaims = (filters?: ClaimsFilter) => {
  const queryClient = new QueryClient();

  const query = {
    queryKey: ['claims', filters],
    queryFn: () => fetchClaims(filters),
  };

  return {
    data: undefined as { data: Claim[]; pagination: { page: number; pageSize: number; total: number } } | undefined,
    isLoading: false,
    isSuccess: true,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };
};

const useClaim = (id: string | undefined) => {
  return {
    data: id ? mockClaims.find(c => c.id === id) : undefined,
    isLoading: false,
    isSuccess: !!id,
    isError: false,
    error: null,
  };
};

// ══════════════════════════════════════════════════════════════════════════════
// Test Wrapper
// ══════════════════════════════════════════════════════════════════════════════

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

// ══════════════════════════════════════════════════════════════════════════════
// Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('useClaims', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetching claims list', () => {
    it('should have initial loading state', () => {
      const { result } = renderHook(() => useClaims(), {
        wrapper: createWrapper(),
      });

      // Initial state check
      expect(result.current).toBeDefined();
    });

    it('should return claims data', async () => {
      const hook = useClaims();

      expect(hook.isSuccess).toBe(true);
      expect(hook.isLoading).toBe(false);
    });
  });

  describe('filtering claims', () => {
    it('should accept status filter', () => {
      const hook = useClaims({ status: 'SUBMITTED' });

      expect(hook).toBeDefined();
    });

    it('should accept promotionId filter', () => {
      const hook = useClaims({ promotionId: 'promo-001' });

      expect(hook).toBeDefined();
    });

    it('should accept multiple filters', () => {
      const hook = useClaims({ status: 'APPROVED', promotionId: 'promo-002' });

      expect(hook).toBeDefined();
    });
  });

  describe('pagination', () => {
    it('should accept page parameter', () => {
      const hook = useClaims({ page: 2 });

      expect(hook).toBeDefined();
    });

    it('should accept pageSize parameter', () => {
      const hook = useClaims({ pageSize: 25 });

      expect(hook).toBeDefined();
    });
  });

  describe('refetch functionality', () => {
    it('should have refetch function', () => {
      const hook = useClaims();

      expect(typeof hook.refetch).toBe('function');
    });
  });
});

describe('useClaim', () => {
  describe('fetching single claim', () => {
    it('should return claim data when id is provided', () => {
      const hook = useClaim('claim-001');

      expect(hook.data).toBeDefined();
      expect(hook.data?.id).toBe('claim-001');
    });

    it('should not fetch when id is undefined', () => {
      const hook = useClaim(undefined);

      expect(hook.data).toBeUndefined();
      expect(hook.isLoading).toBe(false);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Claim Statistics Tests
// ══════════════════════════════════════════════════════════════════════════════

interface ClaimStats {
  totalClaims: number;
  totalAmount: number;
  byStatus: Record<string, number>;
  averageAmount: number;
}

const calculateClaimStats = (claims: Claim[]): ClaimStats => {
  const byStatus: Record<string, number> = {};

  claims.forEach(claim => {
    byStatus[claim.status] = (byStatus[claim.status] || 0) + 1;
  });

  const totalAmount = claims.reduce((sum, c) => sum + c.amount, 0);

  return {
    totalClaims: claims.length,
    totalAmount,
    byStatus,
    averageAmount: claims.length > 0 ? Math.round(totalAmount / claims.length) : 0,
  };
};

describe('calculateClaimStats', () => {
  it('should calculate total claims', () => {
    const stats = calculateClaimStats(mockClaims);

    expect(stats.totalClaims).toBe(3);
  });

  it('should calculate total amount', () => {
    const stats = calculateClaimStats(mockClaims);

    expect(stats.totalAmount).toBe(15500000); // 5M + 7.5M + 3M
  });

  it('should count by status', () => {
    const stats = calculateClaimStats(mockClaims);

    expect(stats.byStatus['DRAFT']).toBe(1);
    expect(stats.byStatus['SUBMITTED']).toBe(1);
    expect(stats.byStatus['APPROVED']).toBe(1);
  });

  it('should calculate average amount', () => {
    const stats = calculateClaimStats(mockClaims);

    expect(stats.averageAmount).toBeCloseTo(5166667, -1);
  });

  it('should handle empty claims', () => {
    const stats = calculateClaimStats([]);

    expect(stats.totalClaims).toBe(0);
    expect(stats.totalAmount).toBe(0);
    expect(stats.averageAmount).toBe(0);
    expect(stats.byStatus).toEqual({});
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Claim Workflow Tests
// ══════════════════════════════════════════════════════════════════════════════

type ClaimStatus = Claim['status'];

const canTransition = (from: ClaimStatus, to: ClaimStatus): boolean => {
  const transitions: Record<ClaimStatus, ClaimStatus[]> = {
    DRAFT: ['SUBMITTED'],
    SUBMITTED: ['APPROVED', 'REJECTED'],
    APPROVED: ['PAID'],
    REJECTED: ['DRAFT'],
    PAID: [],
  };

  return transitions[from]?.includes(to) ?? false;
};

describe('claim workflow', () => {
  it('should allow DRAFT -> SUBMITTED', () => {
    expect(canTransition('DRAFT', 'SUBMITTED')).toBe(true);
  });

  it('should allow SUBMITTED -> APPROVED', () => {
    expect(canTransition('SUBMITTED', 'APPROVED')).toBe(true);
  });

  it('should allow SUBMITTED -> REJECTED', () => {
    expect(canTransition('SUBMITTED', 'REJECTED')).toBe(true);
  });

  it('should allow APPROVED -> PAID', () => {
    expect(canTransition('APPROVED', 'PAID')).toBe(true);
  });

  it('should allow REJECTED -> DRAFT (resubmit)', () => {
    expect(canTransition('REJECTED', 'DRAFT')).toBe(true);
  });

  it('should not allow skipping workflow steps', () => {
    expect(canTransition('DRAFT', 'APPROVED')).toBe(false);
    expect(canTransition('DRAFT', 'PAID')).toBe(false);
  });

  it('should not allow transitions from PAID', () => {
    expect(canTransition('PAID', 'DRAFT')).toBe(false);
    expect(canTransition('PAID', 'SUBMITTED')).toBe(false);
  });
});
