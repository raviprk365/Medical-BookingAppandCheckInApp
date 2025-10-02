const API_BASE_URL = 'http://localhost:3001';

// Generic fetch wrapper
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

// Clinics
export const getClinics = () => fetchAPI<any[]>('/clinics');
export const getClinic = (id: string) => fetchAPI<any>(`/clinics/${id}`);

// Practitioners
export const getPractitioners = (clinicId?: string) => {
  const query = clinicId ? `?clinicId=${clinicId}` : '';
  return fetchAPI<any[]>(`/practitioners${query}`);
};
export const getPractitioner = (id: string) => fetchAPI<any>(`/practitioners/${id}`);

export const searchPractitioners = (params: {
  specialty?: string[];
  clinicId?: string;
  consultationType?: string;
  sort?: 'nearest' | 'earliest' | 'rating';
}) => {
  const query = new URLSearchParams();
  if (params.specialty?.length) {
    params.specialty.forEach(s => query.append('specialties_like', s));
  }
  if (params.clinicId && params.clinicId !== 'all') query.append('clinicId', params.clinicId);
  if (params.consultationType && params.consultationType !== 'all') query.append('consultationTypes_like', params.consultationType);
  
  const queryString = query.toString();
  return fetchAPI<any[]>(`/practitioners${queryString ? `?${queryString}` : ''}`);
};

// Specialties
export const getSpecialties = () => fetchAPI<any[]>('/specialties');

// Services
export const getServices = (clinicId?: string) => {
  const query = clinicId ? `?clinicId=${clinicId}` : '';
  return fetchAPI<any[]>(`/services${query}`);
};
export const getService = (id: string) => fetchAPI<any>(`/services/${id}`);

// Patients
export const getPatients = () => fetchAPI<any[]>('/patients');
export const getPatient = (id: string) => fetchAPI<any>(`/patients/${id}`);
export const searchPatients = (query: string) => 
  fetchAPI<any[]>(`/patients?q=${encodeURIComponent(query)}`);
export const createPatient = (data: any) => 
  fetchAPI<any>('/patients', { method: 'POST', body: JSON.stringify(data) });
export const updatePatient = (id: string, data: any) => 
  fetchAPI<any>(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

// Bookings
export const getBookings = (params?: { clinicId?: string; patientId?: string; date?: string }) => {
  const query = new URLSearchParams();
  if (params?.clinicId) query.append('clinicId', params.clinicId);
  if (params?.patientId) query.append('patientId', params.patientId);
  if (params?.date) query.append('startISO_like', params.date);
  
  const queryString = query.toString();
  return fetchAPI<any[]>(`/bookings${queryString ? `?${queryString}` : ''}`);
};

export const getBooking = (id: string) => fetchAPI<any>(`/bookings/${id}`);

export const createBooking = (data: any) => 
  fetchAPI<any>('/bookings', { method: 'POST', body: JSON.stringify(data) });

export const updateBooking = (id: string, data: any) => 
  fetchAPI<any>(`/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteBooking = (id: string) => 
  fetchAPI<void>(`/bookings/${id}`, { method: 'DELETE' });

// Users
export const getUsers = () => fetchAPI<any[]>('/users');
export const getUser = (id: string) => fetchAPI<any>(`/users/${id}`);
