'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { 
  filterAppointmentsByRole, 
  filterDashboardMetricsByRole,
  getApiFilterByRole,
  UserSession 
} from '@/lib/roleBasedFiltering';

// Types
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: {
    allergies: string;
    medications: string;
    conditions: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  practitionerId: string;
  clinicId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  appointmentType: string;
  reason: string;
  urgency: string;
  status: 'confirmed' | 'waiting' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
  medications: string;
  allergies: string;
  symptoms: string;
  bookingFor: string;
  relationship: string;
  confirmationCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Practitioner {
  id: string;
  clinicId: string;
  name: string;
  title: string;
  specialties: string[];
  bio: string;
  rating: number;
  consultationTypes: string[];
  availability: {
    [key: string]: Array<{
      start: string;
      end: string;
    }>;
  };
}

export interface Clinic {
  id: string;
  name: string;
  address: {
    street: string;
    suburb: string;
    postcode: string;
    lat: number;
    lng: number;
  };
  phone: string;
  email: string;
  openHours: {
    [key: string]: string;
  };
  services: string[];
}

// Base API URL
const API_BASE = 'http://localhost:3001';

// Query Keys
export const queryKeys = {
  appointments: ['appointments'] as const,
  appointmentsByDate: (date: string) => ['appointments', 'date', date] as const,
  patients: ['patients'] as const,
  practitioners: ['practitioners'] as const,
  dashboardMetrics: ['dashboard', 'metrics'] as const,
  appointmentAnalytics: ['appointments', 'analytics'] as const,
} as const;

// API Functions
const fetchAppointments = async (filters?: any): Promise<Appointment[]> => {
  let url = `${API_BASE}/appointments`;
  
  // Add query parameters for filtering
  if (filters && Object.keys(filters).length > 0) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    url += `?${params.toString()}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch appointments');
  return response.json();
};

const fetchPatients = async (): Promise<Patient[]> => {
  const response = await fetch(`${API_BASE}/patients`);
  if (!response.ok) throw new Error('Failed to fetch patients');
  return response.json();
};

const fetchPractitioners = async (): Promise<Practitioner[]> => {
  const response = await fetch(`${API_BASE}/practitioners`);
  if (!response.ok) throw new Error('Failed to fetch practitioners');
  return response.json();
};

const updateAppointmentStatusAPI = async ({ 
  appointmentId, 
  status 
}: { 
  appointmentId: string; 
  status: string; 
}) => {
  const response = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      status,
      updatedAt: new Date().toISOString()
    }),
  });
  
  if (!response.ok) throw new Error('Failed to update appointment');
  return response.json();
};

// Custom hook for fetching appointments - OPTIMIZED WITH REACT QUERY + ROLE-BASED FILTERING
export function useAppointments(date?: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  
  // Create user session object for filtering
  const userSession: UserSession = {
    id: session?.user?.id || '',
    role: session?.user?.role || 'patient',
    practitionerId: (session?.user as any)?.practitionerId,
    clinicId: session?.user?.clinicId
  };
  
  // Get API filters based on user role
  const apiFilters = getApiFilterByRole(userSession);
  
  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: [...queryKeys.appointments, userSession.role, userSession.practitionerId, date],
    queryFn: () => fetchAppointments(apiFilters),
    staleTime: 2 * 60 * 1000, // 2 minutes - data stays fresh
    refetchInterval: 3 * 60 * 1000, // 3 minutes - OPTIMIZED from 30 seconds!
    refetchIntervalInBackground: false, // Don't refetch when tab not active
    enabled: !!session?.user, // Only fetch when user is authenticated
    select: (data) => {
      // Apply client-side role-based filtering using the hook's Appointment type
      let filteredData = data;
      
      // Apply role-based filtering logic inline
      if (userSession.role === 'practitioner' && userSession.practitionerId) {
        filteredData = data.filter(
          appointment => appointment.practitionerId === userSession.practitionerId
        );
      }
      // Admin, staff, and nurse see all data (no filtering needed)
      
      // Filter appointments by date if provided
      if (date) {
        filteredData = filteredData.filter(apt => apt.appointmentDate === date);
      }
      return filteredData;
    }
  });

  // Prefetch related data when appointments load
  useEffect(() => {
    if (appointments.length > 0) {
      // Prefetch patients data if not already cached
      if (!queryClient.getQueryData(queryKeys.patients)) {
        queryClient.prefetchQuery({
          queryKey: queryKeys.patients,
          queryFn: fetchPatients,
          staleTime: 10 * 60 * 1000,
        });
      }
      
      // Prefetch practitioners data if not already cached
      if (!queryClient.getQueryData(queryKeys.practitioners)) {
        queryClient.prefetchQuery({
          queryKey: queryKeys.practitioners,
          queryFn: fetchPractitioners,
          staleTime: 15 * 60 * 1000,
        });
      }
    }
  }, [appointments.length, queryClient]);

  const { data: patients = [] } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: fetchPatients,
    staleTime: 10 * 60 * 1000, // 10 minutes - patients change less frequently
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const { data: practitioners = [] } = useQuery({
    queryKey: queryKeys.practitioners,
    queryFn: fetchPractitioners,
    staleTime: 30 * 60 * 1000, // 30 minutes - practitioners rarely change
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  // Mutation for updating appointment status with optimistic updates
  const updateStatusMutation = useMutation({
    mutationFn: updateAppointmentStatusAPI,
    onSuccess: () => {
      // Invalidate and refetch related queries for real-time updates
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointmentAnalytics });
    },
    onError: (error) => {
      console.error('Failed to update appointment status:', error);
    }
  });

  // Mutation for updating appointment notes
  const updateNotesMutation = useMutation({
    mutationFn: async ({ appointmentId, notes }: { appointmentId: string; notes: string }) => {
      const response = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          notes,
          updatedAt: new Date().toISOString()
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update appointment notes');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics });
    },
    onError: (error) => {
      console.error('Failed to update appointment notes:', error);
    }
  });

  // Enrich appointments with patient and practitioner data
  const enrichedAppointments = appointments.map(appointment => {
    const patient = patients.find(p => p.id === appointment.patientId);
    const practitioner = practitioners.find(p => p.id === appointment.practitionerId);
    
    return {
      ...appointment,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
      patientPhone: patient?.phone,
      practitionerName: practitioner?.name || 'Unknown Doctor'
    };
  });

  return {
    appointments: enrichedAppointments,
    patients,
    practitioners,
    loading: isLoading,
    error: error?.message || null,
    refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.appointments }),
    updateAppointmentStatus: (appointmentId: string, newStatus: string) => 
      updateStatusMutation.mutate({ appointmentId, status: newStatus }),
    updateAppointmentNotes: (appointmentId: string, notes: string) =>
      updateNotesMutation.mutate({ appointmentId, notes })
  };
}

// Custom hook for dashboard metrics - OPTIMIZED WITH REACT QUERY + ROLE-BASED FILTERING
export function useDashboardMetrics() {
  const { data: session } = useSession();
  
  // Create user session object for filtering
  const userSession: UserSession = {
    id: session?.user?.id || '',
    role: session?.user?.role || 'patient',
    practitionerId: (session?.user as any)?.practitionerId,
    clinicId: session?.user?.clinicId
  };
  
  return useQuery({
    queryKey: [...queryKeys.dashboardMetrics, userSession.role, userSession.practitionerId],
    queryFn: async () => {
      const apiFilters = getApiFilterByRole(userSession);
      const [appointments, patients] = await Promise.all([
        fetchAppointments(apiFilters),
        fetchPatients()
      ]);

      const today = format(new Date(), 'yyyy-MM-dd');
      let todaysAppointments = appointments.filter((apt: Appointment) => 
        apt.appointmentDate === today
      );

      // Apply role-based filtering for practitioners
      if (userSession.role === 'practitioner' && userSession.practitionerId) {
        todaysAppointments = todaysAppointments.filter(
          apt => apt.practitionerId === userSession.practitionerId
        );
      }

      const waitingPatients = todaysAppointments.filter((apt: Appointment) => 
        apt.status === 'waiting'
      ).length;

      const completedToday = todaysAppointments.filter((apt: Appointment) => 
        apt.status === 'completed'
      ).length;

      const cancelledToday = todaysAppointments.filter((apt: Appointment) => 
        apt.status === 'cancelled' || apt.status === 'no-show'
      ).length;

      const cancellationRate = todaysAppointments.length > 0 
        ? Math.round((cancelledToday / todaysAppointments.length) * 100)
        : 0;

      // Calculate total patients based on role
      let totalPatients = patients.length;
      if (userSession.role === 'practitioner' && userSession.practitionerId) {
        // For practitioners, count only unique patients who have appointments with them
        const practitionerPatientIds = appointments
          .filter(apt => apt.practitionerId === userSession.practitionerId)
          .map(apt => apt.patientId);
        const uniquePatientIds = Array.from(new Set(practitionerPatientIds));
        totalPatients = uniquePatientIds.length;
      }

      return {
        totalPatients,
        todaysAppointments: todaysAppointments.length,
        waitingPatients,
        completedToday,
        pendingApprovals: 5, // This would come from a real API
        cancellationRate,
        userRole: userSession.role,
        isFiltered: userSession.role === 'practitioner'
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - OPTIMIZED!
    refetchInterval: 3 * 60 * 1000, // 3 minutes - MUCH BETTER than 30 seconds!
    refetchIntervalInBackground: false, // Save battery/bandwidth
    enabled: !!session?.user, // Only fetch when user is authenticated
  });
}

// Custom hook for today's appointments
export function useTodaysAppointments() {
  const today = format(new Date(), 'yyyy-MM-dd');
  return useAppointments(today);
}

// Custom hook for waiting list
export function useWaitingList() {
  const { appointments, loading, error, updateAppointmentStatus, refetch } = useTodaysAppointments();
  
  const waitingAppointments = appointments.filter(apt => 
    apt.status === 'waiting' || apt.status === 'in-progress'
  ).sort((a, b) => {
    // Sort by check-in time or appointment time
    const timeA = new Date(`${a.appointmentDate} ${a.appointmentTime}`).getTime();
    const timeB = new Date(`${b.appointmentDate} ${b.appointmentTime}`).getTime();
    return timeA - timeB;
  });

  return {
    waitingAppointments,
    loading,
    error,
    updateAppointmentStatus,
    refetch
  };
}

// Custom hook for appointment trends and analytics - OPTIMIZED WITH REACT QUERY + ROLE-BASED FILTERING
export function useAppointmentAnalytics() {
  const { data: session } = useSession();
  
  // Create user session object for filtering
  const userSession: UserSession = {
    id: session?.user?.id || '',
    role: session?.user?.role || 'patient',
    practitionerId: (session?.user as any)?.practitionerId,
    clinicId: session?.user?.clinicId
  };
  
  return useQuery({
    queryKey: [...queryKeys.appointmentAnalytics, userSession.role, userSession.practitionerId],
    queryFn: async () => {
      const apiFilters = getApiFilterByRole(userSession);
      let appointments = await fetchAppointments(apiFilters);
      
      // Apply client-side role-based filtering for practitioners
      if (userSession.role === 'practitioner' && userSession.practitionerId) {
        appointments = appointments.filter(
          apt => apt.practitionerId === userSession.practitionerId
        );
      }
      
      // Calculate appointment trends for the last 7 days
      const trends = [];
      const statusCounts = {
        completed: 0,
        confirmed: 0,
        waiting: 0,
        cancelled: 0,
        'no-show': 0
      };

      // Get last 7 days
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = format(date, 'yyyy-MM-dd');
        const dayName = format(date, 'EEE');
        
        const dayAppointments = appointments.filter((apt: Appointment) => apt.appointmentDate === dateString);
        trends.push({
          name: dayName,
          appointments: dayAppointments.length
        });
      }

      // Calculate status distribution for recent appointments (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentAppointments = appointments.filter((apt: Appointment) => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= thirtyDaysAgo;
      });

      recentAppointments.forEach((apt: Appointment) => {
        if (apt.status in statusCounts) {
          statusCounts[apt.status as keyof typeof statusCounts]++;
        }
      });

      const statusDistribution = [
        { name: 'Completed', value: statusCounts.completed, fill: '#10b981' },
        { name: 'Confirmed', value: statusCounts.confirmed, fill: '#3b82f6' },
        { name: 'Waiting', value: statusCounts.waiting, fill: '#f59e0b' },
        { name: 'Cancelled', value: statusCounts.cancelled + statusCounts['no-show'], fill: '#ef4444' }
      ].filter(item => item.value > 0); // Only show statuses with data

      return {
        appointmentTrends: trends,
        statusDistribution,
        userRole: userSession.role,
        isFiltered: userSession.role === 'practitioner'
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - Analytics change less frequently
    refetchInterval: 10 * 60 * 1000, // 10 minutes - MUCH BETTER than 30 seconds!
    refetchIntervalInBackground: false,
    enabled: !!session?.user, // Only fetch when user is authenticated
  });
}
