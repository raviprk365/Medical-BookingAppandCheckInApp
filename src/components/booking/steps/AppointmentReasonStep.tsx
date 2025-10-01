/**
 * Step 3: Appointment Reason - Type of visit and duration
 * Collects appointment reason, type, duration, and urgency
 */

'use client';

import { useState } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Stethoscope, 
  Heart, 
  Eye, 
  Pill, 
  Activity,
  AlertTriangle,
  ArrowRight, 
  ArrowLeft 
} from 'lucide-react';

interface AppointmentReasonStepProps {
  onNext: () => void;
  onPrevious: () => void;
  goToStep: (stepId: string) => void;
}

// Predefined appointment types with durations
const APPOINTMENT_TYPES = [
  {
    id: 'general-consultation',
    name: 'General Consultation',
    duration: 30,
    icon: Stethoscope,
    description: 'General health checkup and consultation',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'follow-up',
    name: 'Follow-up Visit',
    duration: 20,
    icon: Activity,
    description: 'Follow-up on previous treatment or condition',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'physical-exam',
    name: 'Physical Examination',
    duration: 45,
    icon: Heart,
    description: 'Comprehensive physical examination',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'specialist-consultation',
    name: 'Specialist Consultation',
    duration: 60,
    icon: Eye,
    description: 'Specialized medical consultation',
    color: 'bg-orange-100 text-orange-800'
  },
  {
    id: 'medication-review',
    name: 'Medication Review',
    duration: 25,
    icon: Pill,
    description: 'Review current medications and prescriptions',
    color: 'bg-teal-100 text-teal-800'
  },
  {
    id: 'urgent-care',
    name: 'Urgent Care',
    duration: 40,
    icon: AlertTriangle,
    description: 'Non-emergency urgent medical care',
    color: 'bg-red-100 text-red-800'
  }
];

const URGENCY_LEVELS = [
  {
    id: 'routine',
    name: 'Routine',
    description: 'Regular appointment, flexible timing',
    color: 'bg-green-100 text-green-800',
    priority: 1
  },
  {
    id: 'urgent',
    name: 'Urgent',
    description: 'Need to be seen within a few days',
    color: 'bg-yellow-100 text-yellow-800',
    priority: 2
  },
  {
    id: 'emergency',
    name: 'Emergency',
    description: 'Need immediate medical attention',
    color: 'bg-red-100 text-red-800',
    priority: 3
  }
];

export const AppointmentReasonStep = ({ onNext, onPrevious }: AppointmentReasonStepProps) => {
  const { bookingData, updateBookingData } = useBookingStore();
  const [selectedType, setSelectedType] = useState(bookingData.appointmentType || '');
  const [urgency, setUrgency] = useState(bookingData.urgency || 'routine');
  const [reason, setReason] = useState(bookingData.appointmentReason || '');
  const [symptoms, setSymptoms] = useState(bookingData.symptoms || '');

  // Handle appointment type selection
  const handleTypeSelect = (appointmentType: any) => {
    setSelectedType(appointmentType.id);
    updateBookingData({
      appointmentType: appointmentType.id,
      duration: appointmentType.duration
    });
  };

  // Handle urgency change
  const handleUrgencyChange = (value: string) => {
    const urgencyValue = value as 'routine' | 'urgent' | 'emergency';
    setUrgency(urgencyValue);
    updateBookingData({ urgency: urgencyValue });
  };

  // Handle reason change
  const handleReasonChange = (value: string) => {
    setReason(value);
    updateBookingData({ appointmentReason: value });
  };

  // Handle symptoms change
  const handleSymptomsChange = (value: string) => {
    setSymptoms(value);
    updateBookingData({ symptoms: value });
  };

  // Validate and proceed
  const handleNext = () => {
    if (!selectedType) {
      alert('Please select an appointment type to continue');
      return;
    }

    if (!reason.trim()) {
      alert('Please provide a reason for your visit to continue');
      return;
    }

    onNext();
  };

  const selectedTypeData = APPOINTMENT_TYPES.find(type => type.id === selectedType);

  return (
    <div className="space-y-6">
      {/* Appointment Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Appointment Type *
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {APPOINTMENT_TYPES.map((type) => {
              const IconComponent = type.icon;
              return (
                <Card
                  key={type.id}
                  className={`p-4 cursor-pointer border-2 transition-all duration-200 hover:border-primary ${
                    selectedType === type.id 
                      ? 'border-primary bg-primary/10 shadow-md' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => handleTypeSelect(type)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <IconComponent className={`w-6 h-6 ${
                        selectedType === type.id ? 'text-primary' : 'text-primary/70'
                      }`} />
                      <Badge className={type.color} variant="secondary">
                        {type.duration} min
                      </Badge>
                    </div>
                    <div>
                      <h4 className={`font-semibold ${
                        selectedType === type.id ? 'text-primary' : ''
                      }`}>{type.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Urgency Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            How urgent is this appointment?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={urgency} onValueChange={handleUrgencyChange}>
            <div className="space-y-3">
              {URGENCY_LEVELS.map((level) => (
                <div key={level.id} className="flex items-center space-x-3">
                  <RadioGroupItem value={level.id} id={level.id} />
                  <Label 
                    htmlFor={level.id} 
                    className="flex items-center justify-between w-full cursor-pointer p-3 rounded-lg border hover:bg-muted/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{level.name}</span>
                        <Badge className={level.color} variant="secondary">
                          Priority {level.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {level.description}
                      </p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Reason for Visit */}
      <Card>
        <CardHeader>
          <CardTitle>Reason for Visit *</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Please describe the reason for your visit..."
            value={reason}
            onChange={(e) => handleReasonChange(e.target.value)}
            className="min-h-[100px]"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Provide a brief description of your symptoms or the purpose of your visit
          </p>
        </CardContent>
      </Card>

      {/* Current Symptoms */}
      <Card>
        <CardHeader>
          <CardTitle>Current Symptoms (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="List any specific symptoms you're experiencing..."
            value={symptoms}
            onChange={(e) => handleSymptomsChange(e.target.value)}
            className="min-h-[80px]"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Include severity, duration, and any relevant details
          </p>
        </CardContent>
      </Card>

      {/* Selected Type Summary */}
      {selectedTypeData && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h5 className="font-semibold">Appointment Summary</h5>
                <p className="text-sm text-muted-foreground">
                  {selectedTypeData.name} • {selectedTypeData.duration} minutes • {urgency} priority
                </p>
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
          disabled={!selectedType || !reason.trim()}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
