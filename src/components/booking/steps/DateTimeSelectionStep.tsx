/**
 * Step 5: Date & Time Selection - Calendar with available slots
 * Shows calendar and time slots based on doctor availability and duration
 */

'use client';

import { useState, useEffect } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
  Clock, 
  Calendar as CalendarIcon, 
  CheckCircle,
  AlertCircle,
  ArrowRight, 
  ArrowLeft 
} from 'lucide-react';

interface DateTimeSelectionStepProps {
  onNext: () => void;
  onPrevious: () => void;
  goToStep: (stepId: string) => void;
}

// Mock availability data
const generateTimeSlots = (date: Date, duration: number) => {
  const slots = [];
  const dayOfWeek = date.getDay();
  
  // Different working hours based on day
  const workingHours = {
    start: dayOfWeek === 0 || dayOfWeek === 6 ? 10 : 8, // Weekend starts later
    end: dayOfWeek === 5 ? 17 : 18 // Friday ends earlier
  };

  // Generate slots every 15 minutes
  for (let hour = workingHours.start; hour < workingHours.end; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endHour = hour + Math.floor((minute + duration) / 60);
      const endMinute = (minute + duration) % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      
      // Skip if slot would end after working hours
      if (endHour > workingHours.end || (endHour === workingHours.end && endMinute > 0)) {
        continue;
      }

      // Mock availability (70% of slots available)
      const available = Math.random() > 0.3;
      
      slots.push({
        time: slotTime,
        endTime: endTime,
        available: available,
        duration: duration
      });
    }
  }

  return slots;
};

export const DateTimeSelectionStep = ({ onNext, onPrevious }: DateTimeSelectionStepProps) => {
  const { bookingData, updateBookingData } = useBookingStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    bookingData.selectedDate ? new Date(bookingData.selectedDate) : undefined
  );
  const [selectedTime, setSelectedTime] = useState(bookingData.selectedTime || '');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [alternativeTimes, setAlternativeTimes] = useState<string[]>(
    bookingData.alternativeTimes || []
  );

  // Generate available slots when date changes
  useEffect(() => {
    if (selectedDate) {
      const slots = generateTimeSlots(selectedDate, bookingData.duration || 30);
      setAvailableSlots(slots);
    }
  }, [selectedDate, bookingData.duration]);

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset selected time when date changes
    updateBookingData({ 
      selectedDate: date || null,
      selectedTime: null 
    });
  };

  // Handle time slot selection
  const handleTimeSelect = (timeSlot: any) => {
    setSelectedTime(timeSlot.time);
    updateBookingData({ 
      selectedTime: timeSlot.time 
    });
  };

  // Handle alternative time selection
  const handleAlternativeTimeToggle = (time: string) => {
    const newAlternatives = alternativeTimes.includes(time)
      ? alternativeTimes.filter(t => t !== time)
      : [...alternativeTimes, time].slice(0, 3); // Max 3 alternatives
    
    setAlternativeTimes(newAlternatives);
    updateBookingData({ alternativeTimes: newAlternatives });
  };

  // Validate and proceed
  const handleNext = () => {
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

  // Check if date is available (not weekend, not in past, within next 3 months)
  const isDateAvailable = (date: Date) => {
    const today = new Date();
    const threeMonthsFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    const dayOfWeek = date.getDay();
    
    return (
      date >= today &&
      date <= threeMonthsFromNow &&
      dayOfWeek !== 0 && // Not Sunday
      dayOfWeek !== 6    // Not Saturday (unless urgent)
    );
  };

  // Group time slots by time period
  const groupedSlots = {
    morning: availableSlots.filter(slot => parseInt(slot.time) < 12),
    afternoon: availableSlots.filter(slot => parseInt(slot.time) >= 12 && parseInt(slot.time) < 17),
    evening: availableSlots.filter(slot => parseInt(slot.time) >= 17)
  };

  const formatTimeDisplay = (time: string, duration: number) => {
    const [hours, minutes] = time.split(':');
    const startTime = new Date();
    startTime.setHours(parseInt(hours), parseInt(minutes));
    
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    return `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => !isDateAvailable(date)}
              className="rounded-md border"
            />
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-muted rounded-full"></div>
              <span>Unavailable</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slot Selection */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Available Time Slots
              <Badge variant="secondary" className="ml-auto">
                {selectedDate.toLocaleDateString()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="font-semibold">No slots available</h4>
                <p className="text-muted-foreground">
                  Please select a different date or contact us for assistance.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Morning Slots */}
                {groupedSlots.morning.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                      🌅 Morning (Before 12:00 PM)
                      <Badge variant="outline">{groupedSlots.morning.filter(s => s.available).length} available</Badge>
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {groupedSlots.morning.map((slot, index) => (
                        <Button
                          key={index}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          disabled={!slot.available}
                          onClick={() => handleTimeSelect(slot)}
                          className="h-auto py-3 flex flex-col items-center"
                        >
                          <span className="font-medium">{slot.time}</span>
                          <span className="text-xs opacity-70">
                            {bookingData.duration}min
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Afternoon Slots */}
                {groupedSlots.afternoon.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                      ☀️ Afternoon (12:00 PM - 5:00 PM)
                      <Badge variant="outline">{groupedSlots.afternoon.filter(s => s.available).length} available</Badge>
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {groupedSlots.afternoon.map((slot, index) => (
                        <Button
                          key={index}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          disabled={!slot.available}
                          onClick={() => handleTimeSelect(slot)}
                          className="h-auto py-3 flex flex-col items-center"
                        >
                          <span className="font-medium">{slot.time}</span>
                          <span className="text-xs opacity-70">
                            {bookingData.duration}min
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evening Slots */}
                {groupedSlots.evening.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                      🌆 Evening (After 5:00 PM)
                      <Badge variant="outline">{groupedSlots.evening.filter(s => s.available).length} available</Badge>
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {groupedSlots.evening.map((slot, index) => (
                        <Button
                          key={index}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          disabled={!slot.available}
                          onClick={() => handleTimeSelect(slot)}
                          className="h-auto py-3 flex flex-col items-center"
                        >
                          <span className="font-medium">{slot.time}</span>
                          <span className="text-xs opacity-70">
                            {bookingData.duration}min
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Alternative Times */}
      {selectedDate && availableSlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alternative Time Preferences (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Select up to 3 alternative times in case your preferred slot becomes unavailable.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {availableSlots
                .filter(slot => slot.available && slot.time !== selectedTime)
                .slice(0, 8)
                .map((slot, index) => (
                  <Button
                    key={index}
                    variant={alternativeTimes.includes(slot.time) ? "secondary" : "outline"}
                    onClick={() => handleAlternativeTimeToggle(slot.time)}
                    disabled={alternativeTimes.length >= 3 && !alternativeTimes.includes(slot.time)}
                    className="h-auto py-2 text-sm"
                  >
                    {slot.time}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Time Summary */}
      {selectedDate && selectedTime && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h5 className="font-semibold">Appointment Scheduled</h5>
                <p className="text-sm text-muted-foreground">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} at {formatTimeDisplay(selectedTime, bookingData.duration || 30)}
                </p>
                {alternativeTimes.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Alternatives: {alternativeTimes.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <Button 
          onClick={handleNext}
          className="flex items-center gap-2"
          disabled={!selectedDate || !selectedTime}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
