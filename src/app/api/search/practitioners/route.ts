import { NextRequest, NextResponse } from 'next/server';

// Base API URL for accessing db.json
const API_BASE = 'http://localhost:3001';

// Condition to specialty mapping for intelligent search
const CONDITION_MAPPING: Record<string, string[]> = {
  // Diabetes and metabolic
  'diabetes': ['Diabetes Care', 'Chronic Disease Management', 'General Practice'],
  'blood sugar': ['Diabetes Care', 'General Practice'],
  'weight management': ['Chronic Disease Management', 'General Practice'],
  
  // Women's health
  'pregnancy': ['Women\'s Health', 'General Practice'],
  'prenatal': ['Women\'s Health', 'General Practice'],
  'gynecology': ['Women\'s Health'],
  'contraception': ['Women\'s Health', 'General Practice'],
  'menopause': ['Women\'s Health', 'General Practice'],
  
  // Children and pediatrics
  'children': ['Pediatrics', 'General Practice'],
  'kids': ['Pediatrics', 'General Practice'],
  'baby': ['Pediatrics', 'General Practice'],
  'infant': ['Pediatrics', 'General Practice'],
  'child': ['Pediatrics', 'General Practice'],
  'vaccination': ['Pediatrics', 'General Practice'],
  'immunization': ['Pediatrics', 'General Practice'],
  
  // Mental health
  'depression': ['Mental Health', 'General Practice'],
  'anxiety': ['Mental Health', 'General Practice'],
  'stress': ['Mental Health', 'General Practice'],
  'mental health': ['Mental Health'],
  'counseling': ['Mental Health'],
  'therapy': ['Mental Health'],
  
  // Skin conditions
  'skin': ['Skin Checks', 'General Practice'],
  'mole': ['Skin Checks', 'General Practice'],
  'rash': ['Skin Checks', 'General Practice'],
  'skin cancer': ['Skin Checks', 'Minor Surgery'],
  'dermatology': ['Skin Checks'],
  
  // Travel medicine
  'travel': ['Travel Medicine', 'General Practice'],
  'vaccine': ['Travel Medicine', 'General Practice'],
  'international': ['Travel Medicine'],
  
  // General conditions
  'chronic disease': ['Chronic Disease Management', 'General Practice'],
  'surgery': ['Minor Surgery', 'General Practice'],
  'general': ['General Practice'],
  'checkup': ['General Practice'],
  'physical': ['General Practice']
};

// Common search terms and their mappings
const SEARCH_SUGGESTIONS = [
  'diabetes care',
  'women\'s health',
  'pediatrics',
  'mental health',
  'skin checks',
  'travel medicine',
  'general checkup',
  'chronic disease',
  'pregnancy care',
  'children\'s health'
];

interface SearchFilters {
  query?: string;
  specialty?: string[];
  consultationType?: 'in-person' | 'telehealth' | 'both';
  availability?: 'today' | 'thisWeek' | 'anytime';
  rating?: number;
  sortBy?: 'rating' | 'nextAvailable' | 'relevance';
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
  availability: any;
  matchReasons: string[];
  relevanceScore: number;
}

async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return response.json();
}

function mapConditionToSpecialties(query: string): string[] {
  const queryLower = query.toLowerCase();
  const matchedSpecialties = new Set<string>();
  
  // Check each condition mapping
  Object.entries(CONDITION_MAPPING).forEach(([condition, specialties]) => {
    if (queryLower.includes(condition)) {
      specialties.forEach(specialty => matchedSpecialties.add(specialty));
    }
  });
  
  return Array.from(matchedSpecialties);
}

function calculateRelevanceScore(practitioner: any, query: string, mappedSpecialties: string[]): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  const queryLower = query.toLowerCase();
  const practitionerName = practitioner.name.toLowerCase();
  const practitionerBio = (practitioner.bio || '').toLowerCase();
  
  // Direct name match
  if (practitionerName.includes(queryLower)) {
    score += 100;
    reasons.push('Name matches search');
  }
  
  // Specialty matches
  practitioner.specialties.forEach((specialty: string) => {
    if (mappedSpecialties.includes(specialty)) {
      score += 50;
      reasons.push(`Specializes in ${specialty}`);
    }
    
    if (specialty.toLowerCase().includes(queryLower)) {
      score += 30;
      reasons.push(`Specialty: ${specialty}`);
    }
  });
  
  // Bio content match
  if (practitionerBio.includes(queryLower)) {
    score += 20;
    reasons.push('Experience matches your needs');
  }
  
  // Rating bonus
  score += (practitioner.rating || 0) * 5;
  
  // Consultation type availability
  if (practitioner.consultationTypes?.includes('telehealth')) {
    score += 5;
    reasons.push('Telehealth available');
  }
  
  return { score, reasons };
}

function filterByConsultationType(practitioners: any[], consultationType?: string) {
  if (!consultationType || consultationType === 'both') {
    return practitioners;
  }
  
  return practitioners.filter(practitioner => 
    practitioner.consultationTypes?.includes(consultationType)
  );
}

function filterByRating(practitioners: any[], minRating?: number) {
  if (!minRating) return practitioners;
  
  return practitioners.filter(practitioner => 
    (practitioner.rating || 0) >= minRating
  );
}

function sortPractitioners(practitioners: EnhancedPractitioner[], sortBy: string = 'relevance') {
  switch (sortBy) {
    case 'rating':
      return practitioners.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'nextAvailable':
      // TODO: Implement availability-based sorting
      return practitioners.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'relevance':
    default:
      return practitioners.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: SearchFilters = {
      query: searchParams.get('query') || '',
      specialty: searchParams.getAll('specialty'),
      consultationType: searchParams.get('consultationType') as any,
      availability: searchParams.get('availability') as any,
      rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
      sortBy: searchParams.get('sortBy') || 'relevance'
    };

    console.log('🔍 Search API called with filters:', filters);

    // Fetch real data from db.json
    const [practitioners, clinics] = await Promise.all([
      fetchFromAPI<any[]>('/practitioners'),
      fetchFromAPI<any[]>('/clinics')
    ]);

    console.log(`📋 Fetched ${practitioners.length} practitioners from db.json`);

    let filteredPractitioners = [...practitioners];

    // Apply query-based filtering
    if (filters.query) {
      const mappedSpecialties = mapConditionToSpecialties(filters.query);
      console.log(`🎯 Mapped query "${filters.query}" to specialties:`, mappedSpecialties);
      
      // Calculate relevance scores for each practitioner
      const scoredPractitioners = filteredPractitioners.map(practitioner => {
        const { score, reasons } = calculateRelevanceScore(practitioner, filters.query!, mappedSpecialties);
        return {
          ...practitioner,
          relevanceScore: score,
          matchReasons: reasons
        };
      });

      // Filter out low relevance scores (keep only scores > 0)
      filteredPractitioners = scoredPractitioners.filter(p => p.relevanceScore > 0);
    } else {
      // No query, add default relevance scores
      filteredPractitioners = filteredPractitioners.map(practitioner => ({
        ...practitioner,
        relevanceScore: (practitioner.rating || 0) * 10,
        matchReasons: [`Rated ${practitioner.rating || 'N/A'} stars`]
      }));
    }

    // Apply specialty filter
    if (filters.specialty && filters.specialty.length > 0) {
      filteredPractitioners = filteredPractitioners.filter(practitioner =>
        filters.specialty!.some(specialty => 
          practitioner.specialties?.includes(specialty)
        )
      );
    }

    // Apply consultation type filter
    filteredPractitioners = filterByConsultationType(filteredPractitioners, filters.consultationType);

    // Apply rating filter
    filteredPractitioners = filterByRating(filteredPractitioners, filters.rating);

    // Sort results
    const sortedPractitioners = sortPractitioners(filteredPractitioners as EnhancedPractitioner[], filters.sortBy);

    // Add clinic information to each practitioner
    const enrichedPractitioners = sortedPractitioners.map(practitioner => {
      const clinic = clinics.find(c => c.id === practitioner.clinicId);
      return {
        ...practitioner,
        clinic: clinic ? {
          name: clinic.name,
          address: clinic.address,
          phone: clinic.phone
        } : null
      };
    });

    // Generate search suggestions based on query
    let suggestions: string[] = [];
    if (filters.query) {
      suggestions = SEARCH_SUGGESTIONS.filter(suggestion =>
        suggestion.toLowerCase().includes(filters.query!.toLowerCase())
      ).slice(0, 5);
    } else {
      suggestions = SEARCH_SUGGESTIONS.slice(0, 5);
    }

    const response = {
      success: true,
      data: {
        practitioners: enrichedPractitioners,
        totalResults: enrichedPractitioners.length,
        suggestions,
        appliedFilters: filters,
        searchTime: Date.now()
      }
    };

    console.log(`✅ Search completed: ${enrichedPractitioners.length} results`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 Search API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search practitioners',
        data: {
          practitioners: [],
          totalResults: 0,
          suggestions: SEARCH_SUGGESTIONS.slice(0, 5)
        }
      }, 
      { status: 500 }
    );
  }
}

// GET suggestions endpoint for autocomplete
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          suggestions: SEARCH_SUGGESTIONS.slice(0, 5),
          conditions: Object.keys(CONDITION_MAPPING).slice(0, 10)
        }
      });
    }

    const queryLower = query.toLowerCase();
    
    // Get condition suggestions
    const conditionSuggestions = Object.keys(CONDITION_MAPPING)
      .filter(condition => condition.includes(queryLower))
      .slice(0, 5);
    
    // Get general suggestions
    const generalSuggestions = SEARCH_SUGGESTIONS
      .filter(suggestion => suggestion.toLowerCase().includes(queryLower))
      .slice(0, 5);
    
    return NextResponse.json({
      success: true,
      data: {
        suggestions: [...new Set([...conditionSuggestions, ...generalSuggestions])].slice(0, 8),
        conditions: conditionSuggestions
      }
    });

  } catch (error) {
    console.error('💥 Suggestions API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get suggestions',
        data: { suggestions: [], conditions: [] }
      }, 
      { status: 500 }
    );
  }
}