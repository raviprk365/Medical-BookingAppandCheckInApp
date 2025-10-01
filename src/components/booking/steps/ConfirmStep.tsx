'use client';

import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useBookingStore } from "@/store/bookingStore";
import { getClinic, getPractitioner, getService, createBooking } from "@/lib/api";
import { ArrowLeft, Calendar, Clock, MapPin, User, Stethoscope, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const ConfirmStep = () => {
  const router = useRouter();
  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
    sms: true,
    email: true,
  });
  
  const {
    patientId,
    clinicId,
    practitionerId,
    serviceId,
    selectedDate,
    selectedTime,
    reason,
    notes,
    resetBooking,
    setCurrentStep,
  } = useBookingStore();
  
  const { data: clinic } = useQuery({
    queryKey: ['clinic', clinicId],
    queryFn: () => getClinic(clinicId!),
    enabled: !!clinicId,
  });
  
  const { data: practitioner } = useQuery({
    queryKey: ['practitioner', practitionerId],
    queryFn: () => getPractitioner(practitionerId!),
    enabled: !!practitionerId,
  });
  
  const { data: service } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => getService(serviceId!),
    enabled: !!serviceId,
  });
  
  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (data) => {
      toast.success("Appointment booked successfully!");
      resetBooking();
      router.push(`/booking/success/${data.id}`);
    },
    onError: () => {
      toast.error("Failed to book appointment. Please try again.");
    },
  });
  
  const handleConfirm = () => {
    if (!consents.terms || !consents.privacy) {
      toast.error("Please accept the terms and privacy policy");
      return;
    }
    
    const bookingData = {
      patientId,
      clinicId,
      practitionerId,
      serviceId,
      startISO: new Date(`${format(selectedDate!, 'yyyy-MM-dd')}T${selectedTime}`).toISOString(),
      endISO: new Date(
        new Date(`${format(selectedDate!, 'yyyy-MM-dd')}T${selectedTime}`).getTime() +
        (service?.durationMinutes || 15) * 60000
      ).toISOString(),
      status: 'booked',
      source: 'web',
      reason,
      notes,
      createdBy: patientId,
      createdAt: new Date().toISOString(),
      qrCode: `BOOK-${Date.now()}`,
    };
    
    bookingMutation.mutate(bookingData);
  };
  
  const canConfirm = consents.terms && consents.privacy && !bookingMutation.isPending;
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Confirm Your Appointment</h2>
        <p className="text-muted-foreground">
          Review your appointment details before confirming.
        </p>
      </div>
      
      <Card className="shadow-medical">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold">{clinic?.name}</p>
              <p className="text-sm text-muted-foreground">
                {clinic?.address.street}, {clinic?.address.suburb} {clinic?.address.postcode}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Stethoscope className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold">{practitioner?.name}</p>
              <p className="text-sm text-muted-foreground">{practitioner?.title}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold">{service?.title}</p>
              <p className="text-sm text-muted-foreground">
                {service?.durationMinutes} minutes • {service?.feeType}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold">
                {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {selectedTime}
              </p>
            </div>
          </div>
          
          {reason && (
            <div className="pt-4 border-t">
              <p className="text-sm font-semibold mb-1">Reason for visit:</p>
              <p className="text-sm text-muted-foreground">{reason}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">Consent & Notifications</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={consents.terms}
                onCheckedChange={(checked) => 
                  setConsents({ ...consents, terms: checked as boolean })
                }
              />
              <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                I accept the <a href="#" className="text-primary hover:underline">Terms of Service</a> *
              </Label>
            </div>
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="privacy"
                checked={consents.privacy}
                onCheckedChange={(checked) => 
                  setConsents({ ...consents, privacy: checked as boolean })
                }
              />
              <Label htmlFor="privacy" className="text-sm cursor-pointer leading-relaxed">
                I have read and understand the <a href="#" className="text-primary hover:underline">Privacy Policy</a> *
              </Label>
            </div>
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="sms"
                checked={consents.sms}
                onCheckedChange={(checked) => 
                  setConsents({ ...consents, sms: checked as boolean })
                }
              />
              <Label htmlFor="sms" className="text-sm cursor-pointer leading-relaxed">
                Send me SMS reminders and updates
              </Label>
            </div>
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="email"
                checked={consents.email}
                onCheckedChange={(checked) => 
                  setConsents({ ...consents, email: checked as boolean })
                }
              />
              <Label htmlFor="email" className="text-sm cursor-pointer leading-relaxed">
                Send me email confirmations and updates
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={() => setCurrentStep('datetime')} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          variant="default"
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="flex-1"
        >
          {bookingMutation.isPending ? (
            "Booking..."
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirm Appointment
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
