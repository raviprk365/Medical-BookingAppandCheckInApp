/**
 * Step 7: Booking Confirmation - Show successful booking details
 * Displays confirmation code, appointment details, and next steps
 */

'use client';

import { useEffect } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  FileText,
  Download,
  Share,
  Home
} from 'lucide-react';

interface BookingConfirmationStepProps {
  onComplete: () => void;
  goToHome?: () => void;
}

export const BookingConfirmationStep = ({ onComplete, goToHome }: BookingConfirmationStepProps) => {
  const { bookingData, reset } = useBookingStore();

  // Mock doctor data (in real app, this would come from API)
  const doctorData = {
    id: bookingData.practitionerId,
    name: 'Dr. Sue Raju',
    title: 'The Gut Health & Hormone Doctor',
    specialty: 'General Practice',
    avatar: '/api/placeholder/100/100',
    phone: '(02) 9555 1234'
  };

  // Mock clinic data
  const clinicData = {
    name: 'Sydney CBD Medical Centre',
    address: '123 George Street, Sydney 2000',
    phone: '(02) 9555 1234',
    email: 'info@sydneycbdmedical.com.au'
  };

  // Format appointment date and time
  const formatDateTime = () => {
    if (!bookingData.appointmentDate || !bookingData.selectedTime) {
      return { date: 'Not available', time: 'Not available' };
    }
    
    const date = new Date(bookingData.appointmentDate);
    const timeStr = bookingData.selectedTime.toLowerCase();
    
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: bookingData.selectedTime,
      shortDate: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    };
  };

  const dateTime = formatDateTime();

  // Handle booking completion
  const handleComplete = () => {
    if (goToHome) {
      goToHome();
    }
    reset(); // Clear booking data
    onComplete();
  };

  // Auto-scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-green-800">Booking Confirmed!</h2>
          <p className="text-lg text-muted-foreground mt-2">
            Your appointment has been successfully scheduled
          </p>
        </div>
      </div>

      {/* Confirmation Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Appointment Details */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Calendar className="w-5 h-5" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Confirmation Code</span>
              <Badge className="bg-green-600 text-white text-lg px-3 py-1">
                {bookingData.confirmationCode || 'APT001'}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-green-600" />
                <div>
                  <p className="font-medium">{dateTime.date}</p>
                  <p className="text-sm text-muted-foreground">{dateTime.shortDate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-green-600" />
                <div>
                  <p className="font-medium">{dateTime.time}</p>
                  <p className="text-sm text-muted-foreground">{bookingData.duration} minutes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-green-600" />
                <div>
                  <p className="font-medium">{bookingData.appointmentType?.replace('-', ' ')}</p>
                  <p className="text-sm text-muted-foreground">{bookingData.appointmentReason}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctor & Clinic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Doctor & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={doctorData.avatar} alt={doctorData.name} />
                <AvatarFallback>
                  {doctorData.name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h4 className="font-semibold">{doctorData.name}</h4>
                <p className="text-sm text-muted-foreground">{doctorData.title}</p>
                <p className="text-sm text-muted-foreground">{doctorData.specialty}</p>
              </div>
            </div>
            
            <div className="space-y-2 pt-3 border-t">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{clinicData.name}</p>
                  <p className="text-sm text-muted-foreground">{clinicData.address}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{clinicData.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Patient Name</p>
              <p className="text-muted-foreground">
                {bookingData.patientDetails.firstName} {bookingData.patientDetails.lastName}
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
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Important Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-blue-800">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm">
              Please arrive 15 minutes early for your appointment to complete check-in procedures.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm">
              Bring a valid ID and your Medicare card (if applicable).
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm">
              If you need to cancel or reschedule, please call at least 24 hours in advance.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm">
              A confirmation email will be sent to {bookingData.patientDetails.email}.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => window.print()}
        >
          <Download className="w-4 h-4" />
          Print Confirmation
        </Button>
        
        <Button 
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Appointment Confirmation',
                text: `Appointment confirmed for ${dateTime.date} at ${dateTime.time} with ${doctorData.name}. Confirmation: ${bookingData.confirmationCode}`,
              });
            }
          }}
        >
          <Share className="w-4 h-4" />
          Share Details
        </Button>
        
        <Button 
          onClick={handleComplete}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Button>
      </div>

      {/* Contact Information */}
      <Card className="text-center">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Questions about your appointment? Contact us at{' '}
            <a href={`tel:${clinicData.phone}`} className="text-primary hover:underline">
              {clinicData.phone}
            </a>
            {' '}or{' '}
            <a href={`mailto:${clinicData.email}`} className="text-primary hover:underline">
              {clinicData.email}
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
