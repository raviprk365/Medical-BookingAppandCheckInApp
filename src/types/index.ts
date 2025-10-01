// Common types for the Medical Booking App

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
  };
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  email: string;
  phone: string;
  availableSlots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  reasonForVisit: string;
}

export interface CheckInStatus {
  appointmentId: string;
  checkedInAt?: Date;
  status: 'pending' | 'checked-in' | 'ready' | 'called';
  estimatedWaitTime?: number;
}

export type AppointmentStatus = Appointment['status'];
export type CheckInStatusType = CheckInStatus['status'];
