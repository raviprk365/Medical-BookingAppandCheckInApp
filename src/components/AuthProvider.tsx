'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { setUser, setAuthenticated, setLoading, login, logout, initializeAuth } = useAuthStore();

  useEffect(() => {
    console.log('🔄 AuthProvider: Session status changed:', status);
    console.log('🔄 AuthProvider: Session data:', session);

    if (status === 'loading') {
      setLoading(true);
      return;
    }

    setLoading(false);

    if (status === 'authenticated' && session?.user) {
      const user = {
        id: session.user.id || session.user.email || 'unknown',
        name: session.user.name || 'Unknown User',
        email: session.user.email || '',
        role: session.user.role as any || 'staff', // Default to staff instead of patient
        clinicId: session.user.clinicId,
        image: session.user.image,
      };
      
      console.log('🔄 AuthProvider: Setting authenticated user:', user);
      login(user);
    } else if (status === 'unauthenticated') {
      console.log('🔄 AuthProvider: User unauthenticated, clearing store');
      logout();
    }
  }, [session, status, login, logout, setLoading]);

  // Initialize auth on mount
  useEffect(() => {
    console.log('🔄 AuthProvider: Initializing auth');
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
