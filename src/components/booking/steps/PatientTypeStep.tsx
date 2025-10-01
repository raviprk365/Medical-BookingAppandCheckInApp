/**
 * Step 2: Patient Type - Existing or New Patient Details
 * Collects patient information based on whether they are existing or new
 */

'use client';

import { useState, useEffect } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search, UserCheck, UserPlus, ArrowRight, ArrowLeft } from 'lucide-react';

interface PatientTypeStepProps {
  onNext: () => void;
  onPrevious: () => void;
  goToStep: (stepId: string) => void;
}

export const PatientTypeStep = ({ onNext, onPrevious }: PatientTypeStepProps) => {
  const { bookingData, updateBookingData } = useBookingStore();
  const [patientType, setPatientType] = useState(bookingData.patientType || 'existing');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [patientDetails, setPatientDetails] = useState(bookingData.patientDetails || {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Real patient search function
  const searchPatients = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      // Fetch all patients from API
      const response = await fetch('/api/patients');
      if (!response.ok) {
        console.error('Failed to fetch patients:', response.statusText);
        setSearchResults([]);
        return;
      }

      const patients = await response.json();
      
      // Filter patients based on search query
      const filtered = patients.filter((patient: any) => 
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
        patient.phone.includes(query) ||
        patient.email.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching patients:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchPatients(searchQuery.trim());
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle patient type change
  const handlePatientTypeChange = (value: string) => {
    const patientTypeValue = value as 'existing' | 'new';
    setPatientType(patientTypeValue);
    updateBookingData({ patientType: patientTypeValue });
    setSelectedPatient(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle existing patient selection
  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    updateBookingData({ 
      patientId: patient.id,
      patientDetails: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        phone: patient.phone,
        email: patient.email,
        address: patient.address || '',
        emergencyContact: patient.emergencyContact || {
          name: '',
          phone: '',
          relationship: ''
        }
      }
    });
  };

  // Handle new patient details update
  const handleNewPatientUpdate = (field: string, value: string) => {
    const updatedDetails = { ...patientDetails, [field]: value };
    setPatientDetails(updatedDetails);
    updateBookingData({ patientDetails: updatedDetails });
  };

  // Handle emergency contact update
  const handleEmergencyContactUpdate = (field: string, value: string) => {
    const updatedDetails = {
      ...patientDetails,
      emergencyContact: {
        ...patientDetails.emergencyContact,
        [field]: value
      }
    };
    setPatientDetails(updatedDetails);
    updateBookingData({ patientDetails: updatedDetails });
  };

  // Validate form and proceed
  const handleNext = () => {
    if (patientType === 'existing' && !selectedPatient) {
      alert('Please select an existing patient');
      return;
    }

    if (patientType === 'new') {
      const required = ['firstName', 'lastName', 'dateOfBirth', 'phone', 'email'] as const;
      const missing = required.filter(field => !patientDetails[field]?.trim());
      
      if (missing.length > 0) {
        alert(`Please fill in the following required fields: ${missing.join(', ')}`);
        return;
      }
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Patient Type Selection */}
      <RadioGroup 
        value={patientType} 
        onValueChange={handlePatientTypeChange}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Existing Patient */}
        <div className="relative">
          <RadioGroupItem 
            value="existing" 
            id="existing" 
            className="peer sr-only" 
          />
          <Label htmlFor="existing" className="cursor-pointer block">
            <Card className={`p-6 border-2 transition-all duration-200 hover:border-primary ${
              patientType === 'existing' 
                ? 'border-primary bg-primary/10 shadow-md' 
                : 'border-muted hover:border-primary/50'
            }`}>
              <CardContent className="p-0">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${
                    patientType === 'existing' ? 'bg-primary/20' : 'bg-primary/10'
                  }`}>
                    <UserCheck className={`w-6 h-6 ${
                      patientType === 'existing' ? 'text-primary' : 'text-primary/70'
                    }`} />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${
                      patientType === 'existing' ? 'text-primary' : ''
                    }`}>Existing Patient</h4>
                    <p className="text-sm text-muted-foreground">
                      I have visited this practice before
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Label>
        </div>

        {/* New Patient */}
        <div className="relative">
          <RadioGroupItem 
            value="new" 
            id="new" 
            className="peer sr-only" 
          />
          <Label htmlFor="new" className="cursor-pointer block">
            <Card className={`p-6 border-2 transition-all duration-200 hover:border-primary ${
              patientType === 'new' 
                ? 'border-primary bg-primary/10 shadow-md' 
                : 'border-muted hover:border-primary/50'
            }`}>
              <CardContent className="p-0">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${
                    patientType === 'new' ? 'bg-primary/20' : 'bg-primary/10'
                  }`}>
                    <UserPlus className={`w-6 h-6 ${
                      patientType === 'new' ? 'text-primary' : 'text-primary/70'
                    }`} />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${
                      patientType === 'new' ? 'text-primary' : ''
                    }`}>New Patient</h4>
                    <p className="text-sm text-muted-foreground">
                      This is my first visit to this practice
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Label>
        </div>
      </RadioGroup>

      {/* Existing Patient Search */}
      {patientType === 'existing' && (
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search for Your Record
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Search by name, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium">Select your record:</h5>
                  {searchResults.map((patient) => (
                    <Card
                      key={patient.id}
                      className={`p-4 cursor-pointer border-2 hover:border-primary transition-colors ${
                        selectedPatient?.id === patient.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h6 className="font-semibold">
                            {patient.firstName} {patient.lastName}
                          </h6>
                          <p className="text-sm text-muted-foreground">
                            DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Phone: {patient.phone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Email: {patient.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Patient ID: {patient.id}
                          </p>
                          {patient.createdAt && (
                            <p className="text-xs text-muted-foreground">
                              Registered: {new Date(patient.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No existing records found.</p>
                  <p className="text-sm">Consider selecting "New Patient" above.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Patient Form */}
      {patientType === 'new' && (
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Patient Details</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={patientDetails.firstName}
                  onChange={(e) => handleNewPatientUpdate('firstName', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={patientDetails.lastName}
                  onChange={(e) => handleNewPatientUpdate('lastName', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
              
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={patientDetails.dateOfBirth}
                  onChange={(e) => handleNewPatientUpdate('dateOfBirth', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={patientDetails.phone}
                  onChange={(e) => handleNewPatientUpdate('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={patientDetails.email}
                  onChange={(e) => handleNewPatientUpdate('email', e.target.value)}
                  placeholder="patient@email.com"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={patientDetails.address}
                  onChange={(e) => handleNewPatientUpdate('address', e.target.value)}
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h5 className="font-medium mb-4">Emergency Contact</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emergencyName">Name</Label>
                  <Input
                    id="emergencyName"
                    value={patientDetails.emergencyContact.name}
                    onChange={(e) => handleEmergencyContactUpdate('name', e.target.value)}
                    placeholder="Contact name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="emergencyPhone">Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={patientDetails.emergencyContact.phone}
                    onChange={(e) => handleEmergencyContactUpdate('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <div>
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Input
                    id="emergencyRelationship"
                    value={patientDetails.emergencyContact.relationship}
                    onChange={(e) => handleEmergencyContactUpdate('relationship', e.target.value)}
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>
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
          disabled={
            (patientType === 'existing' && !selectedPatient) ||
            (patientType === 'new' && (!patientDetails.firstName || !patientDetails.lastName || !patientDetails.dateOfBirth || !patientDetails.phone || !patientDetails.email))
          }
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
