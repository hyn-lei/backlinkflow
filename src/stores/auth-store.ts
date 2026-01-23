import { create } from 'zustand';
import { User } from '@/lib/directus';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isFetching: boolean;
  hasFetched: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setFetched: (fetched: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isFetching: false,
  hasFetched: false,
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      set({ user: null, hasFetched: true });
    } catch (error) {
      console.error('Logout failed', error);
      // Even if server logout fails, we clear local state
      set({ user: null, hasFetched: true });
    }
  },
  checkAuth: async () => {
    const state = get();
    if (state.hasFetched || state.isFetching) return;

    set({ isFetching: true });
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, hasFetched: true });
      } else {
        set({ user: null, hasFetched: true });
      }
    } catch {
      set({ user: null, hasFetched: true });
    } finally {
      set({ isLoading: false, isFetching: false });
    }
  },
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setFetched: (hasFetched) => set({ hasFetched }),
}));
