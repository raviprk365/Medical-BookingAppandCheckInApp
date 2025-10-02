import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/users';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('📖 API: Getting practitioner booking data for ID:', id);
    
    // Read current database
    const db = await readDatabase();
    
    // Find the practitioner
    const practitioner = db.practitioners?.find((p: any) => p.id === id);
    
    if (!practitioner) {
      console.log('❌ API: Practitioner not found:', id);
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 });
    }

    // Get existing appointments for this practitioner
    const existingAppointments = db.appointments?.filter((apt: any) => 
      apt.practitionerId === id && apt.status !== 'cancelled'
    ) || [];

    // Prepare booking data with real availability, breaks, and exceptions
    const bookingData = {
      id: practitioner.id,
      name: practitioner.name,
      title: practitioner.title,
      specialties: practitioner.specialties,
      rating: practitioner.rating,
      consultationTypes: practitioner.consultationTypes,
      availability: practitioner.settings?.availability || practitioner.availability || {},
      breaks: practitioner.settings?.breaks || [],
      exceptions: practitioner.settings?.exceptions || [],
      existingBookings: existingAppointments.map((apt: any) => ({
        date: apt.appointmentDate,
        start: apt.appointmentTime,
        duration: apt.duration || 30
      }))
    };

    console.log('✅ API: Practitioner booking data retrieved:', {
      id: bookingData.id,
      name: bookingData.name,
      breaksCount: bookingData.breaks.length,
      exceptionsCount: bookingData.exceptions.length,
      existingBookingsCount: bookingData.existingBookings.length
    });

    return NextResponse.json({ 
      success: true,
      data: bookingData
    });

  } catch (error) {
    console.error('💥 API: Error getting practitioner booking data:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}