'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { FilterPanel } from '@/components/FilterPanel';
import { PractitionerCard } from '@/components/PractitionerCard';
import { Loader2 } from 'lucide-react';

export default function SearchPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [practitioners, setPractitioners] = useState([]);

  const handleApplyFilters = () => {
    setIsLoading(true);
    // TODO: Implement actual search functionality
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Find a Practitioner</h1>
          <p className="text-muted-foreground">
            Search and filter practitioners by specialty, location, and availability
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <FilterPanel onApplyFilters={handleApplyFilters} />
          </aside>

          <section className="lg:col-span-3" aria-label="Search results">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {!isLoading && (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  {practitioners.length} practitioner{practitioners.length !== 1 ? 's' : ''} found
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {practitioners.map((practitioner: any) => (
                    <PractitionerCard
                      key={practitioner.id}
                      practitioner={practitioner}
                      clinic={undefined}
                    />
                  ))}
                </div>

                {practitioners.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No practitioners found matching your filters.</p>
                    <p className="text-sm text-muted-foreground mt-2">Try adjusting your search criteria.</p>
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
