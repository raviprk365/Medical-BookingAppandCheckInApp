/**
 * Step 7: Confirmation - Final confirmation with booking details and next steps
 * Shows booking confirmation, generates confirmation code, and provides next steps
 */

'use client';

import { useState, useEffect } from 'react';
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
  Download,
  Share2,
  MessageSquare,
  QrCode,
  Printer,
  Home
} from 'lucide-react';

interface ConfirmationStepProps {
  onNext: () => void;
  onPrevious: () => void;
  goToStep: (stepId: string) => void;
}

export const ConfirmationStep = ({ onNext, onPrevious, goToStep }: ConfirmationStepProps) => {
  const { bookingData, updateBookingData } = useBookingStore();
  const [confirmationCode, setConfirmationCode] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);

  // Generate confirmation details on component mount
  useEffect(() => {
    const generateConfirmation = async () => {
      // Simulate API call to create booking
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newConfirmationCode = Math.random().toString(36).substr(2, 8).toUpperCase();
      const newBookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      
      setConfirmationCode(newConfirmationCode);
      setBookingId(newBookingId);
      
      // Update booking data with confirmation details
      updateBookingData({
        confirmed: true,
        confirmationCode: newConfirmationCode,
        bookingId: newBookingId
      });
      
      setIsProcessing(false);
    };

    generateConfirmation();
  }, [updateBookingData]);

  // Mock data (in real app, this would come from API/store)
  const doctorData = {
    id: bookingData.practitionerId,
    name: 'Dr. Sarah Johnson',
    specialty: 'General Practice',
    avatar: '/api/placeholder/100/100',
    phone: '(555) 123-4567',
    email: 'sarah.johnson@medicalcenter.com'
  };

  const clinicData = {
    name: 'Downtown Medical Center',
    address: '123 Main Street, Downtown, City 12345',
    phone: '(555) 123-4567',
    email: 'appointments@medicalcenter.com',
    directions: 'https://maps.google.com/directions'
  };

  // Format appointment date and time
  const formatDateTime = () => {
    if (!bookingData.selectedDate || !bookingData.selectedTime) return { date: '', time: '', daysBefore: 0 };
    
    const appointmentDate = new Date(bookingData.selectedDate);
    const [hours, minutes] = bookingData.selectedTime.split(':');
    appointmentDate.setHours(parseInt(hours), parseInt(minutes));
    
    const endTime = new Date(appointmentDate.getTime() + (bookingData.duration || 30) * 60000);
    const today = new Date();
    const daysBefore = Math.ceil((appointmentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      date: appointmentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: `${appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      daysBefore
    };
  };

  // Handle various actions
  const handlePrintConfirmation = () => {
    window.print();
  };

  const handleDownloadConfirmation = () => {
    // In real app, this would generate and download PDF
    alert('Confirmation PDF download would start here');
  };

  const handleShareConfirmation = () => {
    // In real app, this would use Web Share API
    if (navigator.share) {
      navigator.share({
        title: 'Medical Appointment Confirmation',
        text: `Appointment confirmed for ${dateTime.date} at ${dateTime.time}. Confirmation: ${confirmationCode}`,
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`Appointment confirmed for ${dateTime.date} at ${dateTime.time}. Confirmation: ${confirmationCode}`);
      alert('Confirmation details copied to clipboard');
    }
  };

  const handleAddToCalendar = () => {
    // Generate calendar event
    const startDate = new Date(bookingData.selectedDate!);
    const [hours, minutes] = bookingData.selectedTime!.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes));
    
    const endDate = new Date(startDate.getTime() + (bookingData.duration || 30) * 60000);
    
    const event = {
      title: `Medical Appointment - ${doctorData.name}`,
      start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      description: `Appointment with ${doctorData.name} at ${clinicData.name}. Confirmation: ${confirmationCode}`,
      location: clinicData.address
    };
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    window.open(calendarUrl, '_blank');
  };

  const dateTime = formatDateTime();

  if (isProcessing) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        <h3 className="text-xl font-semibold mb-2">Processing Your Booking...</h3>
        <p className="text-muted-foreground">
          Please wait while we confirm your appointment and send notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-green-700 mb-2">Booking Confirmed!</h2>
        <p className="text-lg text-muted-foreground">
          Your appointment has been successfully scheduled
        </p>
      </div>

      {/* Confirmation Details */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Confirmation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-green-700">Confirmation Code</p>
              <p className="text-2xl font-bold text-green-900">{confirmationCode}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-green-700">Booking ID</p>
              <p className="text-lg font-mono text-green-900">{bookingId}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <p className="text-sm text-green-700">
              📱 Confirmation SMS and email have been sent to your registered contact details.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Appointment Summary
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
              <h4 className="text-xl font-semibold">{doctorData.name}</h4>
              <p className="text-muted-foreground">{doctorData.specialty}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{dateTime.date}</p>
                    <p className="text-sm text-muted-foreground">
                      {dateTime.daysBefore === 0 ? 'Today' : 
                       dateTime.daysBefore === 1 ? 'Tomorrow' : 
                       `In ${dateTime.daysBefore} days`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{dateTime.time}</p>
                    <p className="text-sm text-muted-foreground">{bookingData.duration} minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{clinicData.name}</p>
                    <p className="text-sm text-muted-foreground">{clinicData.address}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-fit">
                    {bookingData.appointmentType?.replace('-', ' ')}
                  </Badge>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold mb-3">Doctor's Office</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${doctorData.phone}`} className="text-primary hover:underline">
                    {doctorData.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${doctorData.email}`} className="text-primary hover:underline">
                    {doctorData.email}
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold mb-3">Clinic</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${clinicData.phone}`} className="text-primary hover:underline">
                    {clinicData.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <a href={clinicData.directions} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" onClick={handleAddToCalendar} className="flex flex-col gap-2 h-auto py-4">
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Add to Calendar</span>
            </Button>
            
            <Button variant="outline" onClick={handleDownloadConfirmation} className="flex flex-col gap-2 h-auto py-4">
              <Download className="w-5 h-5" />
              <span className="text-xs">Download PDF</span>
            </Button>
            
            <Button variant="outline" onClick={handleShareConfirmation} className="flex flex-col gap-2 h-auto py-4">
              <Share2 className="w-5 h-5" />
              <span className="text-xs">Share Details</span>
            </Button>
            
            <Button variant="outline" onClick={handlePrintConfirmation} className="flex flex-col gap-2 h-auto py-4">
              <Printer className="w-5 h-5" />
              <span className="text-xs">Print</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">What happens next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">1</div>
              <div>
                <p className="font-medium text-blue-900">Check your email and phone</p>
                <p className="text-sm text-blue-700">You'll receive confirmation messages with appointment details and any pre-visit instructions.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">2</div>
              <div>
                <p className="font-medium text-blue-900">Prepare for your visit</p>
                <p className="text-sm text-blue-700">Bring your ID, insurance card, and any relevant medical records or medications.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">3</div>
              <div>
                <p className="font-medium text-blue-900">Arrive 15 minutes early</p>
                <p className="text-sm text-blue-700">Please arrive early for check-in and to complete any necessary paperwork.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Need Help */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-orange-600" />
            <div>
              <h5 className="font-semibold text-orange-900">Need to make changes?</h5>
              <p className="text-sm text-orange-700">
                Call {clinicData.phone} at least 24 hours before your appointment to reschedule or cancel.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={() => window.location.href = '/'} className="flex items-center gap-2">
          <Home className="w-4 h-4" />
          Return Home
        </Button>
        
        <Button onClick={() => window.location.href = '/booking'} className="flex items-center gap-2">
          Book Another Appointment
        </Button>
      </div>
    </div>
  );
};
