/**
 * Step 1: Booking For - Who is this appointment for?
 * Determines if user is booking for themselves or someone else
 */

'use client';

import { useState } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User, Users, ArrowRight } from 'lucide-react';

interface BookingForStepProps {
  onNext: () => void;
  onPrevious: () => void;
  goToStep: (stepId: string) => void;
}

export const BookingForStep = ({ onNext }: BookingForStepProps) => {
  const { bookingData, updateBookingData } = useBookingStore();
  const [bookingFor, setBookingFor] = useState(bookingData.bookingFor || 'myself');
  const [relationship, setRelationship] = useState(bookingData.relationship || '');

  // Handle booking for selection
  const handleBookingForChange = (value: string) => {
    setBookingFor(value);
    updateBookingData({ 
      bookingFor: value,
      // Clear relationship if booking for self
      relationship: value === 'myself' ? '' : relationship
    });
  };

  // Handle relationship input
  const handleRelationshipChange = (value: string) => {
    setRelationship(value);
    updateBookingData({ relationship: value });
  };

  // Validate and proceed to next step
  const handleNext = () => {
    if (bookingFor === 'someone-else' && !relationship.trim()) {
      alert('Please specify your relationship to the patient');
      return;
    }
    
    updateBookingData({ 
      bookingFor, 
      relationship: bookingFor === 'myself' ? '' : relationship 
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <RadioGroup 
        value={bookingFor} 
        onValueChange={handleBookingForChange}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Option 1: Booking for myself */}
        <div className="relative">
          <RadioGroupItem 
            value="myself" 
            id="myself" 
            className="peer sr-only" 
          />
          <Label
            htmlFor="myself"
            className="cursor-pointer block"
          >
            <Card className={`p-6 border-2 transition-all duration-200 hover:border-primary ${
              bookingFor === 'myself' 
                ? 'border-primary bg-primary/10 shadow-md' 
                : 'border-muted hover:border-primary/50'
            }`}>
              <CardContent className="p-0">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${
                    bookingFor === 'myself' ? 'bg-primary/20' : 'bg-primary/10'
                  }`}>
                    <User className={`w-6 h-6 ${
                      bookingFor === 'myself' ? 'text-primary' : 'text-primary/70'
                    }`} />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${
                      bookingFor === 'myself' ? 'text-primary' : ''
                    }`}>For Myself</h4>
                    <p className="text-sm text-muted-foreground">
                      I'm booking this appointment for me
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Label>
        </div>

        {/* Option 2: Booking for someone else */}
        <div className="relative">
          <RadioGroupItem 
            value="someone-else" 
            id="someone-else" 
            className="peer sr-only" 
          />
          <Label
            htmlFor="someone-else"
            className="cursor-pointer block"
          >
            <Card className={`p-6 border-2 transition-all duration-200 hover:border-primary ${
              bookingFor === 'someone-else' 
                ? 'border-primary bg-primary/10 shadow-md' 
                : 'border-muted hover:border-primary/50'
            }`}>
              <CardContent className="p-0">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${
                    bookingFor === 'someone-else' ? 'bg-primary/20' : 'bg-primary/10'
                  }`}>
                    <Users className={`w-6 h-6 ${
                      bookingFor === 'someone-else' ? 'text-primary' : 'text-primary/70'
                    }`} />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${
                      bookingFor === 'someone-else' ? 'text-primary' : ''
                    }`}>For Someone Else</h4>
                    <p className="text-sm text-muted-foreground">
                      I'm booking on behalf of another person
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Label>
        </div>
      </RadioGroup>

      {/* Relationship input - only shown when booking for someone else */}
      {bookingFor === 'someone-else' && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <Label htmlFor="relationship" className="text-sm font-medium">
            What is your relationship to this patient? *
          </Label>
          <Input
            id="relationship"
            placeholder="e.g., Spouse, Child, Parent, Guardian, Friend"
            value={relationship}
            onChange={(e) => handleRelationshipChange(e.target.value)}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This helps us understand your authorization to book on their behalf
          </p>
        </div>
      )}

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <h5 className="font-medium text-blue-900">Booking for Yourself</h5>
              <p className="text-sm text-blue-700 mt-1">
                You'll be able to manage this appointment directly and receive all communications
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
            <div>
              <h5 className="font-medium text-amber-900">Booking for Others</h5>
              <p className="text-sm text-amber-700 mt-1">
                You'll manage this appointment and may need to provide additional authorization
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-6">
        <Button 
          onClick={handleNext}
          className="flex items-center gap-2"
          disabled={bookingFor === 'someone-else' && !relationship.trim()}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
