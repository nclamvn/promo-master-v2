/**
 * usePromotions Hook Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePromotions, usePromotion } from '@/hooks/usePromotions';
import { createWrapper } from '../test-utils';
import { server } from '../mocks/server';
import { mockPromotions, mockPromotion } from '../mocks/handlers';

// Start/stop MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('usePromotions', () => {
  it('should fetch promotions list', async () => {
    const { result } = renderHook(() => usePromotions(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check data
    expect(result.current.data?.promotions).toHaveLength(mockPromotions.length);
  });

  it('should fetch promotions with filters', async () => {
    const { result } = renderHook(() => usePromotions({ status: 'ACTIVE' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.promotions).toBeDefined();
  });

  it('should handle pagination params', async () => {
    const { result } = renderHook(() => usePromotions({ page: 1, pageSize: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.metadata).toBeDefined();
  });
});

describe('usePromotion', () => {
  it('should fetch single promotion by ID', async () => {
    const { result } = renderHook(() => usePromotion('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.code).toBe(mockPromotion.code);
    expect(result.current.data?.name).toBe(mockPromotion.name);
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => usePromotion(''), {
      wrapper: createWrapper(),
    });

    // Should not be loading since query is disabled
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});
