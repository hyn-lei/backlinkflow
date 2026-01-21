'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

export function useAuth() {
  const { user, isLoading, setUser, setLoading } = useAuthStore();
  const router = useRouter();
  const hasFetched = useRef(false);

  useEffect(() => {
    // Skip if already fetched or user is loaded
    if (hasFetched.current || user) return;
    hasFetched.current = true;

    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [setUser, setLoading, user]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/');
    } catch {
      toast.error('Failed to logout');
    }
  };

  return { user, isLoading, logout };
}
