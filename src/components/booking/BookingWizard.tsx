'use client';

import { useBookingStore } from "@/store/bookingStore";
import { PatientStep } from "./steps/PatientStep";
import { ServiceStep } from "./steps/ServiceStep";
import { DateTimeStep } from "./steps/DateTimeStep";
import { ConfirmStep } from "./steps/ConfirmStep";
import { Progress } from "@/components/ui/progress";

const steps = [
  { id: 'patient', label: 'Patient', component: PatientStep },
  { id: 'service', label: 'Service & Doctor', component: ServiceStep },
  { id: 'datetime', label: 'Date & Time', component: DateTimeStep },
  { id: 'confirm', label: 'Confirm', component: ConfirmStep },
];

export const BookingWizard = () => {
  const { currentStep } = useBookingStore();
  
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStepIndex]?.component;
  
  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-3">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`flex items-center ${
                idx <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                  idx <= currentStepIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {idx + 1}
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">
                {step.label}
              </span>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Current Step Content */}
      <div className="min-h-[400px]">
        {CurrentStepComponent && <CurrentStepComponent />}
      </div>
    </div>
  );
};
