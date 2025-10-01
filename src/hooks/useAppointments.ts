'use client';

import { useState, useEffect } from 'react';
import { format, isToday, parseISO } from 'date-fns';

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
const API_BASE = 'http://localhost:3003';

// Custom hook for fetching appointments
export function useAppointments(date?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [appointmentsRes, patientsRes, practitionersRes] = await Promise.all([
        fetch(`${API_BASE}/appointments`),
        fetch(`${API_BASE}/patients`),
        fetch(`${API_BASE}/practitioners`)
      ]);

      if (!appointmentsRes.ok || !patientsRes.ok || !practitionersRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [appointmentsData, patientsData, practitionersData] = await Promise.all([
        appointmentsRes.json(),
        patientsRes.json(),
        practitionersRes.json()
      ]);

      setAppointments(appointmentsData);
      setPatients(patientsData);
      setPractitioners(practitionersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get enriched appointments with patient and practitioner data
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

  // Filter by date if provided
  const filteredAppointments = date 
    ? enrichedAppointments.filter(apt => apt.appointmentDate === date)
    : enrichedAppointments;

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          updatedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }

      // Refresh data
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appointment');
    }
  };

  return {
    appointments: filteredAppointments,
    patients,
    practitioners,
    loading,
    error,
    refetch: fetchData,
    updateAppointmentStatus
  };
}

// Custom hook for dashboard metrics
export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState({
    totalPatients: 0,
    todaysAppointments: 0,
    waitingPatients: 0,
    completedToday: 0,
    pendingApprovals: 0,
    cancellationRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        const [appointmentsRes, patientsRes] = await Promise.all([
          fetch(`${API_BASE}/appointments`),
          fetch(`${API_BASE}/patients`)
        ]);

        if (!appointmentsRes.ok || !patientsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [appointments, patients] = await Promise.all([
          appointmentsRes.json(),
          patientsRes.json()
        ]);

        const today = format(new Date(), 'yyyy-MM-dd');
        const todaysAppointments = appointments.filter((apt: Appointment) => 
          apt.appointmentDate === today
        );

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

        setMetrics({
          totalPatients: patients.length,
          todaysAppointments: todaysAppointments.length,
          waitingPatients,
          completedToday,
          pendingApprovals: 5, // This would come from a real API
          cancellationRate
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  return { metrics, loading, error };
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
