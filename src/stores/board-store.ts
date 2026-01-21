import { create } from 'zustand';
import { UserBoard } from '@/lib/directus';

interface BoardState {
  items: UserBoard[];
  isLoading: boolean;
  isAdding: boolean;
  setItems: (items: UserBoard[]) => void;
  setLoading: (loading: boolean) => void;
  addToBoard: (platformId: number, userId: string) => Promise<void>;
  removeFromBoard: (itemId: string) => Promise<void>;
  updateStatus: (itemId: string, status: UserBoard['status']) => Promise<void>;
  updateNotes: (itemId: string, notes: string) => Promise<void>;
  setBacklinkUrl: (itemId: string, url: string) => Promise<void>;
  fetchBoard: (userId: string) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  items: [],
  isLoading: false,
  isAdding: false,

  setItems: (items) => set({ items }),
  setLoading: (isLoading) => set({ isLoading }),

  fetchBoard: async (userId: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/board?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        set({ items: data.items });
      }
    } catch (error) {
      console.error('Failed to fetch board:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addToBoard: async (platformId: number, userId: string) => {
    set({ isAdding: true });

    const tempId = `temp-${Date.now()}`;
    const optimisticItem: UserBoard = {
      id: tempId,
      user: userId,
      platform: platformId,
      status: 'todo',
      backlink_url: null,
      notes: null,
      date_created: new Date().toISOString(),
      date_updated: new Date().toISOString(),
    };

    set((state) => ({ items: [...state.items, optimisticItem] }));

    try {
      const res = await fetch('/api/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformId, userId }),
      });

      if (!res.ok) throw new Error('Failed to add');

      const data = await res.json();

      set((state) => ({
        items: state.items.map((item) =>
          item.id === tempId ? data.item : item
        ),
      }));
    } catch (error) {
      set((state) => ({
        items: state.items.filter((item) => item.id !== tempId),
      }));
      throw error;
    } finally {
      set({ isAdding: false });
    }
  },

  removeFromBoard: async (itemId: string) => {
    const { items } = get();
    const itemToRemove = items.find((i) => i.id === itemId);

    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }));

    try {
      const res = await fetch(`/api/board/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove');
    } catch (error) {
      if (itemToRemove) {
        set((state) => ({ items: [...state.items, itemToRemove] }));
      }
      throw error;
    }
  },

  updateStatus: async (itemId: string, status: UserBoard['status']) => {
    const { items } = get();
    const oldItem = items.find((i) => i.id === itemId);

    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, status } : item
      ),
    }));

    try {
      const res = await fetch(`/api/board/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update');
    } catch (error) {
      if (oldItem) {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? oldItem : item
          ),
        }));
      }
      throw error;
    }
  },

  updateNotes: async (itemId: string, notes: string) => {
    try {
      const res = await fetch(`/api/board/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error('Failed to update');

      set((state) => ({
        items: state.items.map((item) =>
          item.id === itemId ? { ...item, notes } : item
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  setBacklinkUrl: async (itemId: string, backlink_url: string) => {
    try {
      const res = await fetch(`/api/board/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backlink_url }),
      });
      if (!res.ok) throw new Error('Failed to update');

      set((state) => ({
        items: state.items.map((item) =>
          item.id === itemId ? { ...item, backlink_url } : item
        ),
      }));
    } catch (error) {
      throw error;
    }
  },
}));
