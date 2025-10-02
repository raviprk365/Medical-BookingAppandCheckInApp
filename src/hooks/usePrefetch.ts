import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Query keys for prefetching
const PREFETCH_QUERIES = {
  dashboard: ['appointments', 'dashboardMetrics', 'patients'],
  today: ['todaysAppointments', 'patients', 'practitioners'],
  calendar: ['appointments', 'practitioners', 'clinics'],
  messages: ['conversations', 'messages', 'messageTemplates'],
  waiting: ['waitingPatients', 'appointments']
};

// API endpoints mapping
const API_ENDPOINTS = {
  appointments: 'http://localhost:3001/appointments',
  patients: 'http://localhost:3001/patients',
  practitioners: 'http://localhost:3001/practitioners',
  conversations: 'http://localhost:3001/conversations',
  messages: 'http://localhost:3001/messages',
  messageTemplates: 'http://localhost:3001/messageTemplates',
  clinics: 'http://localhost:3001/clinics',
  notifications: 'http://localhost:3001/notifications'
};

// Generic fetch function
const fetchData = async (endpoint: string) => {
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
  return response.json();
};

// Custom hook for intelligent prefetching
export function usePrefetchOnHover() {
  const queryClient = useQueryClient();

  const prefetchQueries = async (queryKeys: string[]) => {
    const prefetchPromises = queryKeys.map(key => {
      const endpoint = API_ENDPOINTS[key as keyof typeof API_ENDPOINTS];
      if (endpoint) {
        return queryClient.prefetchQuery({
          queryKey: [key],
          queryFn: () => fetchData(endpoint),
          staleTime: 5 * 60 * 1000, // 5 minutes
        });
      }
      return Promise.resolve();
    });

    await Promise.all(prefetchPromises);
  };

  const prefetchPage = (page: keyof typeof PREFETCH_QUERIES) => {
    const queries = PREFETCH_QUERIES[page];
    prefetchQueries(queries);
  };

  return { prefetchPage };
}

// Hook for background prefetching of likely next pages
export function useBackgroundPrefetch() {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    // Prefetch commonly accessed data in the background
    const prefetchCommonData = async () => {
      try {
        // Always prefetch core data
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: ['patients'],
            queryFn: () => fetchData(API_ENDPOINTS.patients),
            staleTime: 10 * 60 * 1000,
          }),
          queryClient.prefetchQuery({
            queryKey: ['appointments'],
            queryFn: () => fetchData(API_ENDPOINTS.appointments),
            staleTime: 2 * 60 * 1000,
          }),
          queryClient.prefetchQuery({
            queryKey: ['practitioners'],
            queryFn: () => fetchData(API_ENDPOINTS.practitioners),
            staleTime: 15 * 60 * 1000,
          })
        ]);
      } catch (error) {
        console.warn('Background prefetch failed:', error);
      }
    };

    // Start prefetching after a short delay
    const timer = setTimeout(prefetchCommonData, 1000);
    
    return () => clearTimeout(timer);
  }, [queryClient]);
}

// Hook for prefetching on route changes
export function useRoutePrefetch() {
  const queryClient = useQueryClient();

  const prefetchForRoute = (pathname: string) => {
    // Determine what data to prefetch based on the route
    if (pathname.includes('/dashboard/today')) {
      const queries = PREFETCH_QUERIES.today;
      queries.forEach(key => {
        const endpoint = API_ENDPOINTS[key as keyof typeof API_ENDPOINTS];
        if (endpoint) {
          queryClient.prefetchQuery({
            queryKey: [key],
            queryFn: () => fetchData(endpoint),
            staleTime: 2 * 60 * 1000,
          });
        }
      });
    } else if (pathname.includes('/dashboard/calendar')) {
      const queries = PREFETCH_QUERIES.calendar;
      queries.forEach(key => {
        const endpoint = API_ENDPOINTS[key as keyof typeof API_ENDPOINTS];
        if (endpoint) {
          queryClient.prefetchQuery({
            queryKey: [key],
            queryFn: () => fetchData(endpoint),
            staleTime: 5 * 60 * 1000,
          });
        }
      });
    } else if (pathname.includes('/dashboard/messages')) {
      const queries = PREFETCH_QUERIES.messages;
      queries.forEach(key => {
        const endpoint = API_ENDPOINTS[key as keyof typeof API_ENDPOINTS];
        if (endpoint) {
          queryClient.prefetchQuery({
            queryKey: [key],
            queryFn: () => fetchData(endpoint),
            staleTime: 1 * 60 * 1000, // Messages are more time-sensitive
          });
        }
      });
    }
  };

  return { prefetchForRoute };
}
