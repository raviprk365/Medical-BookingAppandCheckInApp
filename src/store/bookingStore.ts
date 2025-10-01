import { create } from 'zustand';

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
  
  // Convenience methods
  setClinic: (id: string) => void;
  setService: (id: string) => void;
  setPractitioner: (id: string) => void;
  setDateTime: (date: Date, time: string) => void;
  
  // Reset
  reset: () => void;
  resetBooking: () => void;
}

const initialState = {
  currentStep: 'patient',
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
  
  // Convenience methods
  setClinic: (id: string) => set({ clinicId: id }),
  setService: (id: string) => set({ serviceId: id }),
  setPractitioner: (id: string) => set({ practitionerId: id }),
  setDateTime: (date: Date, time: string) => set({ selectedDate: date, selectedTime: time }),
  
  // Reset methods
  reset: () => set(initialState),
  resetBooking: () => set(initialState),
}));
