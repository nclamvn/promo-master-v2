/**
 * Auth Store Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuthStore, selectUser, selectIsAuthenticated, selectIsLoading } from '@/stores/authStore';

// Mock the api module
vi.mock('@/lib/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('authStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('setTokens', () => {
    it('should set tokens and mark as authenticated', () => {
      useAuthStore.getState().setTokens('access-token', 'refresh-token');

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('access-token');
      expect(state.refreshToken).toBe('refresh-token');
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('setUser', () => {
    it('should set user data', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
      };

      useAuthStore.getState().setUser(mockUser);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should reset state to initial values', () => {
      // First set some state
      useAuthStore.setState({
        user: { id: '1', email: 'test@example.com', name: 'Test', role: 'ADMIN' },
        accessToken: 'token',
        refreshToken: 'refresh',
        isAuthenticated: true,
      });

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useAuthStore.setState({ error: 'Some error' });

      useAuthStore.getState().clearError();

      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('selectors', () => {
    it('selectUser should return user', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
      };
      useAuthStore.setState({ user: mockUser });

      expect(selectUser(useAuthStore.getState())).toEqual(mockUser);
    });

    it('selectIsAuthenticated should return isAuthenticated', () => {
      useAuthStore.setState({ isAuthenticated: true });

      expect(selectIsAuthenticated(useAuthStore.getState())).toBe(true);
    });

    it('selectIsLoading should return isLoading', () => {
      useAuthStore.setState({ isLoading: true });

      expect(selectIsLoading(useAuthStore.getState())).toBe(true);
    });
  });
});
