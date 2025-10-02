'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/spinner';

export function RouteTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    const handleComplete = () => setIsNavigating(false);

    // Listen for route changes
    const originalPush = router.push;
    router.push = (...args) => {
      handleStart();
      return originalPush.apply(router, args).finally(handleComplete);
    };

    return () => {
      router.push = originalPush;
    };
  }, [router]);

  useEffect(() => {
    // Route change completed
    setIsNavigating(false);
  }, [pathname]);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-blue-600 animate-pulse transition-all duration-300" />
    </div>
  );
}

export function NavigationLoader() {
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    // Add event listeners for navigation events
    window.addEventListener('beforeunload', handleStart);
    
    // Use a timeout to simulate loading for client-side navigation
    const timer = setTimeout(handleComplete, 500);

    return () => {
      window.removeEventListener('beforeunload', handleStart);
      clearTimeout(timer);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 shadow-lg">
        <LoadingSpinner size="md" text="Loading page..." />
      </div>
    </div>
  );
}
