/**
 * Booking service for handling appointment creation and patient management
 * Integrates with the database API to save booking details
 */

import { BookingData } from '@/store/bookingStore';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface Patient {
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
}

interface Appointment {
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
  status: string;
  notes: string;
  medications: string;
  allergies: string;
  symptoms: string;
  bookingFor: string;
  relationship: string;
  confirmationCode: string;
}

class BookingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  }

  // Check if patient exists by email
  async findPatientByEmail(email: string): Promise<Patient | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/patients?email=${encodeURIComponent(email)}`);
      
      if (response.status === 404) {
        return null; // Patient not found
      }
      
      if (!response.ok) {
        throw new Error(`Failed to find patient: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error finding patient:', error);
      return null;
    }
  }

  // Create new patient
  async createPatient(patientData: Omit<Patient, 'id'>): Promise<Patient> {
    try {
      const response = await fetch(`${this.baseUrl}/api/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to create patient: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  // Update existing patient
  async updatePatient(patientId: string, updates: Partial<Patient>): Promise<Patient> {
    try {
      const response = await fetch(`${this.baseUrl}/api/patients?id=${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to update patient: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  // Create appointment
  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'confirmationCode'>): Promise<Appointment> {
    try {
      const response = await fetch(`${this.baseUrl}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to create appointment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  // Check appointment availability
  async checkAvailability(practitionerId: string, date: string, time: string, duration: number): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/appointments?practitionerId=${practitionerId}&date=${date}`
      );

      if (!response.ok) {
        return false;
      }

      const appointments = await response.json();
      
      // Simple conflict check (this could be moved to a dedicated API endpoint)
      const timeToMinutes = (timeStr: string) => {
        const [timeOnly, period] = timeStr.toLowerCase().split(' ');
        let [hours, minutes] = timeOnly.split(':').map(Number);
        
        if (period === 'pm' && hours !== 12) {
          hours += 12;
        } else if (period === 'am' && hours === 12) {
          hours = 0;
        }
        
        return hours * 60 + minutes;
      };

      const newStartMinutes = timeToMinutes(time);
      const newEndMinutes = newStartMinutes + duration;

      for (const appointment of appointments) {
        const existingStartMinutes = timeToMinutes(appointment.appointmentTime);
        const existingEndMinutes = existingStartMinutes + appointment.duration;

        if (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes) {
          return false; // Conflict found
        }
      }

      return true; // No conflict
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }

  // Complete booking process
  async completeBooking(bookingData: BookingData): Promise<{ patient: Patient; appointment: Appointment }> {
    try {
      // Step 1: Handle patient data
      let patient: Patient;
      
      if (bookingData.patientType === 'existing' && bookingData.patientId) {
        // For existing patients, update their information
        const updates = {
          firstName: bookingData.patientDetails.firstName,
          lastName: bookingData.patientDetails.lastName,
          dateOfBirth: bookingData.patientDetails.dateOfBirth,
          phone: bookingData.patientDetails.phone,
          email: bookingData.patientDetails.email,
          address: bookingData.patientDetails.address,
          emergencyContact: bookingData.patientDetails.emergencyContact,
          medicalHistory: {
            allergies: bookingData.allergies,
            medications: bookingData.medications,
            conditions: [] // Could be extracted from symptoms or maintained separately
          }
        };
        
        patient = await this.updatePatient(bookingData.patientId, updates);
      } else {
        // Check if patient already exists by email
        const existingPatient = await this.findPatientByEmail(bookingData.patientDetails.email);
        
        if (existingPatient) {
          // Update existing patient
          const updates = {
            firstName: bookingData.patientDetails.firstName,
            lastName: bookingData.patientDetails.lastName,
            dateOfBirth: bookingData.patientDetails.dateOfBirth,
            phone: bookingData.patientDetails.phone,
            address: bookingData.patientDetails.address,
            emergencyContact: bookingData.patientDetails.emergencyContact,
            medicalHistory: {
              allergies: bookingData.allergies,
              medications: bookingData.medications,
              conditions: existingPatient.medicalHistory.conditions // Preserve existing conditions
            }
          };
          
          patient = await this.updatePatient(existingPatient.id, updates);
        } else {
          // Create new patient
          const newPatientData = {
            firstName: bookingData.patientDetails.firstName,
            lastName: bookingData.patientDetails.lastName,
            dateOfBirth: bookingData.patientDetails.dateOfBirth,
            phone: bookingData.patientDetails.phone,
            email: bookingData.patientDetails.email,
            address: bookingData.patientDetails.address,
            emergencyContact: bookingData.patientDetails.emergencyContact,
            medicalHistory: {
              allergies: bookingData.allergies,
              medications: bookingData.medications,
              conditions: []
            }
          };
          
          patient = await this.createPatient(newPatientData);
        }
      }

      // Step 2: Create appointment
      const appointmentData = {
        patientId: patient.id,
        practitionerId: bookingData.practitionerId || '',
        clinicId: 'clinic-1', // Default clinic, could be determined from practitioner
        appointmentDate: bookingData.appointmentDate || new Date().toISOString().split('T')[0],
        appointmentTime: bookingData.selectedTime || '',
        duration: bookingData.duration,
        appointmentType: bookingData.appointmentType,
        reason: bookingData.appointmentReason,
        urgency: bookingData.urgency,
        status: 'confirmed',
        notes: bookingData.notes,
        medications: bookingData.medications,
        allergies: bookingData.allergies,
        symptoms: bookingData.symptoms,
        bookingFor: bookingData.bookingFor,
        relationship: bookingData.relationship
      };

      const appointment = await this.createAppointment(appointmentData);

      return { patient, appointment };
    } catch (error) {
      console.error('Error completing booking:', error);
      throw error;
    }
  }
}

export const bookingService = new BookingService();
export default bookingService;
