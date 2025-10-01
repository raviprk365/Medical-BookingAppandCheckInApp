'use client'

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Filter, X } from 'lucide-react';
import { useSearchFiltersStore } from '@/store/searchFiltersStore';
import { useQuery } from '@tanstack/react-query';
import { getClinics, getSpecialties } from '@/lib/api';

interface FilterPanelProps {
  onApplyFilters: () => void;
}

export const FilterPanel = ({ onApplyFilters }: FilterPanelProps) => {
  const {
    specialties,
    clinicId,
    consultationType,
    sort,
    location,
    radius,
    setSpecialties,
    setClinicId,
    setConsultationType,
    setSort,
    setLocation,
    setRadius,
    reset,
  } = useSearchFiltersStore();

  const { data: clinics = [] } = useQuery({
    queryKey: ['clinics'],
    queryFn: getClinics,
  });

  const { data: specialtiesList = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: getSpecialties,
  });

  const handleSpecialtyToggle = (specialty: string) => {
    if (specialties.includes(specialty)) {
      setSpecialties(specialties.filter(s => s !== specialty));
    } else {
      setSpecialties([...specialties, specialty]);
    }
  };

  const handleReset = () => {
    reset();
    onApplyFilters();
  };

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </h2>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <X className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location
        </Label>
        <Input
          id="location"
          placeholder="Suburb or postcode"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          aria-label="Search location"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="radius">Distance (km)</Label>
        <Select value={radius.toString()} onValueChange={(val) => setRadius(Number(val))}>
          <SelectTrigger id="radius" aria-label="Select distance radius">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 km</SelectItem>
            <SelectItem value="10">10 km</SelectItem>
            <SelectItem value="20">20 km</SelectItem>
            <SelectItem value="50">50 km</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Specialties</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {specialtiesList.map((spec: any) => (
            <div key={spec.id} className="flex items-center space-x-2">
              <Checkbox
                id={spec.id}
                checked={specialties.includes(spec.name)}
                onCheckedChange={() => handleSpecialtyToggle(spec.name)}
                aria-label={`Filter by ${spec.name}`}
              />
              <label
                htmlFor={spec.id}
                className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {spec.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinic">Clinic</Label>
        <Select value={clinicId} onValueChange={setClinicId}>
          <SelectTrigger id="clinic" aria-label="Select clinic">
            <SelectValue placeholder="Any clinic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any clinic</SelectItem>
            {clinics.map((clinic: any) => (
              <SelectItem key={clinic.id} value={clinic.id}>
                {clinic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="consultationType">Consultation Type</Label>
        <Select value={consultationType} onValueChange={setConsultationType}>
          <SelectTrigger id="consultationType" aria-label="Select consultation type">
            <SelectValue placeholder="Any type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any type</SelectItem>
            <SelectItem value="in-person">In-person</SelectItem>
            <SelectItem value="telehealth">Telehealth</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort">Sort By</Label>
        <Select value={sort} onValueChange={(val: any) => setSort(val)}>
          <SelectTrigger id="sort" aria-label="Sort results">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rating</SelectItem>
            <SelectItem value="nearest">Nearest</SelectItem>
            <SelectItem value="earliest">Earliest Available</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onApplyFilters} className="w-full">
        Apply Filters
      </Button>
    </div>
  );
};
