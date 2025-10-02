'use client';

import Link from "next/link";
import { useSession, signOut } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Calendar, UserCircle, Stethoscope, Menu, LogOut } from "lucide-react";

export const Header = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };
  
  // Get the appropriate dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!session?.user?.role) return '/dashboard';
    
    switch (session.user.role) {
      case 'staff':
      case 'practitioner':
        return '/staff/dashboard';
      case 'admin':
        return '/admin/dashboard';
      case 'patient':
        return '/patient/dashboard';
      default:
        return '/dashboard';
    }
  };
  
  const dashboardUrl = getDashboardUrl();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">Sydney Med</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Find Practitioners
          </Link>
          <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          {isAuthenticated && (session?.user?.role === 'staff' || session?.user?.role === 'admin' || session?.user?.role === 'practitioner') && (
            <Link href={dashboardUrl} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
          )}
        </nav>
        
        <div className="flex items-center space-x-3">
          {isAuthenticated && session?.user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={dashboardUrl}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  {session.user.name}
                </Link>
              </Button>
              {session.user.role === 'patient' && (
                <Button variant="default" size="sm" asChild>
                  <Link href="/booking">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Now
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              {/* <Button variant="outline" size="sm" asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button> */}
              <Button variant="default" size="sm" asChild>
                <Link href="/booking">Book Appointment</Link>
              </Button>
            </>
          )}
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
