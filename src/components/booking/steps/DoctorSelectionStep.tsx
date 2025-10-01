/**
 * Step 4: Doctor Selection - Choose based on specialty and availability
 * Filters doctors by specialty and shows availability
 */

'use client';

import { useState, useEffect } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  UserCheck, 
  Star, 
  Clock, 
  Calendar,
  Stethoscope,
  ArrowRight, 
  ArrowLeft,
  Filter
} from 'lucide-react';

interface DoctorSelectionStepProps {
  onNext: () => void;
  onPrevious: () => void;
  goToStep: (stepId: string) => void;
}

// Mock doctors data with availability
const MOCK_DOCTORS = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'General Practice',
    qualifications: 'MD, FRCGP',
    rating: 4.8,
    reviews: 156,
    avatar: '/api/placeholder/100/100',
    experience: '12 years',
    nextAvailable: '2024-03-15',
    languages: ['English', 'Spanish'],
    specializations: ['General Medicine', 'Preventive Care'],
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    appointmentTypes: ['general-consultation', 'follow-up', 'physical-exam']
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Cardiology',
    qualifications: 'MD, FACC',
    rating: 4.9,
    reviews: 89,
    avatar: '/api/placeholder/100/100',
    experience: '15 years',
    nextAvailable: '2024-03-16',
    languages: ['English', 'Mandarin'],
    specializations: ['Heart Disease', 'Cardiac Surgery'],
    workingDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
    appointmentTypes: ['specialist-consultation', 'follow-up']
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Pediatrics',
    qualifications: 'MD, FAAP',
    rating: 4.7,
    reviews: 203,
    avatar: '/api/placeholder/100/100',
    experience: '8 years',
    nextAvailable: '2024-03-14',
    languages: ['English', 'Spanish', 'Portuguese'],
    specializations: ['Child Health', 'Vaccinations'],
    workingDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    appointmentTypes: ['general-consultation', 'physical-exam', 'urgent-care']
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    specialty: 'Dermatology',
    qualifications: 'MD, FAAD',
    rating: 4.6,
    reviews: 124,
    avatar: '/api/placeholder/100/100',
    experience: '10 years',
    nextAvailable: '2024-03-17',
    languages: ['English'],
    specializations: ['Skin Cancer', 'Cosmetic Dermatology'],
    workingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    appointmentTypes: ['specialist-consultation', 'follow-up']
  }
];

export const DoctorSelectionStep = ({ onNext, onPrevious }: DoctorSelectionStepProps) => {
  const { bookingData, updateBookingData } = useBookingStore();
  const [selectedDoctorId, setSelectedDoctorId] = useState(bookingData.practitionerId || '');
  const [doctorPreference, setDoctorPreference] = useState(bookingData.doctorPreference || 'any');
  const [filteredDoctors, setFilteredDoctors] = useState(MOCK_DOCTORS);

  // Filter doctors based on appointment type and specialty
  useEffect(() => {
    let doctors = MOCK_DOCTORS;

    // Filter by appointment type compatibility
    if (bookingData.appointmentType) {
      doctors = doctors.filter(doctor => 
        doctor.appointmentTypes.includes(bookingData.appointmentType)
      );
    }

    // If specialist consultation, filter by specialty
    if (bookingData.appointmentType === 'specialist-consultation' && bookingData.specialtyRequired) {
      doctors = doctors.filter(doctor => 
        doctor.specialty.toLowerCase().includes(bookingData.specialtyRequired.toLowerCase())
      );
    }

    setFilteredDoctors(doctors);
  }, [bookingData.appointmentType, bookingData.specialtyRequired]);

  // Handle doctor preference change
  const handlePreferenceChange = (value: string) => {
    setDoctorPreference(value);
    updateBookingData({ doctorPreference: value as 'any' | 'specific' });
    if (value === 'any') {
      setSelectedDoctorId('');
      updateBookingData({ practitionerId: null });
    }
  };

  // Handle doctor selection
  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    const selectedDoctor = filteredDoctors.find(doc => doc.id === doctorId);
    updateBookingData({ 
      practitionerId: doctorId,
      doctorPreference: 'specific'
    });
    
    if (selectedDoctor) {
      updateBookingData({
        specialtyRequired: selectedDoctor.specialty
      });
    }
  };

  // Calculate availability slots for next few days
  const calculateAvailability = (doctor: any) => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Mock availability calculation
    const availableDays = doctor.workingDays.length;
    const appointmentDuration = bookingData.duration || 30;
    const slotsPerDay = Math.floor((8 * 60) / appointmentDuration); // 8 hour workday
    
    return {
      nextAvailable: doctor.nextAvailable,
      slotsThisWeek: availableDays * slotsPerDay * 0.6, // 60% availability
      urgencyCompatible: bookingData.urgency === 'routine' || doctor.appointmentTypes.includes('urgent-care')
    };
  };

  // Validate and proceed
  const handleNext = () => {
    if (doctorPreference === 'specific' && !selectedDoctorId) {
      alert('Please select a specific doctor');
      return;
    }

    onNext();
  };

  const selectedDoctor = filteredDoctors.find(doc => doc.id === selectedDoctorId);

  return (
    <div className="space-y-6">
      {/* Doctor Preference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Doctor Preference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={doctorPreference} onValueChange={handlePreferenceChange}>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="any" id="any-doctor" />
                <Label htmlFor="any-doctor" className="cursor-pointer flex-1">
                  <div className="p-3 rounded-lg border hover:bg-muted/50">
                    <div className="font-medium">Any Available Doctor</div>
                    <p className="text-sm text-muted-foreground">
                      Book with the first available doctor for your appointment type
                    </p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="specific" id="specific-doctor" />
                <Label htmlFor="specific-doctor" className="cursor-pointer flex-1">
                  <div className="p-3 rounded-lg border hover:bg-muted/50">
                    <div className="font-medium">Choose Specific Doctor</div>
                    <p className="text-sm text-muted-foreground">
                      Select a particular doctor based on specialty and preferences
                    </p>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Doctor Selection (when specific preference is selected) */}
      {doctorPreference === 'specific' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Available Doctors
              <Badge variant="secondary" className="ml-auto">
                {filteredDoctors.length} doctors available
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDoctors.map((doctor) => {
                const availability = calculateAvailability(doctor);
                return (
                  <Card
                    key={doctor.id}
                    className={`p-4 cursor-pointer border-2 hover:border-primary transition-colors ${
                      selectedDoctorId === doctor.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleDoctorSelect(doctor.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Doctor Avatar */}
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={doctor.avatar} alt={doctor.name} />
                        <AvatarFallback>
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>

                      {/* Doctor Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-semibold">{doctor.name}</h4>
                            <p className="text-muted-foreground">{doctor.qualifications}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="outline">{doctor.specialty}</Badge>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{doctor.rating}</span>
                                <span className="text-sm text-muted-foreground">
                                  ({doctor.reviews} reviews)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Availability Info */}
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="w-4 h-4" />
                              <span>Next: {new Date(availability.nextAvailable).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm mt-1">
                              <Clock className="w-4 h-4" />
                              <span>{Math.floor(availability.slotsThisWeek)} slots this week</span>
                            </div>
                            {availability.urgencyCompatible && (
                              <Badge className="mt-2 bg-green-100 text-green-800" variant="secondary">
                                Urgent appointments available
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Specializations */}
                        <div className="mt-3">
                          <p className="text-sm font-medium">Specializations:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {doctor.specializations.map((spec, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Languages and Experience */}
                        <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Experience:</span> {doctor.experience}
                          </div>
                          <div>
                            <span className="font-medium">Languages:</span> {doctor.languages.join(', ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Doctor Summary */}
      {selectedDoctor && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={selectedDoctor.avatar} alt={selectedDoctor.name} />
                <AvatarFallback>
                  {selectedDoctor.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h5 className="font-semibold">Selected: {selectedDoctor.name}</h5>
                <p className="text-sm text-muted-foreground">
                  {selectedDoctor.specialty} • Next available: {new Date(calculateAvailability(selectedDoctor).nextAvailable).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No doctors message */}
      {filteredDoctors.length === 0 && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Filter className="w-12 h-12 text-muted-foreground" />
            <div>
              <h4 className="font-semibold">No doctors available</h4>
              <p className="text-muted-foreground">
                No doctors match your appointment type and requirements. Please go back and adjust your selections.
              </p>
            </div>
          </div>
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
          disabled={doctorPreference === 'specific' && !selectedDoctorId}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
