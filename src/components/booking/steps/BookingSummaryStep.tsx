/**
 * Step 6: Booking Summary - Review all details before confirmation
 * Shows comprehensive summary of all booking details
 */

'use client';

import { useState } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/providers/ToastProvider';
import bookingService from '@/services/bookingService';
import { 
  User, 
  Clock, 
  Calendar, 
  MapPin, 
  Stethoscope,
  FileText,
  Edit,
  CheckCircle,
  ArrowRight, 
  ArrowLeft 
} from 'lucide-react';

interface BookingSummaryStepProps {
  onNext: () => void;
  onPrevious: () => void;
  goToStep: (stepId: string) => void;
}

export const BookingSummaryStep = ({ onNext, onPrevious, goToStep }: BookingSummaryStepProps) => {
  const { bookingData, updateBookingData } = useBookingStore();
  const { toast } = useToast();
  const [additionalNotes, setAdditionalNotes] = useState(bookingData.notes || '');
  const [medications, setMedications] = useState(bookingData.medications || '');
  const [allergies, setAllergies] = useState(bookingData.allergies || '');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Mock doctor data (in real app, this would come from API)
  const doctorData = {
    id: bookingData.practitionerId,
    name: 'Dr. Sarah Johnson',
    specialty: 'General Practice',
    avatar: '/api/placeholder/100/100'
  };

  // Mock clinic data
  const clinicData = {
    name: 'Downtown Medical Center',
    address: '123 Main Street, Downtown, City 12345',
    phone: '(555) 123-4567'
  };

  // Format appointment date and time
  const formatDateTime = () => {
    if ((!bookingData.appointmentDate && !bookingData.selectedDate) || !bookingData.selectedTime) {
      return { date: 'Not selected', time: 'Not selected' };
    }
    
    // Use appointmentDate if available, otherwise fall back to selectedDate
    const dateStr = bookingData.appointmentDate || bookingData.selectedDate;
    if (!dateStr) {
      return { date: 'Not selected', time: 'Not selected' };
    }
    
    const date = new Date(dateStr);
    
    // Parse time from selectedTime (e.g., "1:10 pm" or "13:10")
    const timeStr = bookingData.selectedTime.toLowerCase();
    let [hours, minutes] = [0, 0];
    
    if (timeStr.includes(':')) {
      if (timeStr.includes('am') || timeStr.includes('pm')) {
        // Format: "1:10 pm"
        const [timeOnly, period] = timeStr.split(' ');
        [hours, minutes] = timeOnly.split(':').map(Number);
        
        if (period === 'pm' && hours !== 12) {
          hours += 12;
        } else if (period === 'am' && hours === 12) {
          hours = 0;
        }
      } else {
        // Format: "13:10"
        [hours, minutes] = timeStr.split(':').map(Number);
      }
    }
    
    date.setHours(hours, minutes);
    const endTime = new Date(date.getTime() + (bookingData.duration || 30) * 60000);
    
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: `${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };
  };

  // Handle additional information updates
  const handleNotesChange = (value: string) => {
    setAdditionalNotes(value);
    updateBookingData({ notes: value });
  };

  const handleMedicationsChange = (value: string) => {
    setMedications(value);
    updateBookingData({ medications: value });
  };

  const handleAllergiesChange = (value: string) => {
    setAllergies(value);
    updateBookingData({ allergies: value });
  };

  // Calculate estimated cost (mock)
  const calculateCost = () => {
    const baseCost = {
      'general-consultation': 150,
      'follow-up': 100,
      'physical-exam': 200,
      'specialist-consultation': 300,
      'medication-review': 120,
      'urgent-care': 180
    };
    
    return baseCost[bookingData.appointmentType as keyof typeof baseCost] || 150;
  };

  // Validate and proceed to confirmation
  const handleConfirm = async () => {
    if (!termsAccepted || !privacyAccepted) {
      setSubmitError('Please accept the terms and conditions and privacy policy to proceed.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Update booking data with final notes
      const finalBookingData = {
        ...bookingData,
        notes: additionalNotes,
        medications,
        allergies
      };
      
      updateBookingData({ notes: additionalNotes, medications, allergies });

      // Submit booking to database
      const result = await bookingService.completeBooking(finalBookingData);
      
      // Update booking data with confirmation details
      updateBookingData({
        confirmed: true,
        confirmationCode: result.appointment.confirmationCode,
        bookingId: result.appointment.id,
        patientId: result.patient.id
      });

      // Show success toast
      toast.success(
        'Booking Confirmed!', 
        `Your appointment is confirmed for ${dateTime.date} at ${bookingData.selectedTime}. Confirmation code: ${result.appointment.confirmationCode}`
      );

      console.log('Booking completed successfully:', result);
      onNext();
    } catch (error) {
      console.error('Booking submission failed:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to complete booking. Please try again.';
      
      setSubmitError(errorMessage);
      
      // Show error toast
      toast.error(
        'Booking Failed', 
        errorMessage
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const dateTime = formatDateTime();
  const estimatedCost = calculateCost();

  return (
    <div className="space-y-6">
      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Patient Information
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => goToStep('patient-type')}
              className="ml-auto"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Patient Name</p>
              <p className="text-muted-foreground">
                {bookingData.patientDetails.firstName} {bookingData.patientDetails.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Date of Birth</p>
              <p className="text-muted-foreground">
                {new Date(bookingData.patientDetails.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-muted-foreground">{bookingData.patientDetails.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-muted-foreground">{bookingData.patientDetails.email}</p>
            </div>
          </div>
          {bookingData.bookingFor === 'someone-else' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Booking for someone else</p>
              <p className="text-sm text-blue-700">
                Relationship: {bookingData.relationship}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Appointment Details
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => goToStep('appointment-reason')}
              className="ml-auto"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Appointment Type</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {bookingData.appointmentType?.replace('-', ' ')}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {bookingData.duration} minutes
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Urgency</p>
                <Badge 
                  className={
                    bookingData.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                    bookingData.urgency === 'urgent' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }
                  variant="secondary"
                >
                  {bookingData.urgency}
                </Badge>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium">Reason for Visit</p>
              <p className="text-muted-foreground">{bookingData.appointmentReason}</p>
            </div>
            
            {bookingData.symptoms && (
              <div>
                <p className="text-sm font-medium">Current Symptoms</p>
                <p className="text-muted-foreground">{bookingData.symptoms}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Doctor & Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Doctor & Schedule
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => goToStep('doctor-datetime-selection')}
              className="ml-auto"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={doctorData.avatar} alt={doctorData.name} />
              <AvatarFallback>
                {doctorData.name?.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h4 className="font-semibold">{doctorData.name}</h4>
              <p className="text-muted-foreground">{doctorData.specialty}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{dateTime.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{dateTime.time}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{clinicData.name}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">
              Current Medications (Optional)
            </label>
            <Textarea
              placeholder="List any medications you are currently taking..."
              value={medications}
              onChange={(e) => handleMedicationsChange(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-2">
              Allergies (Optional)
            </label>
            <Textarea
              placeholder="List any known allergies or adverse reactions..."
              value={allergies}
              onChange={(e) => handleAllergiesChange(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-2">
              Additional Notes (Optional)
            </label>
            <Textarea
              placeholder="Any additional information you'd like the doctor to know..."
              value={additionalNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cost Estimate */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Estimated Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="text-blue-700">
              {bookingData.appointmentType?.replace('-', ' ')} ({bookingData.duration} min)
            </span>
            <span className="text-2xl font-bold text-blue-900">
              ${estimatedCost}
            </span>
          </div>
          <p className="text-sm text-blue-600 mt-2">
            * Final cost may vary based on additional services or insurance coverage
          </p>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-primary underline">Terms and Conditions</a>{' '}
                and understand the cancellation policy. I acknowledge that I may be charged 
                for missed appointments without 24-hour notice.
              </Label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="privacy" 
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
              />
              <Label htmlFor="privacy" className="text-sm leading-relaxed">
                I consent to the collection and use of my personal health information 
                as described in the{' '}
                <a href="#" className="text-primary underline">Privacy Policy</a>.
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <Button 
          onClick={handleConfirm}
          className="flex items-center gap-2"
          disabled={!termsAccepted || !privacyAccepted || isSubmitting}
        >
          <CheckCircle className="w-4 h-4" />
          {isSubmitting ? 'Processing...' : 'Confirm Booking'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
