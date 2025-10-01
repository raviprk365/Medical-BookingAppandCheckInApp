'use client';

import { Header } from "@/components/Header";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { Card } from "@/components/ui/card";

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <div className="container py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Book an Appointment</h1>
            <p className="text-lg text-muted-foreground">
              Follow the steps below to schedule your medical appointment
            </p>
          </div>
          
          <Card className="p-8 shadow-large">
            <BookingWizard />
          </Card>
        </div>
      </div>
    </div>
  );
}
