import { create } from 'zustand';

// Enhanced booking data structure for step-by-step flow
interface BookingData {
  // Step 1: Who booking for
  bookingFor: 'myself' | 'someone-else';
  relationship: string;
  
  // Step 2: Patient details
  patientType: 'existing' | 'new';
  patientId: string | null;
  patientDetails: {
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
  };
  
  // Step 3: Appointment reason and duration
  appointmentReason: string;
  appointmentType: string;
  duration: number; // in minutes
  urgency: 'routine' | 'urgent' | 'emergency';
  
  // Step 4: Doctor selection
  specialtyRequired: string;
  doctorPreference: 'any' | 'specific';
  practitionerId: string | null;
  
  // Step 5: Date and time
  selectedDate: Date | null;
  selectedTime: string | null;
  alternativeTimes: string[];
  
  // Step 6: Additional details
  symptoms: string;
  medications: string;
  allergies: string;
  notes: string;
  
  // Confirmation
  confirmed: boolean;
  confirmationCode: string;
  bookingId: string | null;
}

interface BookingState {
  currentStep: string;
  patientId: string | null;
  clinicId: string | null;
  serviceId: string | null;
  practitionerId: string | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  reason: string;
  notes: string;
  patient: any;
  selectedClinic: any;
  selectedPractitioner: any;
  selectedService: any;
  
  // Enhanced booking data for new flow
  bookingData: BookingData;
  
  // Setters
  setCurrentStep: (step: string) => void;
  setPatientId: (id: string | null) => void;
  setClinicId: (id: string | null) => void;
  setServiceId: (id: string | null) => void;
  setPractitionerId: (id: string | null) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTime: (time: string | null) => void;
  setReason: (reason: string) => void;
  setNotes: (notes: string) => void;
  setPatient: (patient: any) => void;
  setSelectedClinic: (clinic: any) => void;
  setSelectedPractitioner: (practitioner: any) => void;
  setSelectedService: (service: any) => void;
  
  // Enhanced booking data methods
  updateBookingData: (data: Partial<BookingData>) => void;
  
  // Convenience methods
  setClinic: (id: string) => void;
  setService: (id: string) => void;
  setPractitioner: (id: string) => void;
  setDateTime: (date: Date, time: string) => void;
  
  // Reset
  reset: () => void;
  resetBooking: () => void;
}

const initialBookingData: BookingData = {
  bookingFor: 'myself',
  relationship: '',
  patientType: 'existing',
  patientId: null,
  patientDetails: {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  },
  appointmentReason: '',
  appointmentType: '',
  duration: 30,
  urgency: 'routine',
  specialtyRequired: '',
  doctorPreference: 'any',
  practitionerId: null,
  selectedDate: null,
  selectedTime: null,
  alternativeTimes: [],
  symptoms: '',
  medications: '',
  allergies: '',
  notes: '',
  confirmed: false,
  confirmationCode: '',
  bookingId: null
};

const initialState = {
  currentStep: 'booking-for',
  patientId: null,
  clinicId: null,
  serviceId: null,
  practitionerId: null,
  selectedDate: null,
  selectedTime: null,
  reason: '',
  notes: '',
  patient: null,
  selectedClinic: null,
  selectedPractitioner: null,
  selectedService: null,
  bookingData: initialBookingData,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,
  
  // Basic setters
  setCurrentStep: (currentStep) => set({ currentStep }),
  setPatientId: (patientId) => set({ patientId }),
  setClinicId: (clinicId) => set({ clinicId }),
  setServiceId: (serviceId) => set({ serviceId }),
  setPractitionerId: (practitionerId) => set({ practitionerId }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSelectedTime: (selectedTime) => set({ selectedTime }),
  setReason: (reason) => set({ reason }),
  setNotes: (notes) => set({ notes }),
  setPatient: (patient) => set({ patient }),
  setSelectedClinic: (selectedClinic) => set({ selectedClinic, clinicId: selectedClinic?.id }),
  setSelectedPractitioner: (selectedPractitioner) => set({ selectedPractitioner, practitionerId: selectedPractitioner?.id }),
  setSelectedService: (selectedService) => set({ selectedService, serviceId: selectedService?.id }),
  
  // Enhanced booking data methods
  updateBookingData: (data) => set((state) => ({
    bookingData: { ...state.bookingData, ...data }
  })),
  
  // Convenience methods
  setClinic: (id: string) => set({ clinicId: id }),
  setService: (id: string) => set({ serviceId: id }),
  setPractitioner: (id: string) => set({ practitionerId: id }),
  setDateTime: (date: Date, time: string) => set({ selectedDate: date, selectedTime: time }),
  
  // Reset methods
  reset: () => set(initialState),
  resetBooking: () => set(initialState),
}));
