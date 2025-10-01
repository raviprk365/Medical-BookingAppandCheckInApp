'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBookingStore } from "@/store/bookingStore";
import { getClinics, getPractitioners, getServices } from "@/lib/api";
import { ArrowRight, ArrowLeft, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ServiceStep = () => {
  const {
    clinicId,
    practitionerId,
    serviceId,
    reason,
    setClinic,
    setPractitioner,
    setService,
    setReason,
    setCurrentStep,
  } = useBookingStore();
  
  const { data: clinics = [] } = useQuery({
    queryKey: ['clinics'],
    queryFn: getClinics,
  });
  
  const { data: practitioners = [] } = useQuery({
    queryKey: ['practitioners', clinicId],
    queryFn: () => getPractitioners(clinicId || undefined),
    enabled: !!clinicId,
  });
  
  const { data: services = [] } = useQuery({
    queryKey: ['services', clinicId],
    queryFn: () => getServices(clinicId || undefined),
    enabled: !!clinicId,
  });
  
  const canContinue = clinicId && practitionerId && serviceId && reason.length > 0;
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Service & Doctor</h2>
        <p className="text-muted-foreground">
          Choose your preferred clinic, doctor, and type of appointment.
        </p>
      </div>
      
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="clinic">Clinic *</Label>
          <Select value={clinicId || undefined} onValueChange={setClinic}>
            <SelectTrigger id="clinic" className="h-12">
              <SelectValue placeholder="Select a clinic" />
            </SelectTrigger>
            <SelectContent>
              {clinics.map((clinic: any) => (
                <SelectItem key={clinic.id} value={clinic.id}>
                  {clinic.name} - {clinic.address.suburb}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {clinicId && (
          <>
            <div className="space-y-2">
              <Label htmlFor="service">Type of Appointment *</Label>
              <Select value={serviceId || undefined} onValueChange={setService}>
                <SelectTrigger id="service" className="h-12">
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service: any) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{service.title}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {service.durationMinutes}min • {service.feeType}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Available Doctors *</Label>
              <div className="grid gap-3">
                {practitioners.map((practitioner: any) => (
                  <Card
                    key={practitioner.id}
                    className={`cursor-pointer transition-smooth ${
                      practitionerId === practitioner.id
                        ? 'ring-2 ring-primary shadow-medical'
                        : 'hover:shadow-soft'
                    }`}
                    onClick={() => setPractitioner(practitioner.id)}
                  >
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Stethoscope className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{practitioner.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{practitioner.title}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {practitioner.specialties.map((specialty: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit *</Label>
              <Textarea
                id="reason"
                placeholder="Please describe the reason for your visit..."
                className="min-h-24"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This helps the doctor prepare for your appointment
              </p>
            </div>
          </>
        )}
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={() => setCurrentStep('patient')} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          variant="default"
          onClick={() => setCurrentStep('datetime')}
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
