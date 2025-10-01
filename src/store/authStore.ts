import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'staff' | 'admin' | 'doctor' | 'nurse';
  clinicId?: string;
  image?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User) => void;
  logout: () => void;
  clearError: () => void;
  
  // Session management
  initializeAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),

      login: (user) => {
        console.log('🏪 Store: Setting user login state', user);
        set({ 
          user, 
          isAuthenticated: true, 
          error: null,
          isLoading: false 
        });
      },

      logout: () => {
        console.log('🏪 Store: Clearing user state');
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null,
          isLoading: false 
        });
      },

      initializeAuth: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Dynamic import to avoid SSR issues
          const { getSession } = await import('next-auth/react');
          const session = await getSession();
          
          console.log('🏪 Store: Initializing auth with session:', session);
          
          if (session?.user) {
            const user: User = {
              id: session.user.id || session.user.email || 'unknown',
              name: session.user.name || 'Unknown User',
              email: session.user.email || '',
              role: (session.user.role as User['role']) || 'staff', // Default to staff instead of patient
              clinicId: session.user.clinicId,
              image: session.user.image,
            };
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: null 
            });
          }
        } catch (error) {
          console.error('🏪 Store: Auth initialization error:', error);
          set({ 
            error: 'Failed to initialize authentication',
            isLoading: false,
            user: null,
            isAuthenticated: false 
          });
        }
      },

      refreshUser: async () => {
        const { initializeAuth } = get();
        await initializeAuth();
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
