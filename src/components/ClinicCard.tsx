import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, Calendar } from "lucide-react";
import Link from "next/link";

interface ClinicCardProps {
  clinic: {
    id: string;
    name: string;
    address: {
      street: string;
      suburb: string;
      postcode: string;
    };
    phone: string;
    services: string[];
    openHours: Record<string, string>;
  };
}

export const ClinicCard = ({ clinic }: ClinicCardProps) => {
  const today = new Date().toLocaleDateString('en-AU', { weekday: 'long' }).toLowerCase();
  const todayHours = clinic.openHours[today] || 'Closed';
  
  return (
    <Card className="hover:shadow-medical transition-smooth cursor-pointer group">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
          {clinic.name}
        </h3>
        
        <div className="space-y-2.5 text-sm text-muted-foreground mb-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <span>
              {clinic.address.street}, {clinic.address.suburb} {clinic.address.postcode}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <span>{clinic.phone}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>Today: <span className="font-medium text-foreground">{todayHours}</span></span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {clinic.services.slice(0, 3).map((service, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {service}
            </Badge>
          ))}
          {clinic.services.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{clinic.services.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/clinic/${clinic.id}`}>View Details</Link>
        </Button>
        <Button variant="default" size="sm" className="flex-1" asChild>
          <Link href={`/booking?clinicId=${clinic.id}`}>
            <Calendar className="mr-2 h-4 w-4" />
            Book Now
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
