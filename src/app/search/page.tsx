'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { FilterPanel } from '@/components/FilterPanel';
import { PractitionerCard } from '@/components/PractitionerCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, Filter, SortAsc, MapPin, Clock, Star } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFilters {
  query: string;
  specialty: string[];
  consultationType: string;
  availability: string;
  rating: number;
  sortBy: string;
}

interface EnhancedPractitioner {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  bio: string;
  rating: number;
  consultationTypes: string[];
  clinicId: string;
  matchReasons: string[];
  relevanceScore: number;
  clinic?: {
    name: string;
    address: any;
    phone: string;
  };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [practitioners, setPractitioners] = useState<EnhancedPractitioner[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  
  // Search filters state
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams?.get('query') || '',
    specialty: [],
    consultationType: 'both',
    availability: 'anytime',
    rating: 0,
    sortBy: 'relevance'
  });

  // Available specialties from your db.json
  const availableSpecialties = [
    'General Practice',
    'Women\'s Health',
    'Travel Medicine',
    'Pediatrics',
    'Chronic Disease Management',
    'Skin Checks',
    'Minor Surgery',
    'Mental Health',
    'Diabetes Care'
  ];

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams();
      
      if (filters.query) searchParams.append('query', filters.query);
      if (filters.specialty.length > 0) {
        filters.specialty.forEach(s => searchParams.append('specialty', s));
      }
      if (filters.consultationType !== 'both') searchParams.append('consultationType', filters.consultationType);
      if (filters.availability !== 'anytime') searchParams.append('availability', filters.availability);
      if (filters.rating > 0) searchParams.append('rating', filters.rating.toString());
      if (filters.sortBy) searchParams.append('sortBy', filters.sortBy);

      const response = await fetch(`/api/search/practitioners?${searchParams.toString()}`);
      const result = await response.json();

      if (result.success) {
        setPractitioners(result.data.practitioners);
        setSuggestions(result.data.suggestions);
        setTotalResults(result.data.totalResults);
        setSearchTime(Date.now() - result.data.searchTime);
        console.log('✅ Search results loaded:', result.data.totalResults, 'practitioners');
      } else {
        console.error('❌ Search failed:', result.error);
        setPractitioners([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error('💥 Search error:', error);
      setPractitioners([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial search on page load
  useEffect(() => {
    handleSearch();
  }, []);

  // Handle filter changes
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleSpecialty = (specialty: string) => {
    setFilters(prev => ({
      ...prev,
      specialty: prev.specialty.includes(specialty)
        ? prev.specialty.filter(s => s !== specialty)
        : [...prev.specialty, specialty]
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      specialty: [],
      consultationType: 'both',
      availability: 'anytime',
      rating: 0,
      sortBy: 'relevance'
    });
  };

  const getAvailabilityColor = (practitioner: EnhancedPractitioner) => {
    // This would be enhanced with real availability data
    const hasAvailability = practitioner.consultationTypes?.length > 0;
    return hasAvailability ? 'text-green-600' : 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Find the Right Practitioner</h1>
          <p className="text-muted-foreground">
            Search by condition, specialty, or practitioner name to find the perfect care for your needs
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by condition (e.g., diabetes, pregnancy, children), specialty, or doctor name..."
                    className="pl-10 pr-4 py-3 text-lg"
                    value={filters.query}
                    onChange={(e) => updateFilter('query', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <Button onClick={handleSearch} disabled={isLoading} size="lg">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Search
              </Button>
            </div>

            {/* Search suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Popular searches:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        updateFilter('query', suggestion);
                        setTimeout(handleSearch, 100);
                      }}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Specialties */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Specialties</label>
                    <div className="space-y-2">
                      {availableSpecialties.map((specialty) => (
                        <label key={specialty} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.specialty.includes(specialty)}
                            onChange={() => toggleSpecialty(specialty)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{specialty}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Consultation Type */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Consultation Type</label>
                    <Select value={filters.consultationType} onValueChange={(value) => updateFilter('consultationType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Both In-person & Telehealth</SelectItem>
                        <SelectItem value="in-person">In-person Only</SelectItem>
                        <SelectItem value="telehealth">Telehealth Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Availability</label>
                    <Select value={filters.availability} onValueChange={(value) => updateFilter('availability', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anytime">Anytime</SelectItem>
                        <SelectItem value="today">Available Today</SelectItem>
                        <SelectItem value="thisWeek">This Week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Minimum Rating */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Minimum Rating</label>
                    <Select value={filters.rating.toString()} onValueChange={(value) => updateFilter('rating', Number(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any Rating</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleSearch} className="w-full" disabled={isLoading}>
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Results Section */}
          <section className="lg:col-span-3" aria-label="Search results">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-lg font-medium">
                  {isLoading ? 'Searching...' : `${totalResults} practitioner${totalResults !== 1 ? 's' : ''} found`}
                </p>
                {searchTime && (
                  <p className="text-sm text-muted-foreground">
                    Search completed in {searchTime}ms
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <SortAsc className="h-4 w-4 text-muted-foreground" />
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Most Relevant</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="nextAvailable">Next Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.query || filters.specialty.length > 0 || filters.consultationType !== 'both' || filters.availability !== 'anytime' || filters.rating > 0) && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">Active filters:</p>
                <div className="flex flex-wrap gap-2">
                  {filters.query && (
                    <Badge variant="secondary">
                      Query: "{filters.query}"
                      <button 
                        className="ml-1 hover:text-red-500"
                        onClick={() => updateFilter('query', '')}
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {filters.specialty.map(specialty => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                      <button 
                        className="ml-1 hover:text-red-500"
                        onClick={() => toggleSpecialty(specialty)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                  {filters.consultationType !== 'both' && (
                    <Badge variant="secondary">
                      {filters.consultationType}
                      <button 
                        className="ml-1 hover:text-red-500"
                        onClick={() => updateFilter('consultationType', 'both')}
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {filters.availability !== 'anytime' && (
                    <Badge variant="secondary">
                      {filters.availability}
                      <button 
                        className="ml-1 hover:text-red-500"
                        onClick={() => updateFilter('availability', 'anytime')}
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {filters.rating > 0 && (
                    <Badge variant="secondary">
                      {filters.rating}+ stars
                      <button 
                        className="ml-1 hover:text-red-500"
                        onClick={() => updateFilter('rating', 0)}
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Searching practitioners...</span>
              </div>
            )}

            {/* Results */}
            {!isLoading && (
              <>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                  {practitioners.map((practitioner) => (
                    <Card key={practitioner.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-1">{practitioner.name}</h3>
                            <p className="text-muted-foreground mb-2">{practitioner.title}</p>
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{practitioner.rating}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {practitioner.clinic?.name}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {practitioner.specialties.map((specialty, idx) => (
                            <Badge key={idx} variant="secondary">{specialty}</Badge>
                          ))}
                        </div>

                        {/* Match Reasons */}
                        {practitioner.matchReasons.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm text-muted-foreground mb-1">Why this practitioner matches:</p>
                            <div className="flex flex-wrap gap-1">
                              {practitioner.matchReasons.slice(0, 3).map((reason, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Bio excerpt */}
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {practitioner.bio}
                        </p>

                        {/* Consultation Types */}
                        <div className="flex items-center gap-4 mb-4">
                          {practitioner.consultationTypes.includes('in-person') && (
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3" />
                              In-person
                            </div>
                          )}
                          {practitioner.consultationTypes.includes('telehealth') && (
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3" />
                              Telehealth
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button 
                            className="w-full" 
                            onClick={() => {
                              const queryParams = new URLSearchParams({
                                practitioner: practitioner.id,
                                from: 'search',
                                specialty: filters.specialty.join(',') || '',
                                consultationType: filters.consultationType || '',
                                ...(filters.availability && { availability: filters.availability })
                              });
                              window.location.href = `/booking?${queryParams.toString()}`;
                            }}
                          >
                            Book Appointment
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {practitioners.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No practitioners found</h3>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your search criteria or filters to find the right practitioner for your needs.
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Suggestions:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {suggestions.slice(0, 3).map((suggestion, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                              onClick={() => {
                                updateFilter('query', suggestion);
                                setTimeout(handleSearch, 100);
                              }}
                            >
                              {suggestion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
