/**
 * useCustomers Hook Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCustomers } from '@/hooks/useCustomers';
import { createWrapper } from '../test-utils';
import { server } from '../mocks/server';
import { mockCustomers } from '../mocks/handlers';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useCustomers', () => {
  it('should fetch customers list', async () => {
    const { result } = renderHook(() => useCustomers(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.customers).toHaveLength(mockCustomers.length);
  });

  it('should fetch customers with search filter', async () => {
    const { result } = renderHook(() => useCustomers({ search: 'ABC' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.customers).toBeDefined();
  });

  it('should fetch customers with channel filter', async () => {
    const { result } = renderHook(() => useCustomers({ channel: 'MODERN_TRADE' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.customers).toBeDefined();
  });

  it('should handle pagination', async () => {
    const { result } = renderHook(() => useCustomers({ page: 1, pageSize: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.metadata).toBeDefined();
  });
});
