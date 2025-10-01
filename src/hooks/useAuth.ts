import { useAuthStore } from '@/store/authStore';
import { useSession } from 'next-auth/react';

export function useAuth() {
  const authStore = useAuthStore();
  const { data: session, status } = useSession();

  return {
    // Store state
    ...authStore,
    
    // NextAuth session state
    session,
    sessionStatus: status,
    
    // Computed properties
    isLoading: authStore.isLoading || status === 'loading',
    isAuthenticated: authStore.isAuthenticated && status === 'authenticated',
    
    // Helper methods
    isPatient: authStore.user?.role === 'patient',
    isStaff: authStore.user?.role && ['staff', 'doctor', 'nurse', 'admin'].includes(authStore.user.role),
    isAdmin: authStore.user?.role === 'admin',
    
    // Role-based redirect paths
    getDashboardPath: () => {
      if (!authStore.user) return '/auth/signin';
      return authStore.user.role === 'patient' ? '/patient/dashboard' : '/staff/dashboard';
    },
  };
}
