'use client';

import { Header } from "@/components/Header";
import { BookingWizard } from "@/components/booking/BookingWizard";

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <div className="container py-12 px-4">
        <BookingWizard />
      </div>
    </div>
  );
}
