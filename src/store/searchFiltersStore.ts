import { create } from 'zustand';

interface SearchFiltersState {
  specialties: string[];
  clinicId: string;
  consultationType: string;
  sort: 'rating' | 'nearest' | 'earliest';
  location: string;
  radius: number;
  setSpecialties: (specialties: string[]) => void;
  setClinicId: (clinicId: string) => void;
  setConsultationType: (consultationType: string) => void;
  setSort: (sort: 'rating' | 'nearest' | 'earliest') => void;
  setLocation: (location: string) => void;
  setRadius: (radius: number) => void;
  reset: () => void;
}

const initialState = {
  specialties: [],
  clinicId: 'all',
  consultationType: 'all',
  sort: 'rating' as const,
  location: '',
  radius: 10,
};

export const useSearchFiltersStore = create<SearchFiltersState>((set) => ({
  ...initialState,
  setSpecialties: (specialties) => set({ specialties }),
  setClinicId: (clinicId) => set({ clinicId }),
  setConsultationType: (consultationType) => set({ consultationType }),
  setSort: (sort) => set({ sort }),
  setLocation: (location) => set({ location }),
  setRadius: (radius) => set({ radius }),
  reset: () => set(initialState),
}));
