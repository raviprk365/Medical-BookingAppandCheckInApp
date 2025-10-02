'use client';

import { usePathname } from 'next/navigation';

// Centralized loading configuration
export const LOADING_MESSAGES = {
  // Staff Dashboard Routes
  '/staff/dashboard': 'Loading dashboard overview...',
  '/staff/dashboard/today': 'Loading today\'s schedule...',
  '/staff/dashboard/calendar': 'Loading appointment calendar...',
  '/staff/dashboard/messages': 'Loading patient messages...',
  '/staff/dashboard/waiting': 'Loading waiting room status...',
  '/staff/dashboard/settings': 'Loading system settings...',
  
  // Patient Portal Routes
  '/patient/dashboard': 'Loading your dashboard...',
  '/patient/appointments': 'Loading your appointments...',
  '/patient/profile': 'Loading your profile...',
  '/patient/booking': 'Loading appointment booking...',
  
  // Authentication Routes
  '/auth/signin': 'Signing you in...',
  '/auth/signup': 'Creating your account...',
  '/auth/forgot-password': 'Loading password reset...',
  
  // General Routes
  '/booking': 'Loading booking system...',
  '/search': 'Searching for appointments...',
  '/about': 'Loading information...',
  '/contact': 'Loading contact details...',
} as const;

// Pattern matching for dynamic routes
const LOADING_PATTERNS = {
  '/staff': 'Loading staff portal...',
  '/patient': 'Loading patient portal...',
  '/auth': 'Authenticating...',
  '/booking': 'Loading booking...',
  '/admin': 'Loading admin panel...',
} as const;

/**
 * Hook to get appropriate loading message based on current route
 * @param customMessage Optional custom message to override default
 * @returns Loading message string
 */
export function useLoadingMessage(customMessage?: string): string {
  const pathname = usePathname();
  
  if (customMessage) {
    return customMessage;
  }
  
  // Exact route match
  if (LOADING_MESSAGES[pathname as keyof typeof LOADING_MESSAGES]) {
    return LOADING_MESSAGES[pathname as keyof typeof LOADING_MESSAGES];
  }
  
  // Pattern matching for dynamic routes
  for (const [pattern, message] of Object.entries(LOADING_PATTERNS)) {
    if (pathname.startsWith(pattern)) {
      return message;
    }
  }
  
  // Default fallback
  return 'Loading...';
}

/**
 * Get loading message without hook (for use in non-component contexts)
 * @param pathname The route pathname
 * @param customMessage Optional custom message
 * @returns Loading message string
 */
export function getLoadingMessage(pathname: string, customMessage?: string): string {
  if (customMessage) {
    return customMessage;
  }
  
  // Exact route match
  if (LOADING_MESSAGES[pathname as keyof typeof LOADING_MESSAGES]) {
    return LOADING_MESSAGES[pathname as keyof typeof LOADING_MESSAGES];
  }
  
  // Pattern matching
  for (const [pattern, message] of Object.entries(LOADING_PATTERNS)) {
    if (pathname.startsWith(pattern)) {
      return message;
    }
  }
  
  return 'Loading...';
}

/**
 * Add or update loading messages dynamically
 * @param route The route path
 * @param message The loading message
 */
export function setLoadingMessage(route: string, message: string) {
  (LOADING_MESSAGES as any)[route] = message;
}
