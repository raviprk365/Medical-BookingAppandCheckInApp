/**
 * Step 4: Practitioner Selection with Date & Time - Combined practitioner and appointment scheduling
 * Shows practitioners with integrated calendar and time slot selection
 */

'use client';

import { useState, useEffect } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { 
  Star, 
  Clock, 
  Calendar as CalendarIcon,
  ArrowRight, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface PractitionerSelectionStepProps {
  onNext: () => void;
  onPrevious: () => void;
  goToStep: (stepId: string) => void;
}

// Mock practitioners data
const MOCK_PRACTITIONERS = [
  {
    id: 'prac-1', // Updated to match database ID
    name: 'Dr Sarah Chen',
    title: 'MBBS, FRACGP',
    specialty: 'General Practice',
    gender: 'Female',
    qualifications: 'MBBS, FRACGP',
    rating: 4.8,
    reviews: 156,
    avatar: '/api/placeholder/100/100',
    languages: ['English'],
    description: 'Dr. Chen has over 15 years of experience in family medicine with a special interest in women\'s health and preventive care.',
    specialties: ['General Practice', 'Women\'s Health', 'Travel Medicine'],
    website: 'www.drsarahchen.com.au',
    billing: 'privately billed with Medicare rebate'
  },
  {
    id: 'prac-2',
    name: 'Dr Laurence Zalokar',
    title: 'MBBS',
    specialty: 'General Practitioner',
    gender: 'Male',
    qualifications: 'MBBS',
    rating: 4.7,
    reviews: 89,
    avatar: '/api/placeholder/100/100',
    languages: ['English'],
    description: 'Dr Laurence Zalokar is a bulk billing GP, his appointments are 10 minutes. Dr Laurence Zalokar does not prescribe Cannabis.',
    specialties: ['General Practice'],
    website: 'www.drlaurencezalokar.com.au',
    billing: 'bulk billing'
  }
];

// Generate time slots for a given date with proper availability logic
const generateTimeSlots = (date: Date, selectedPractitioner: any, appointmentDuration: number = 30) => {
  const slots: { time: string; available: boolean; reason?: string }[] = [];
  const dayOfWeek = date.getDay();
  
  // Skip weekends for this example (can be made configurable)
  if (dayOfWeek === 0 || dayOfWeek === 6) return [];
  
  // Get day name for availability check
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek];
  
  // Find practitioner in practitioners data to get real availability
  const practitionerId = selectedPractitioner?.id;
  let practitionerSchedule: any = null;

  // Mock practitioner schedules (in real app, this would come from API)
  const practitionerSchedules: Record<string, any> = {
    '1': { // Dr Sue Raju
      availability: {
        monday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
        tuesday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
        wednesday: [{ start: '09:00', end: '12:00' }, { start: '15:00', end: '18:00' }],
        thursday: [{ start: '14:00', end: '19:00' }],
        friday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '16:00' }],
      },
      breaks: [{ start: '13:00', end: '14:00' }], // Lunch break
      existingBookings: [
        { date: '2025-10-02', start: '09:00', duration: 30 }, // 9:00-9:30am booked
        { date: '2025-10-02', start: '12:30', duration: 30 }, // 12:30-1:00pm booked
        { date: '2025-10-03', start: '15:00', duration: 30 }  // 3:00-3:30pm booked
      ]
    },
    '2': { // Dr Laurence Zalokar
      availability: {
        monday: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '16:00' }],
        tuesday: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '16:00' }],
        wednesday: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }],
        thursday: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '16:00' }],
        friday: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '15:00' }],
      },
      breaks: [{ start: '12:00', end: '13:00' }], // Lunch break
      existingBookings: [
        { date: '2025-10-02', start: '14:30', duration: 10 }, // 2:30-2:40pm booked (10 min appt)
        { date: '2025-10-02', start: '15:00', duration: 10 }  // 3:00-3:10pm booked
      ]
    }
  };

  practitionerSchedule = practitionerSchedules[practitionerId] || practitionerSchedules['1'];
  
  // Get practitioner's availability for the day
  const dayAvailability = practitionerSchedule.availability[dayName] || [];
  if (dayAvailability.length === 0) {
    return []; // Practitioner not available on this day
  }

  // Convert time string to minutes (e.g., "9:30" -> 570)
  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes to time string (e.g., 570 -> "9:30 am")
  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  // Get date string for booking comparison
  const dateStr = date.toISOString().split('T')[0];

  // Generate slots for each availability window
  for (const window of dayAvailability) {
    const startMinutes = timeToMinutes(window.start);
    const endMinutes = timeToMinutes(window.end);
    
    // Generate slots at intervals based on appointment duration
    // Use the actual appointment duration as interval to prevent overlaps
    const slotInterval = appointmentDuration;
    
    for (let currentTime = startMinutes; currentTime + appointmentDuration <= endMinutes; currentTime += slotInterval) {
      const slotEndTime = currentTime + appointmentDuration;
      let isAvailable = true;
      let reason = '';

      // Check if slot conflicts with practitioner's breaks
      for (const breakTime of practitionerSchedule.breaks) {
        const breakStart = timeToMinutes(breakTime.start);
        const breakEnd = timeToMinutes(breakTime.end);
        
        // If appointment starts before break ends AND ends after break starts = conflict
        if (currentTime < breakEnd && slotEndTime > breakStart) {
          isAvailable = false;
          reason = 'Practitioner break';
          break;
        }
      }

      // Check if slot conflicts with existing bookings for this specific date
      if (isAvailable) {
        for (const booking of practitionerSchedule.existingBookings) {
          if (booking.date === dateStr) {
            const bookingStart = timeToMinutes(booking.start);
            const bookingEnd = bookingStart + booking.duration;
            
            // If new appointment overlaps with existing booking
            if (currentTime < bookingEnd && slotEndTime > bookingStart) {
              isAvailable = false;
              reason = 'Already booked';
              break;
            }
          }
        }
      }

      // Add buffer time (5 minutes) between appointments
      if (isAvailable) {
        for (const booking of practitionerSchedule.existingBookings) {
          if (booking.date === dateStr) {
            const bookingStart = timeToMinutes(booking.start);
            const bookingEnd = bookingStart + booking.duration;
            
            // Check if there's at least 5 minutes gap
            if ((currentTime >= bookingEnd && currentTime < bookingEnd + 5) ||
                (slotEndTime > bookingStart - 5 && slotEndTime <= bookingStart)) {
              isAvailable = false;
              reason = 'Insufficient gap between appointments';
              break;
            }
          }
        }
      }

      // Check if appointment would run past the availability window
      if (isAvailable && slotEndTime > endMinutes) {
        isAvailable = false;
        reason = 'Insufficient time in availability window';
      }

      slots.push({
        time: minutesToTime(currentTime),
        available: isAvailable,
        reason: !isAvailable ? reason : undefined
      });
    }
  }

  // Return only available slots, but keep unavailable for "see all times" view
  return slots;
};

// Async version that fetches real appointments from database
const generateTimeSlotsAsync = async (date: Date, selectedDoctor: any, appointmentDuration: number = 30) => {
  const slots: { time: string; available: boolean; reason?: string }[] = [];
  const dayOfWeek = date.getDay();
  
  // Skip weekends for this example (can be made configurable)
  if (dayOfWeek === 0 || dayOfWeek === 6) return [];
  
  // Get day name for availability check
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek];
  
  // Find doctor in practitioners data to get real availability
  const doctorId = selectedDoctor?.id;
  let doctorSchedule: any = null;
  
  // Fetch real practitioner data from API
  try {
    const response = await fetch(`/api/practitioners/${doctorId}/booking`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        doctorSchedule = result.data;
        console.log('Fetched practitioner schedule for', doctorId, ':', doctorSchedule);
      }
    }
  } catch (error) {
    console.error('Failed to fetch practitioner schedule:', error);
  }

  // Fallback to mock data if API fails
  if (!doctorSchedule) {
    const doctorSchedules: Record<string, any> = {
      'prac-1': { // Dr Sarah Chen
        availability: {
          monday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '12:00' }, { start: '15:00', end: '18:00' }],
          thursday: [{ start: '14:00', end: '19:00' }],
          friday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '16:00' }],
        },
        breaks: [{ start: '12:30', end: '13:00' }], // Lunch break
        exceptions: []
      },
      'prac-2': { // Dr Laurence Zalokar
        availability: {
          monday: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '16:00' }],
          tuesday: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '16:00' }],
          wednesday: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }],
          thursday: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '16:00' }],
          friday: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '15:00' }],
        },
        breaks: [{ start: '12:00', end: '13:00' }], // Lunch break
        exceptions: []
      }
    };
    
    doctorSchedule = doctorSchedules[doctorId] || doctorSchedules['prac-1'];
  }
  
  // Get doctor's availability for the day
  const dayAvailabilityData = doctorSchedule.availability[dayName];
  let dayAvailability: any[] = [];
  
  if (dayAvailabilityData) {
    if (Array.isArray(dayAvailabilityData)) {
      // Already an array (from fallback mock data)
      dayAvailability = dayAvailabilityData;
    } else if (typeof dayAvailabilityData === 'object') {
      // Database format with numbered keys like "0", "1", "2"
      dayAvailability = [];
      
      // Extract numbered availability slots
      for (let i = 0; i < 10; i++) { // Check up to 10 slots
        const slot = dayAvailabilityData[i.toString()];
        if (slot && slot.start && slot.end) {
          dayAvailability.push({ start: slot.start, end: slot.end });
        }
      }
      
      // Also check for sessions array as backup
      if (dayAvailability.length === 0 && dayAvailabilityData.sessions) {
        dayAvailability = dayAvailabilityData.sessions;
      }
    }
  }
  
  if (dayAvailability.length === 0) {
    return []; // Doctor not available on this day
  }

  // Fetch real appointments from API for this doctor and date
  let existingBookings: any[] = [];
  try {
    const dateStr = date.toISOString().split('T')[0];
    const response = await fetch(`/api/appointments?practitionerId=${doctorId}&date=${dateStr}`);
    if (response.ok) {
      existingBookings = await response.json();
      console.log('Fetched existing bookings for', doctorId, 'on', dateStr, ':', existingBookings);
    }
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    // Continue with empty bookings array
  }

  // Convert time string to minutes (e.g., "9:30" -> 570)
  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes to time string (e.g., 570 -> "9:30 am")
  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  // Parse appointment time string to minutes (handles both "9:00 am" and "09:00" formats)
  const parseAppointmentTime = (timeStr: string) => {
    const lowerTime = timeStr.toLowerCase().trim();
    
    if (lowerTime.includes('am') || lowerTime.includes('pm')) {
      // Format: "9:00 am" or "2:30 pm"
      const [timeOnly, period] = lowerTime.split(' ');
      let [hours, minutes] = timeOnly.split(':').map(Number);
      
      if (period === 'pm' && hours !== 12) {
        hours += 12;
      } else if (period === 'am' && hours === 12) {
        hours = 0;
      }
      
      return hours * 60 + minutes;
    } else {
      // Format: "09:00" or "14:30"
      const [hours, minutes] = lowerTime.split(':').map(Number);
      return hours * 60 + minutes;
    }
  };

  // Generate slots for each availability window
  for (const window of dayAvailability) {
    const startMinutes = timeToMinutes(window.start);
    const endMinutes = timeToMinutes(window.end);
    
    // Generate slots at intervals based on appointment duration
    // Use the actual appointment duration as interval to prevent overlaps
    const slotInterval = appointmentDuration;
    
    for (let currentTime = startMinutes; currentTime + appointmentDuration <= endMinutes; currentTime += slotInterval) {
      const slotEndTime = currentTime + appointmentDuration;
      let isAvailable = true;
      let reason = '';

      // Check if slot conflicts with doctor's breaks
      if (isAvailable && doctorSchedule.breaks) {
        for (const breakTime of doctorSchedule.breaks) {
          const breakStart = timeToMinutes(breakTime.start);
          const breakEnd = timeToMinutes(breakTime.end);
          
          // If appointment starts before break ends AND ends after break starts = conflict
          if (currentTime < breakEnd && slotEndTime > breakStart) {
            isAvailable = false;
            reason = 'Doctor break';
            break;
          }
        }
      }

      // Check if slot conflicts with date-specific exceptions (like meetings)
      if (isAvailable && doctorSchedule.exceptions) {
        const dateStr = date.toISOString().split('T')[0];
        const dayException = doctorSchedule.exceptions.find((exc: any) => exc.date === dateStr);
        
        if (dayException && dayException.startTime && dayException.endTime) {
          const excStart = timeToMinutes(dayException.startTime);
          const excEnd = timeToMinutes(dayException.endTime);
          
          // If appointment overlaps with exception
          if (currentTime < excEnd && slotEndTime > excStart) {
            isAvailable = false;
            reason = dayException.name || 'Unavailable';
            break;
          }
        }
      }

      // Check if slot conflicts with existing bookings from database
      if (isAvailable) {
        for (const booking of existingBookings) {
          try {
            const bookingStart = parseAppointmentTime(booking.appointmentTime);
            const bookingEnd = bookingStart + booking.duration;
            
            // If new appointment overlaps with existing booking
            if (currentTime < bookingEnd && slotEndTime > bookingStart) {
              isAvailable = false;
              reason = `Already booked (${booking.appointmentTime})`;
              break;
            }
          } catch (error) {
            console.error('Error parsing appointment time:', booking.appointmentTime, error);
          }
        }
      }

      // Add buffer time (5 minutes) between appointments
      if (isAvailable) {
        for (const booking of existingBookings) {
          try {
            const bookingStart = parseAppointmentTime(booking.appointmentTime);
            const bookingEnd = bookingStart + booking.duration;
            
            // Check if there's at least 5 minutes gap
            if ((currentTime >= bookingEnd && currentTime < bookingEnd + 5) ||
                (slotEndTime > bookingStart - 5 && slotEndTime <= bookingStart)) {
              isAvailable = false;
              reason = 'Insufficient gap between appointments';
              break;
            }
          } catch (error) {
            console.error('Error parsing appointment time for buffer check:', booking.appointmentTime, error);
          }
        }
      }

      // Check if appointment would run past the availability window
      if (isAvailable && slotEndTime > endMinutes) {
        isAvailable = false;
        reason = 'Insufficient time in availability window';
      }

      slots.push({
        time: minutesToTime(currentTime),
        available: isAvailable,
        reason: !isAvailable ? reason : undefined
      });
    }
  }

  // Return all slots (both available and unavailable)
  return slots;
};

// Get next few days for calendar
const getNextDays = (startDate: Date, days: number) => {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  return dates;
};

export const DoctorSelectionStep = ({ onNext, onPrevious }: PractitionerSelectionStepProps) => {
  const { bookingData, updateBookingData } = useBookingStore();
  const [selectedDoctorId, setSelectedDoctorId] = useState(bookingData.practitionerId || '');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState(bookingData.selectedTime || '');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [calendarStartDate, setCalendarStartDate] = useState(new Date()); // Start from today
  const [showAllTimes, setShowAllTimes] = useState(false);
  const [practitioners, setPractitioners] = useState(MOCK_PRACTITIONERS); // Start with mock data, then replace with real data

  // Fetch real practitioners from API
  useEffect(() => {
    const fetchPractitioners = async () => {
      try {
        console.log('🔄 Fetching practitioners from API...');
        const response = await fetch('/api/practitioners');
        console.log('📡 API Response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('📋 API Result:', result);
          
          if (result.success && result.data) {
            // Transform practitioners data to match our expected format
            const transformedDoctors = result.data.map((practitioner: any) => ({
              id: practitioner.id,
              name: practitioner.name,
              title: practitioner.title,
              specialty: practitioner.specialties?.[0] || 'General Practice',
              gender: practitioner.gender || 'Unknown',
              qualifications: practitioner.title,
              rating: practitioner.rating || 4.5,
              reviews: Math.floor(Math.random() * 200) + 50, // Random reviews for display
              avatar: '/api/placeholder/100/100',
              languages: ['English'],
              description: practitioner.bio || `${practitioner.name} is an experienced practitioner.`,
              specialties: practitioner.specialties || ['General Practice'],
              website: `www.${practitioner.name.toLowerCase().replace(/[^a-z]/g, '')}.com.au`,
              billing: 'Medicare rebate available'
            }));
            
            console.log('✅ Transformed doctors:', transformedDoctors);
            setPractitioners(transformedDoctors);
          } else {
            console.log('⚠️ API response missing success/data:', result);
          }
        } else {
          console.log('❌ API response not ok:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('💥 Failed to fetch practitioners, using mock data:', error);
        // Keep using MOCK_DOCTORS as fallback
      }
    };

    fetchPractitioners();
  }, []);

  const selectedPractitioner = practitioners.find(practitioner => practitioner.id === selectedDoctorId);

  // Generate available time slots when doctor or date changes
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (selectedDoctorId && selectedDate) {
        const duration = bookingData.duration || 30; // Get duration from booking data
        const slots = await generateTimeSlotsAsync(selectedDate, selectedPractitioner, duration);
        setAvailableSlots(slots);
      }
    };
    
    loadTimeSlots();
  }, [selectedDoctorId, selectedDate, selectedPractitioner, bookingData.duration]);

  // Handle doctor selection
  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setSelectedTime(''); // Reset time when doctor changes
    setShowAllTimes(false); // Reset show all times
    updateBookingData({ 
      practitionerId: doctorId,
      selectedTime: ''
    });
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    
    // Prevent selection of past dates
    if (date < today) {
      alert('Cannot select past dates. Please choose a current or future date.');
      return;
    }
    
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
    setShowAllTimes(false); // Reset show all times
    updateBookingData({ 
      appointmentDate: date.toISOString().split('T')[0], // Store as date string
      selectedTime: ''
    });
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    const now = new Date();
    const selectedDateTime = new Date(selectedDate);
    
    // Parse the selected time
    const [timeStr, period] = time.toLowerCase().split(' ');
    const [hours, minutes] = timeStr.split(':').map(Number);
    let hour24 = hours;
    
    if (period === 'pm' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'am' && hours === 12) {
      hour24 = 0;
    }
    
    selectedDateTime.setHours(hour24, minutes, 0, 0);
    
    // Prevent selection of past times for today
    if (selectedDate.toDateString() === now.toDateString() && selectedDateTime <= now) {
      alert('Cannot select past times. Please choose a future time slot.');
      return;
    }
    
    setSelectedTime(time);
    updateBookingData({ selectedTime: time });
  };

  // Navigate calendar
  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarStartDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    
    if (direction === 'next') {
      newDate.setDate(newDate.getDate() + 5);
      setCalendarStartDate(newDate);
    } else if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 5);
      // Prevent going to dates before today
      if (newDate >= today) {
        setCalendarStartDate(newDate);
      }
    }
  };

  // Validate and proceed
  const handleNext = () => {
    if (!selectedDoctorId) {
      alert('Please select a doctor');
      return;
    }

    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    if (!selectedTime) {
      alert('Please select a time slot');
      return;
    }

    onNext();
  };

  const calendarDays = getNextDays(calendarStartDate, 5);

  return (
    <div className="space-y-6">
      {/* Practitioners List */}
      <div className="space-y-4">
        {practitioners.map((practitioner) => (
          <Card
            key={practitioner.id}
            className={`cursor-pointer border-2 transition-all duration-200 ${
              selectedDoctorId === practitioner.id 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-muted hover:border-primary/50'
            }`}
            onClick={() => handleDoctorSelect(practitioner.id)}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                {/* Practitioner Info */}
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={practitioner.avatar} alt={practitioner.name} />
                    <AvatarFallback>
                      {practitioner.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Button
                        variant={selectedDoctorId === practitioner.id ? "default" : "default"}
                        size="sm"
                        className="text-xs bg-green-600 hover:bg-green-700 text-white"
                      >
                        Book appointment
                      </Button>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-1">
                      {practitioner.name} {practitioner.title && `(${practitioner.title})`}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {practitioner.specialty}, {practitioner.gender}, {practitioner.qualifications}
                    </p>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      Speaks {practitioner.languages.join(', ')}
                    </p>

                    {practitioner.website && (
                      <p className="text-sm text-muted-foreground mb-2">
                        To find out more about {practitioner.name.split(' ')[1]}, visit {practitioner.website}
                      </p>
                    )}

                    <p className="text-sm text-muted-foreground mb-3">
                      {practitioner.description}
                    </p>

                    <button 
                      className="text-blue-600 text-sm hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle read more functionality
                        console.log('Read more clicked for', practitioner.name);
                      }}
                    >
                      Read more
                    </button>
                  </div>
                </div>

                {/* Calendar Section - Only show for selected practitioner */}
                {selectedDoctorId === practitioner.id && (
                  <div className="ml-6 min-w-[400px]">
                    {/* Calendar Header with Date Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateCalendar('prev');
                        }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      <div className="flex gap-1">
                        {calendarDays.map((date, index) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const isToday = date.toDateString() === today.toDateString();
                          const isSelected = selectedDate.toDateString() === date.toDateString();
                          const isPastDate = date < today;
                          
                          return (
                            <div
                              key={index}
                              className={`text-center p-2 rounded-md transition-colors min-w-[60px] ${
                                isPastDate
                                  ? 'opacity-50 cursor-not-allowed text-gray-400'
                                  : isSelected
                                  ? 'bg-green-600 text-white cursor-pointer'
                                  : isToday
                                  ? 'bg-gray-100 border cursor-pointer'
                                  : 'hover:bg-muted cursor-pointer'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isPastDate) {
                                  handleDateSelect(date);
                                }
                              }}
                            >
                              <div className="text-xs font-medium">
                                {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                              </div>
                              <div className="text-sm font-medium">
                                {date.getDate()} {date.toLocaleDateString('en-US', { month: 'short' })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateCalendar('next');
                        }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Available Times Section */}
                    {selectedDate && (
                      <div>
                        <div className="mb-3">
                          <h4 className="font-medium text-sm">Available Times</h4>
                          <p className="text-xs text-muted-foreground">
                            Showing slots for {bookingData.duration || 30} minute appointment
                          </p>
                        </div>
                        
                        {availableSlots.length > 0 ? (
                          <div>
                            <div className="grid grid-cols-2 gap-2">
                              {(showAllTimes ? availableSlots : availableSlots.filter(slot => slot.available).slice(0, 6))
                                .map((slot, index) => (
                                <Button
                                  key={index}
                                  variant={selectedTime === slot.time ? "default" : "outline"}
                                  size="sm"
                                  disabled={!slot.available}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (slot.available) {
                                      handleTimeSelect(slot.time);
                                    }
                                  }}
                                  className={`justify-center text-sm ${
                                    selectedTime === slot.time 
                                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                                      : slot.available
                                      ? 'hover:bg-gray-50'
                                      : 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 hover:bg-gray-100'
                                  }`}
                                  title={slot.available ? undefined : slot.reason}
                                >
                                  {slot.time}
                                  {!slot.available && showAllTimes && (
                                    <span className="text-xs ml-1">❌</span>
                                  )}
                                </Button>
                              ))}
                            </div>

                            {/* See all times button */}
                            {!showAllTimes && availableSlots.filter(slot => slot.available).length > 6 && (
                              <Button
                                variant="default"
                                size="sm"
                                className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowAllTimes(true);
                                }}
                              >
                                see all times ▼
                              </Button>
                            )}

                            {/* Show fewer times button */}
                            {showAllTimes && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-3"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowAllTimes(false);
                                }}
                              >
                                show less ▲
                              </Button>
                            )}

                            {/* Legend for disabled slots */}
                            {showAllTimes && availableSlots.some(slot => !slot.available) && (
                              <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                                <p className="font-medium text-gray-700 mb-1">Legend:</p>
                                <p className="text-gray-600">❌ = Unavailable (booked, break, or insufficient time)</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground">
                              No available slots for this date
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Try selecting a different date
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <Button 
          onClick={handleNext}
          className="flex items-center gap-2"
          disabled={!selectedDoctorId || !selectedDate || !selectedTime}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
