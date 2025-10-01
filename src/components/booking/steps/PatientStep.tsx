'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useBookingStore } from "@/store/bookingStore";
import { searchPatients } from "@/lib/api";
import { Search, UserPlus, ArrowRight } from "lucide-react";

export const PatientStep = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPatient, setShowNewPatient] = useState(false);
  const { setPatient, setCurrentStep } = useBookingStore();
  
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients', searchQuery],
    queryFn: () => searchPatients(searchQuery),
    enabled: searchQuery.length > 2,
  });
  
  const handleSelectPatient = (patientId: string) => {
    setPatient(patientId);
    setCurrentStep('service');
  };
  
  const handleNewPatient = () => {
    setShowNewPatient(true);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Find or Create Patient Profile</h2>
        <p className="text-muted-foreground">
          Search by email, phone, or name to find an existing patient, or create a new profile.
        </p>
      </div>
      
      {!showNewPatient ? (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by email, phone, or name..."
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Searching...</p>
            </div>
          )}
          
          {patients.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Found Patients</h3>
              {patients.map((patient: any) => (
                <Card
                  key={patient.id}
                  className="cursor-pointer hover:shadow-medical transition-smooth"
                  onClick={() => handleSelectPatient(patient.id)}
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">{patient.email}</p>
                      <p className="text-sm text-muted-foreground">{patient.phone}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {searchQuery.length > 2 && !isLoading && patients.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">No existing patient found</p>
                <Button variant="default" onClick={handleNewPatient}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create New Patient Profile
                </Button>
              </CardContent>
            </Card>
          )}
          
          <div className="pt-4 border-t">
            <Button variant="outline" onClick={handleNewPatient} className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Create New Patient Profile
            </Button>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">New Patient Information</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" placeholder="John" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" placeholder="Smith" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="john.smith@example.com" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" type="tel" placeholder="0412 345 678" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input id="dob" type="date" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="medicare">Medicare Number (optional)</Label>
              <Input id="medicare" placeholder="2123 45678 9" />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowNewPatient(false)} className="flex-1">
                Back to Search
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  // In real app, would create patient first
                  setPatient('temp-new-patient');
                  setCurrentStep('service');
                }}
                className="flex-1"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
