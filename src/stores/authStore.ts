import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: (user: User, token: string) => {
        set({ user, token, isLoading: false });
      },

      logout: () => {
        set({ user: null, token: null, isLoading: false });
        window.location.href = '/login';
      },

      checkAuth: () => {
        const { token } = get();
        if (!token) {
          set({ isLoading: false });
          return false;
        }
        // Basic JWT expiry check (decode payload without verification)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            set({ user: null, token: null, isLoading: false });
            return false;
          }
        } catch {
          set({ user: null, token: null, isLoading: false });
          return false;
        }
        set({ isLoading: false });
        return true;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
