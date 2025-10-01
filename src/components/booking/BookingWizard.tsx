/**
 * Enhanced Booking Wizard - Complete Step-by-Step Flow
 * Implements all requirements for medical appointment booking
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

// Import all step components
import { BookingForStep } from './steps/BookingForStep';
import { PatientTypeStep } from './steps/PatientTypeStep';
import { AppointmentReasonStep } from './steps/AppointmentReasonStep';
import { DoctorSelectionStep } from './steps/DoctorSelectionStep';
import { BookingSummaryStep } from './steps/BookingSummaryStep';
import { BookingConfirmationStep } from './steps/BookingConfirmationStep';

// Define the complete booking flow steps
const BOOKING_STEPS = [
  { 
    id: 'booking-for', 
    label: 'Who is this for?', 
    component: BookingForStep
  },
  { 
    id: 'patient-type', 
    label: 'Patient Details', 
    component: PatientTypeStep
  },
  { 
    id: 'appointment-reason', 
    label: 'Appointment Type', 
    component: AppointmentReasonStep
  },
  { 
    id: 'doctor-datetime-selection', 
    label: 'Choose Doctor & Time', 
    component: DoctorSelectionStep
  },
  { 
    id: 'booking-summary', 
    label: 'Review Details', 
    component: BookingSummaryStep
  }
];

export const BookingWizard = () => {
  const { currentStep, setCurrentStep, reset } = useBookingStore();
  
  // Reset booking state when component mounts (fresh start for each booking session)
  useEffect(() => {
    // Only reset if we're not in the middle of a booking flow
    if (currentStep === 'confirmation' || !currentStep) {
      reset();
      setCurrentStep('booking-for');
    }
  }, []); // Empty dependency array means this runs once on mount
  
  // Find current step index
  const currentStepIndex = BOOKING_STEPS.findIndex(step => step.id === currentStep);
  const isConfirmationStep = currentStep === 'confirmation';
  const totalSteps = BOOKING_STEPS.length + 1; // +1 for confirmation
  const progress = isConfirmationStep 
    ? 100 
    : ((currentStepIndex + 1) / totalSteps) * 100;
  const CurrentStepComponent = BOOKING_STEPS[currentStepIndex]?.component;
  
  // Navigation functions
  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < BOOKING_STEPS.length) {
      setCurrentStep(BOOKING_STEPS[nextIndex].id);
    } else {
      // After last step, go to confirmation
      setCurrentStep('confirmation');
    }
  };
  
  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(BOOKING_STEPS[prevIndex].id);
    }
  };
  
  const goToStep = (stepId: string) => {
    setCurrentStep(stepId);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Book Your Appointment</h1>
          <div className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {BOOKING_STEPS.length}
          </div>
        </div>
        
        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-4">
          {BOOKING_STEPS.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center ${index < BOOKING_STEPS.length - 1 ? 'flex-1' : ''}`}
            >
              {/* Step Circle */}
              <div 
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold cursor-pointer
                  ${index < currentStepIndex 
                    ? 'bg-green-500 text-white' 
                    : index === currentStepIndex 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}
                onClick={() => index <= currentStepIndex && goToStep(step.id)}
              >
                {index < currentStepIndex ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              
              {/* Step Label */}
              {/* <div className="ml-3 hidden sm:block">
                <div className={`text-sm font-medium ${
                  index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </div>
              </div> */}
              
              {/* Connector Line */}
              {index < BOOKING_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  index < currentStepIndex ? 'bg-green-500' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Current Step Content */}
      <Card className="p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">
            {isConfirmationStep ? 'Booking Confirmation' : BOOKING_STEPS[currentStepIndex]?.label}
          </h2>
        </div>
        
        {/* Render Current Step Component */}
        <div className="min-h-[400px]">
          {isConfirmationStep ? (
            <BookingConfirmationStep 
              onComplete={() => {
                console.log('Booking process completed');
                // Reset everything and go back to start
                setTimeout(() => {
                  reset();
                  setCurrentStep('booking-for');
                }, 2000); // Small delay to let user see confirmation
              }}
              goToHome={() => {
                // Reset entire booking state and go to first step
                reset();
                setCurrentStep('booking-for');
              }}
            />
          ) : CurrentStepComponent ? (
            <CurrentStepComponent 
              onNext={goToNextStep}
              onPrevious={goToPreviousStep}
              goToStep={goToStep}
            />
          ) : null}
        </div>
      </Card>
    </div>
  );
};

/**
 * Utility Functions for Booking Flow
 */

// Calculate available time slots based on appointment duration
export const calculateAvailableSlots = (
  doctorAvailability: any,
  appointmentDuration: number,
  selectedDate: Date
) => {
  const slots = [];
  const workingHours = doctorAvailability.workingHours;
  const breaks = doctorAvailability.breaks || [];
  const existingAppointments = doctorAvailability.appointments || [];
  
  // Generate potential slots based on working hours
  for (const timeBlock of workingHours) {
    const startTime = parseTime(timeBlock.start);
    const endTime = parseTime(timeBlock.end);
    
    // Generate slots every 15 minutes
    let currentTime = startTime;
    while (currentTime + appointmentDuration <= endTime) {
      const slotStart = currentTime;
      const slotEnd = currentTime + appointmentDuration;
      
      // Check if slot conflicts with breaks or existing appointments
      const hasConflict = [
        ...breaks,
        ...existingAppointments
      ].some(item => {
        const itemStart = parseTime(item.start);
        const itemEnd = parseTime(item.end);
        return (slotStart < itemEnd && slotEnd > itemStart);
      });
      
      if (!hasConflict) {
        slots.push({
          start: formatTime(slotStart),
          end: formatTime(slotEnd),
          duration: appointmentDuration,
          available: true
        });
      }
      
      currentTime += 15; // 15-minute intervals
    }
  }
  
  return slots;
};

// Helper function to parse time string to minutes
const parseTime = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to format minutes back to time string
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Create booking record in database
export const createBookingRecord = async (bookingData: any) => {
  const booking = {
    id: generateBookingId(),
    patientId: bookingData.patientId,
    practitionerId: bookingData.practitionerId,
    clinicId: bookingData.clinicId,
    serviceId: bookingData.serviceId,
    startISO: new Date(bookingData.startDateTime).toISOString(),
    endISO: new Date(bookingData.endDateTime).toISOString(),
    duration: bookingData.duration,
    reason: bookingData.reason,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    confirmationCode: generateConfirmationCode(),
    qrCode: await generateQRCode(bookingData)
  };
  
  // Store in database (example with JSON server)
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(booking)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create booking');
  }
  
  return await response.json();
};

// Send confirmation notifications
export const sendBookingConfirmations = async (booking: any, patient: any) => {
  // Send SMS confirmation
  if (patient.phone) {
    await sendSMS({
      to: patient.phone,
      message: `Appointment confirmed! ${booking.practitioner.name} on ${formatDate(booking.startISO)} at ${formatTime(booking.startISO)}. Confirmation: ${booking.confirmationCode}`
    });
  }
  
  // Send Email confirmation
  if (patient.email) {
    await sendEmail({
      to: patient.email,
      subject: 'Appointment Confirmation',
      template: 'booking-confirmation',
      data: {
        patient,
        booking,
        qrCode: booking.qrCode
      }
    });
  }
};

// Generate unique booking ID
const generateBookingId = (): string => {
  return `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generate confirmation code
const generateConfirmationCode = (): string => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

// Generate QR code for check-in
const generateQRCode = async (bookingData: any): Promise<string> => {
  // In real implementation, use QR code library
  const qrData = {
    bookingId: bookingData.id,
    patientId: bookingData.patientId,
    appointmentTime: bookingData.startISO
  };
  
  // Return base64 encoded QR code (placeholder)
  return `data:image/png;base64,${btoa(JSON.stringify(qrData))}`;
};

// SMS sending function (integrate with Twilio/AWS SNS)
const sendSMS = async (smsData: any) => {
  // Implementation with SMS service
  console.log('Sending SMS:', smsData);
};

// Email sending function (integrate with SendGrid/AWS SES)
const sendEmail = async (emailData: any) => {
  // Implementation with email service
  console.log('Sending Email:', emailData);
};

// Date formatting helper
const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString();
};
