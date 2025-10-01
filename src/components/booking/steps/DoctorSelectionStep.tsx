/**
 * Step 4: Doctor Selection with Date & Time - Combined doctor and appointment scheduling
 * Shows doctors with integrated calendar and time slot selection
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

interface DoctorSelectionStepProps {
  onNext: () => void;
  onPrevious: () => void;
  goToStep: (stepId: string) => void;
}

// Mock doctors data
const MOCK_DOCTORS = [
  {
    id: '1',
    name: 'Dr Sue Raju',
    title: 'The Gut Health & Hormone Doctor',
    specialty: 'General Practitioner',
    gender: 'Female',
    qualifications: 'MBChB, FRACGP',
    rating: 4.8,
    reviews: 156,
    avatar: '/api/placeholder/100/100',
    languages: ['English'],
    description: 'Dr Sue\'s consults are privately billed, with a Medicare rebate:',
    website: 'www.drsueraju.com.au',
    billing: 'privately billed with Medicare rebate'
  },
  {
    id: '2',
    name: 'Dr Laurence Zalokar',
    specialty: 'General Practitioner',
    gender: 'Male',
    qualifications: 'MBBS',
    rating: 4.7,
    reviews: 89,
    avatar: '/api/placeholder/100/100',
    languages: ['English'],
    description: 'Dr Laurence Zalokar is a bulk billing GP, his appointments are 10 minutes. Dr Laurence Zalokar does not prescribe Cannabis.',
    billing: 'bulk billing'
  }
];

// Generate time slots for a given date with proper availability logic
const generateTimeSlots = (date: Date, selectedDoctor: any, appointmentDuration: number = 30) => {
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
  
  // Mock doctor schedules (in real app, this would come from API)
  const doctorSchedules: Record<string, any> = {
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

  doctorSchedule = doctorSchedules[doctorId] || doctorSchedules['1'];
  
  // Get doctor's availability for the day
  const dayAvailability = doctorSchedule.availability[dayName] || [];
  if (dayAvailability.length === 0) {
    return []; // Doctor not available on this day
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
    
    // Generate slots at intervals based on appointment duration, but minimum 15 minutes
    // This ensures proper spacing between appointments and prevents overlaps
    const slotInterval = Math.max(15, appointmentDuration === 30 ? 30 : 15);
    
    for (let currentTime = startMinutes; currentTime + appointmentDuration <= endMinutes; currentTime += slotInterval) {
      const slotEndTime = currentTime + appointmentDuration;
      let isAvailable = true;
      let reason = '';

      // Check if slot conflicts with doctor's breaks
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

      // Check if slot conflicts with existing bookings for this specific date
      if (isAvailable) {
        for (const booking of doctorSchedule.existingBookings) {
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
        for (const booking of doctorSchedule.existingBookings) {
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
  
  // Mock doctor schedules (in real app, this would come from API)
  const doctorSchedules: Record<string, any> = {
    '1': { // Dr Sue Raju
      availability: {
        monday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
        tuesday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
        wednesday: [{ start: '09:00', end: '12:00' }, { start: '15:00', end: '18:00' }],
        thursday: [{ start: '14:00', end: '19:00' }],
        friday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '16:00' }],
      },
      breaks: [{ start: '13:00', end: '14:00' }], // Lunch break
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
    }
  };

  doctorSchedule = doctorSchedules[doctorId] || doctorSchedules['1'];
  
  // Get doctor's availability for the day
  const dayAvailability = doctorSchedule.availability[dayName] || [];
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
    
    // Generate slots at intervals based on appointment duration, but minimum 15 minutes
    // This ensures proper spacing between appointments and prevents overlaps
    const slotInterval = Math.max(15, appointmentDuration === 30 ? 30 : 15);
    
    for (let currentTime = startMinutes; currentTime + appointmentDuration <= endMinutes; currentTime += slotInterval) {
      const slotEndTime = currentTime + appointmentDuration;
      let isAvailable = true;
      let reason = '';

      // Check if slot conflicts with doctor's breaks
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

export const DoctorSelectionStep = ({ onNext, onPrevious }: DoctorSelectionStepProps) => {
  const { bookingData, updateBookingData } = useBookingStore();
  const [selectedDoctorId, setSelectedDoctorId] = useState(bookingData.practitionerId || '');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState(bookingData.selectedTime || '');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [calendarStartDate, setCalendarStartDate] = useState(new Date());
  const [showAllTimes, setShowAllTimes] = useState(false);

  const selectedDoctor = MOCK_DOCTORS.find(doc => doc.id === selectedDoctorId);

  // Generate available time slots when doctor or date changes
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (selectedDoctorId && selectedDate) {
        const duration = bookingData.duration || 30; // Get duration from booking data
        const slots = await generateTimeSlotsAsync(selectedDate, selectedDoctor, duration);
        setAvailableSlots(slots);
      }
    };
    
    loadTimeSlots();
  }, [selectedDoctorId, selectedDate, selectedDoctor, bookingData.duration]);

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
    setSelectedTime(time);
    updateBookingData({ selectedTime: time });
  };

  // Navigate calendar
  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarStartDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 5 : -5));
    setCalendarStartDate(newDate);
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
      {/* Doctors List */}
      <div className="space-y-4">
        {MOCK_DOCTORS.map((doctor) => (
          <Card
            key={doctor.id}
            className={`cursor-pointer border-2 transition-all duration-200 ${
              selectedDoctorId === doctor.id 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-muted hover:border-primary/50'
            }`}
            onClick={() => handleDoctorSelect(doctor.id)}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                {/* Doctor Info */}
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={doctor.avatar} alt={doctor.name} />
                    <AvatarFallback>
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Button
                        variant={selectedDoctorId === doctor.id ? "default" : "default"}
                        size="sm"
                        className="text-xs bg-green-600 hover:bg-green-700 text-white"
                      >
                        Book appointment
                      </Button>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-1">
                      {doctor.name} {doctor.title && `(${doctor.title})`}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {doctor.specialty}, {doctor.gender}, {doctor.qualifications}
                    </p>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      Speaks {doctor.languages.join(', ')}
                    </p>

                    {doctor.website && (
                      <p className="text-sm text-muted-foreground mb-2">
                        To find out more about {doctor.name.split(' ')[1]}, visit {doctor.website}
                      </p>
                    )}

                    <p className="text-sm text-muted-foreground mb-3">
                      {doctor.description}
                    </p>

                    <button 
                      className="text-blue-600 text-sm hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle read more functionality
                        console.log('Read more clicked for', doctor.name);
                      }}
                    >
                      Read more
                    </button>
                  </div>
                </div>

                {/* Calendar Section - Only show for selected doctor */}
                {selectedDoctorId === doctor.id && (
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
                          const isToday = date.toDateString() === new Date().toDateString();
                          const isSelected = selectedDate.toDateString() === date.toDateString();
                          
                          return (
                            <div
                              key={index}
                              className={`text-center cursor-pointer p-2 rounded-md transition-colors min-w-[60px] ${
                                isSelected
                                  ? 'bg-green-600 text-white'
                                  : isToday
                                  ? 'bg-gray-100 border'
                                  : 'hover:bg-muted'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDateSelect(date);
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
