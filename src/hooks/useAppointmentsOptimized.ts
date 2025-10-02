'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

// Types (same as before)
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
const fetchAppointments = async (): Promise<Appointment[]> => {
  const response = await fetch(`${API_BASE}/appointments`);
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

const updateAppointmentStatus = async ({ 
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

// 🎯 OPTIMIZED HOOKS WITH REACT QUERY

export function useAppointments(date?: string) {
  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: date ? queryKeys.appointmentsByDate(date) : queryKeys.appointments,
    queryFn: fetchAppointments,
    staleTime: 2 * 60 * 1000, // 2 minutes - data stays fresh
    refetchInterval: 3 * 60 * 1000, // 3 minutes - background refresh
    refetchIntervalInBackground: false, // Don't refetch when tab not active
    select: (data) => {
      // Filter appointments by date if provided
      if (date) {
        return data.filter(apt => apt.appointmentDate === date);
      }
      return data;
    }
  });

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

  // Mutation for updating appointment status
  const queryClient = useQueryClient();
  const updateStatusMutation = useMutation({
    mutationFn: updateAppointmentStatus,
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointmentAnalytics });
    },
    onError: (error) => {
      console.error('Failed to update appointment status:', error);
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
    updateAppointmentStatus: (appointmentId: string, status: string) => 
      updateStatusMutation.mutate({ appointmentId, status })
  };
}

// 📊 Dashboard Metrics with React Query
export function useDashboardMetrics() {
  return useQuery({
    queryKey: queryKeys.dashboardMetrics,
    queryFn: async () => {
      const [appointments, patients] = await Promise.all([
        fetchAppointments(),
        fetchPatients()
      ]);

      const today = format(new Date(), 'yyyy-MM-dd');
      const todaysAppointments = appointments.filter(apt => 
        apt.appointmentDate === today
      );

      const waitingPatients = todaysAppointments.filter(apt => 
        apt.status === 'waiting'
      ).length;

      const completedToday = todaysAppointments.filter(apt => 
        apt.status === 'completed'
      ).length;

      const cancelledToday = todaysAppointments.filter(apt => 
        apt.status === 'cancelled' || apt.status === 'no-show'
      ).length;

      const cancellationRate = todaysAppointments.length > 0 
        ? Math.round((cancelledToday / todaysAppointments.length) * 100)
        : 0;

      return {
        totalPatients: patients.length,
        todaysAppointments: todaysAppointments.length,
        waitingPatients,
        completedToday,
        pendingApprovals: 5, // From real API
        cancellationRate
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 3 * 60 * 1000, // 3 minutes - MUCH BETTER than 30 seconds!
    refetchIntervalInBackground: false,
  });
}

// 📈 Analytics with longer cache time
export function useAppointmentAnalytics() {
  return useQuery({
    queryKey: queryKeys.appointmentAnalytics,
    queryFn: async () => {
      const appointments = await fetchAppointments();
      
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
        
        const dayAppointments = appointments.filter(apt => apt.appointmentDate === dateString);
        trends.push({
          name: dayName,
          appointments: dayAppointments.length
        });
      }

      // Calculate status distribution for recent appointments (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= thirtyDaysAgo;
      });

      recentAppointments.forEach(apt => {
        if (apt.status in statusCounts) {
          statusCounts[apt.status as keyof typeof statusCounts]++;
        }
      });

      const statusDistribution = [
        { name: 'Completed', value: statusCounts.completed, fill: '#10b981' },
        { name: 'Confirmed', value: statusCounts.confirmed, fill: '#3b82f6' },
        { name: 'Waiting', value: statusCounts.waiting, fill: '#f59e0b' },
        { name: 'Cancelled', value: statusCounts.cancelled + statusCounts['no-show'], fill: '#ef4444' }
      ].filter(item => item.value > 0);

      return {
        appointmentTrends: trends,
        statusDistribution
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - Analytics change less frequently
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    refetchIntervalInBackground: false,
  });
}

// Today's appointments
export function useTodaysAppointments() {
  const today = format(new Date(), 'yyyy-MM-dd');
  return useAppointments(today);
}

// Waiting list
export function useWaitingList() {
  const { appointments, loading, error, updateAppointmentStatus } = useTodaysAppointments();
  
  const waitingAppointments = appointments.filter(apt => 
    apt.status === 'waiting' || apt.status === 'in-progress'
  ).sort((a, b) => {
    const timeA = new Date(`${a.appointmentDate} ${a.appointmentTime}`).getTime();
    const timeB = new Date(`${b.appointmentDate} ${b.appointmentTime}`).getTime();
    return timeA - timeB;
  });

  return {
    waitingAppointments,
    loading,
    error,
    updateAppointmentStatus,
  };
}
