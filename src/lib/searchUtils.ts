// Search utilities for condition-based doctor search

export interface SearchSuggestion {
  condition: string;
  specialties: string[];
  description: string;
  icon?: string;
}

// Comprehensive condition to specialty mapping
export const CONDITION_MAPPING: Record<string, string[]> = {
  // Diabetes and metabolic conditions
  'diabetes': ['Diabetes Care', 'Chronic Disease Management', 'General Practice'],
  'blood sugar': ['Diabetes Care', 'General Practice'],
  'weight management': ['Chronic Disease Management', 'General Practice'],
  'obesity': ['Chronic Disease Management', 'General Practice'],
  'cholesterol': ['Chronic Disease Management', 'General Practice'],
  
  // Women's health
  'pregnancy': ['Women\'s Health', 'General Practice'],
  'prenatal': ['Women\'s Health', 'General Practice'],
  'gynecology': ['Women\'s Health'],
  'contraception': ['Women\'s Health', 'General Practice'],
  'menopause': ['Women\'s Health', 'General Practice'],
  'womens health': ['Women\'s Health'],
  'pap smear': ['Women\'s Health', 'General Practice'],
  'breast': ['Women\'s Health', 'General Practice'],
  
  // Children and pediatrics
  'children': ['Pediatrics', 'General Practice'],
  'kids': ['Pediatrics', 'General Practice'],
  'baby': ['Pediatrics', 'General Practice'],
  'infant': ['Pediatrics', 'General Practice'],
  'child': ['Pediatrics', 'General Practice'],
  'vaccination': ['Pediatrics', 'General Practice'],
  'immunization': ['Pediatrics', 'General Practice'],
  'pediatric': ['Pediatrics'],
  'growth': ['Pediatrics', 'General Practice'],
  'development': ['Pediatrics', 'General Practice'],
  
  // Mental health
  'depression': ['Mental Health', 'General Practice'],
  'anxiety': ['Mental Health', 'General Practice'],
  'stress': ['Mental Health', 'General Practice'],
  'mental health': ['Mental Health'],
  'counseling': ['Mental Health'],
  'therapy': ['Mental Health'],
  'psychiatry': ['Mental Health'],
  'psychological': ['Mental Health'],
  'mood': ['Mental Health', 'General Practice'],
  
  // Skin conditions
  'skin': ['Skin Checks', 'General Practice'],
  'mole': ['Skin Checks', 'General Practice'],
  'rash': ['Skin Checks', 'General Practice'],
  'skin cancer': ['Skin Checks', 'Minor Surgery'],
  'dermatology': ['Skin Checks'],
  'acne': ['Skin Checks', 'General Practice'],
  'eczema': ['Skin Checks', 'General Practice'],
  'psoriasis': ['Skin Checks', 'General Practice'],
  
  // Travel medicine
  'travel': ['Travel Medicine', 'General Practice'],
  'vaccine': ['Travel Medicine', 'General Practice'],
  'international': ['Travel Medicine'],
  'overseas': ['Travel Medicine', 'General Practice'],
  'malaria': ['Travel Medicine'],
  'yellow fever': ['Travel Medicine'],
  
  // General conditions
  'chronic disease': ['Chronic Disease Management', 'General Practice'],
  'surgery': ['Minor Surgery', 'General Practice'],
  'general': ['General Practice'],
  'checkup': ['General Practice'],
  'physical': ['General Practice'],
  'examination': ['General Practice'],
  'health check': ['General Practice'],
  'routine': ['General Practice']
};

// Popular search suggestions with descriptions
export const SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  {
    condition: 'Diabetes Care',
    specialties: ['Diabetes Care', 'Chronic Disease Management'],
    description: 'Blood sugar management, diabetes monitoring, and lifestyle advice'
  },
  {
    condition: 'Women\'s Health',
    specialties: ['Women\'s Health'],
    description: 'Pregnancy care, gynecology, contraception, and women-specific health needs'
  },
  {
    condition: 'Children\'s Health',
    specialties: ['Pediatrics'],
    description: 'Child development, vaccinations, and pediatric care'
  },
  {
    condition: 'Mental Health',
    specialties: ['Mental Health'],
    description: 'Depression, anxiety, stress management, and psychological support'
  },
  {
    condition: 'Skin Checks',
    specialties: ['Skin Checks'],
    description: 'Mole checks, skin cancer screening, and dermatological concerns'
  },
  {
    condition: 'Travel Medicine',
    specialties: ['Travel Medicine'],
    description: 'Travel vaccinations, overseas health advice, and travel health planning'
  },
  {
    condition: 'General Checkup',
    specialties: ['General Practice'],
    description: 'Routine health checks, preventive care, and general medical consultation'
  },
  {
    condition: 'Chronic Disease Management',
    specialties: ['Chronic Disease Management'],
    description: 'Long-term health condition management and monitoring'
  }
];

// Quick condition buttons for home page
export const QUICK_CONDITIONS = [
  'Diabetes Care',
  'Women\'s Health', 
  'Children\'s Health',
  'Mental Health',
  'Skin Checks',
  'Travel Medicine',
  'General Checkup',
  'Chronic Disease'
];

/**
 * Maps a search query to relevant specialties
 * @param query - User search input
 * @returns Array of matching specialties
 */
export function mapConditionToSpecialties(query: string): string[] {
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

/**
 * Get search suggestions based on user input
 * @param query - User search input
 * @returns Array of relevant suggestions
 */
export function getSearchSuggestions(query: string): string[] {
  if (!query || query.length < 2) {
    return QUICK_CONDITIONS;
  }

  const queryLower = query.toLowerCase();
  
  // Get condition suggestions
  const conditionSuggestions = Object.keys(CONDITION_MAPPING)
    .filter(condition => condition.includes(queryLower))
    .slice(0, 5);
  
  // Get general suggestions
  const generalSuggestions = QUICK_CONDITIONS
    .filter(suggestion => suggestion.toLowerCase().includes(queryLower))
    .slice(0, 5);
  
  return Array.from(new Set([...conditionSuggestions, ...generalSuggestions])).slice(0, 8);
}

/**
 * Calculate relevance score for a practitioner based on search query
 * @param practitioner - Practitioner data
 * @param query - Search query
 * @param mappedSpecialties - Specialties mapped from query
 * @returns Relevance score and match reasons
 */
export function calculatePractitionerRelevance(
  practitioner: any, 
  query: string, 
  mappedSpecialties: string[]
): { score: number; reasons: string[] } {
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
  practitioner.specialties?.forEach((specialty: string) => {
    if (mappedSpecialties.includes(specialty)) {
      score += 50;
      reasons.push(`Specializes in ${specialty}`);
    }
    
    if (specialty.toLowerCase().includes(queryLower)) {
      score += 30;
      reasons.push(`Expert in ${specialty}`);
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

/**
 * Get practitioner availability status
 * @param practitioner - Practitioner data
 * @returns Availability information
 */
export function getPractitionerAvailability(practitioner: any): {
  isAvailableToday: boolean;
  nextAvailable: string;
  hasWeekendAvailability: boolean;
} {
  // This would integrate with real availability data
  // For now, return mock data based on practitioner schedule
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[today];
  
  const availability = practitioner.availability || {};
  const isAvailableToday = availability[todayName]?.enabled !== false && 
                          (Array.isArray(availability[todayName]) ? 
                           availability[todayName].length > 0 : 
                           availability[todayName]?.sessions?.length > 0);
  
  // Check weekend availability
  const hasWeekendAvailability = availability.saturday?.enabled || availability.sunday?.enabled;
  
  return {
    isAvailableToday,
    nextAvailable: isAvailableToday ? 'Today' : 'This week',
    hasWeekendAvailability
  };
}

/**
 * Sort practitioners by different criteria
 * @param practitioners - Array of practitioners
 * @param sortBy - Sort criteria
 * @returns Sorted practitioners
 */
export function sortPractitioners(practitioners: any[], sortBy: string = 'relevance'): any[] {
  switch (sortBy) {
    case 'rating':
      return [...practitioners].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'nextAvailable':
      return [...practitioners].sort((a, b) => {
        const availA = getPractitionerAvailability(a);
        const availB = getPractitionerAvailability(b);
        if (availA.isAvailableToday && !availB.isAvailableToday) return -1;
        if (!availA.isAvailableToday && availB.isAvailableToday) return 1;
        return (b.rating || 0) - (a.rating || 0); // Secondary sort by rating
      });
    case 'relevance':
    default:
      return [...practitioners].sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  }
}