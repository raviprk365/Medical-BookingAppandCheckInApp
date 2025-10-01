'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { AuthProvider as ZustandAuthProvider } from '@/components/AuthProvider';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <ZustandAuthProvider>
        {children}
      </ZustandAuthProvider>
    </SessionProvider>
  );
}
