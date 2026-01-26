/**
 * useFunds Hook Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFunds, useFund } from '@/hooks/useFunds';
import { createWrapper } from '../test-utils';
import { server } from '../mocks/server';
import { mockFunds } from '../mocks/handlers';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useFunds', () => {
  it('should fetch funds list', async () => {
    const { result } = renderHook(() => useFunds(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.funds).toHaveLength(mockFunds.length);
  });

  it('should fetch funds with type filter', async () => {
    const { result } = renderHook(() => useFunds({ fundType: 'TRADE_FUND' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.funds).toBeDefined();
  });

  it('should handle pagination', async () => {
    const { result } = renderHook(() => useFunds({ page: 1, pageSize: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.metadata).toBeDefined();
  });
});

describe('useFund', () => {
  it('should fetch single fund by ID', async () => {
    const { result } = renderHook(() => useFund('fund-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.code).toBe('FUND001');
    expect(result.current.data?.name).toBe('Trade Fund Q1');
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useFund(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});
