'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, UserCircle, Stethoscope, Menu } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export const Header = () => {
  const { user, isAuthenticated } = useAuthStore();
  
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
          {isAuthenticated && user?.role === 'staff' && (
            <Link href="/staff" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Staff Dashboard
            </Link>
          )}
        </nav>
        
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/patient/dashboard">
                  <UserCircle className="mr-2 h-4 w-4" />
                  {user?.name}
                </Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/booking">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Now
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log In</Link>
              </Button>
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
