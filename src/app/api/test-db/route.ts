/**
 * API Route: /api/test-db
 * Test endpoint to verify database functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllPatients, getAllAppointments, readDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const test = searchParams.get('test');

    if (test === 'patients') {
      const patients = getAllPatients();
      return NextResponse.json({ 
        success: true, 
        count: patients.length, 
        data: patients 
      });
    }

    if (test === 'appointments') {
      const appointments = getAllAppointments();
      return NextResponse.json({ 
        success: true, 
        count: appointments.length, 
        data: appointments 
      });
    }

    if (test === 'all') {
      const db = readDatabase();
      return NextResponse.json({ 
        success: true, 
        structure: {
          patients: db.patients?.length || 0,
          appointments: db.appointments?.length || 0,
          clinics: db.clinics?.length || 0,
          practitioners: db.practitioners?.length || 0,
          specialties: db.specialties?.length || 0
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database test endpoint',
      availableTests: ['patients', 'appointments', 'all'],
      usage: '/api/test-db?test=patients'
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
