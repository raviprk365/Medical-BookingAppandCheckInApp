'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { useBookingStore } from "@/store/bookingStore";
import { ArrowRight, ArrowLeft, Clock } from "lucide-react";
import { format } from "date-fns";

// Mock available times - in real app, would fetch from API based on practitioner
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  const hours = [9, 10, 11, 14, 15, 16, 17];
  hours.forEach(hour => {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  });
  return slots;
};

export const DateTimeStep = () => {
  const { selectedDate, selectedTime, setDateTime, setCurrentStep } = useBookingStore();
  const [date, setDate] = useState<Date | undefined>(selectedDate || undefined);
  const [time, setTime] = useState<string | null>(selectedTime);
  
  const timeSlots = generateTimeSlots();
  const canContinue = date && time;
  
  const handleContinue = () => {
    if (date && time) {
      setDateTime(date, time);
      setCurrentStep('confirm');
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Date & Time</h2>
        <p className="text-muted-foreground">
          Choose your preferred appointment date and time slot.
        </p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Select Date</h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date() || date.getDay() === 0}
              className="rounded-md border shadow-soft"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">
              Available Times
              {date && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  for {format(date, 'EEEE, MMMM d')}
                </span>
              )}
            </h3>
            
            {!date ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Please select a date first</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={time === slot ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTime(slot)}
                    className="w-full"
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={() => setCurrentStep('service')} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          variant="default"
          onClick={handleContinue}
          disabled={!canContinue}
          className="flex-1"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
