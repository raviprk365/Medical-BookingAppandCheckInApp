/**
 * Database utility functions for managing db.json
 * Provides functions to read, write, and update patient and appointment data
 */

import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db.json');

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
  status: string;
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

export interface DatabaseData {
  patients: Patient[];
  appointments: Appointment[];
  clinics: any[];
  specialties: any[];
  practitioners: any[];
}

// Read database
export function readDatabase(): DatabaseData {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    throw new Error('Failed to read database');
  }
}

// Write database
export function writeDatabase(data: DatabaseData): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing database:', error);
    throw new Error('Failed to write database');
  }
}

// Generate unique ID
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}${timestamp}-${random}`;
}

// Patient operations
export function getAllPatients(): Patient[] {
  const db = readDatabase();
  return db.patients || [];
}

export function getPatientById(id: string): Patient | null {
  const patients = getAllPatients();
  return patients.find(patient => patient.id === id) || null;
}

export function getPatientByEmail(email: string): Patient | null {
  const patients = getAllPatients();
  return patients.find(patient => patient.email === email) || null;
}

export function createPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient {
  const db = readDatabase();
  const now = new Date().toISOString();
  
  const newPatient: Patient = {
    ...patientData,
    id: generateId('patient-'),
    createdAt: now,
    updatedAt: now
  };

  db.patients = db.patients || [];
  db.patients.push(newPatient);
  writeDatabase(db);
  
  return newPatient;
}

export function updatePatient(id: string, updates: Partial<Omit<Patient, 'id' | 'createdAt'>>): Patient | null {
  const db = readDatabase();
  const patientIndex = db.patients?.findIndex(patient => patient.id === id) ?? -1;
  
  if (patientIndex === -1) {
    return null;
  }

  const updatedPatient = {
    ...db.patients[patientIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  db.patients[patientIndex] = updatedPatient;
  writeDatabase(db);
  
  return updatedPatient;
}

// Appointment operations
export function getAllAppointments(): Appointment[] {
  const db = readDatabase();
  return db.appointments || [];
}

export function getAppointmentById(id: string): Appointment | null {
  const appointments = getAllAppointments();
  return appointments.find(appointment => appointment.id === id) || null;
}

export function getAppointmentsByPatientId(patientId: string): Appointment[] {
  const appointments = getAllAppointments();
  return appointments.filter(appointment => appointment.patientId === patientId);
}

export function getAppointmentsByDate(date: string): Appointment[] {
  const appointments = getAllAppointments();
  return appointments.filter(appointment => appointment.appointmentDate === date);
}

export function getAppointmentsByPractitioner(practitionerId: string, date?: string): Appointment[] {
  const appointments = getAllAppointments();
  return appointments.filter(appointment => {
    if (date) {
      return appointment.practitionerId === practitionerId && appointment.appointmentDate === date;
    }
    return appointment.practitionerId === practitionerId;
  });
}

export function createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'confirmationCode'>): Appointment {
  const db = readDatabase();
  const now = new Date().toISOString();
  
  const newAppointment: Appointment = {
    ...appointmentData,
    id: generateId('apt-'),
    confirmationCode: generateConfirmationCode(),
    createdAt: now,
    updatedAt: now
  };

  db.appointments = db.appointments || [];
  db.appointments.push(newAppointment);
  writeDatabase(db);
  
  return newAppointment;
}

export function updateAppointment(id: string, updates: Partial<Omit<Appointment, 'id' | 'createdAt' | 'confirmationCode'>>): Appointment | null {
  const db = readDatabase();
  const appointmentIndex = db.appointments?.findIndex(appointment => appointment.id === id) ?? -1;
  
  if (appointmentIndex === -1) {
    return null;
  }

  const updatedAppointment = {
    ...db.appointments[appointmentIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  db.appointments[appointmentIndex] = updatedAppointment;
  writeDatabase(db);
  
  return updatedAppointment;
}

export function deleteAppointment(id: string): boolean {
  const db = readDatabase();
  const appointmentIndex = db.appointments?.findIndex(appointment => appointment.id === id) ?? -1;
  
  if (appointmentIndex === -1) {
    return false;
  }

  db.appointments.splice(appointmentIndex, 1);
  writeDatabase(db);
  
  return true;
}

// Utility functions
export function generateConfirmationCode(): string {
  const prefix = 'APT';
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${random}`;
}

// Check appointment conflicts
export function checkAppointmentConflict(
  practitionerId: string, 
  date: string, 
  time: string, 
  duration: number,
  excludeAppointmentId?: string
): boolean {
  const appointments = getAppointmentsByPractitioner(practitionerId, date);
  
  // Parse time to minutes
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
    if (excludeAppointmentId && appointment.id === excludeAppointmentId) {
      continue;
    }

    const existingStartMinutes = timeToMinutes(appointment.appointmentTime);
    const existingEndMinutes = existingStartMinutes + appointment.duration;

    // Check for overlap
    if (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes) {
      return true; // Conflict found
    }
  }

  return false; // No conflict
}
