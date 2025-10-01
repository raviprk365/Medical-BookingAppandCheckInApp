'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Clock, Video, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/bookingStore';

interface PractitionerCardProps {
  practitioner: {
    id: string;
    name: string;
    title: string;
    specialties: string[];
    bio: string;
    rating: number;
    consultationTypes: string[];
    clinicId: string;
  };
  clinic?: {
    name: string;
    address: {
      suburb: string;
    };
  };
  distance?: number;
  nextAvailable?: string;
}

export const PractitionerCard = ({ practitioner, clinic, distance, nextAvailable }: PractitionerCardProps) => {
  const router = useRouter();
  const { setSelectedPractitioner, setSelectedClinic } = useBookingStore();

  const handleBookNow = () => {
    setSelectedPractitioner(practitioner);
    if (clinic) {
      setSelectedClinic(clinic);
    }
    router.push('/booking');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {practitioner.name}
            </CardTitle>
            <CardDescription className="mt-1">{practitioner.title}</CardDescription>
          </div>
          <div className="flex items-center gap-1 bg-warning/10 px-2 py-1 rounded">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-semibold text-sm">{practitioner.rating}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {practitioner.specialties.map((specialty, idx) => (
            <Badge key={idx} variant="secondary">{specialty}</Badge>
          ))}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">{practitioner.bio}</p>
        
        <div className="space-y-2 text-sm">
          {clinic && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{clinic.name}, {clinic.address.suburb}</span>
              {distance && <span className="text-primary font-medium">({distance}km)</span>}
            </div>
          )}
          
          {nextAvailable && (
            <div className="flex items-center gap-2 text-success">
              <Clock className="h-4 w-4" />
              <span>Next available: {nextAvailable}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            {practitioner.consultationTypes.includes('in-person') && (
              <Badge variant="outline" className="text-xs">In-person</Badge>
            )}
            {practitioner.consultationTypes.includes('telehealth') && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Video className="h-3 w-3" />
                Telehealth
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button onClick={handleBookNow} className="w-full">
          Book Appointment
        </Button>
      </CardFooter>
    </Card>
  );
};
