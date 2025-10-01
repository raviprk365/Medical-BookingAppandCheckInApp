/**
 * API Route: /api/appointments
 * Handles appointment CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByPatientId,
  getAppointmentsByDate,
  getAppointmentsByPractitioner,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  checkAppointmentConflict
} from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const patientId = searchParams.get('patientId');
    const practitionerId = searchParams.get('practitionerId');
    const date = searchParams.get('date');

    if (id) {
      const appointment = getAppointmentById(id);
      if (!appointment) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }
      return NextResponse.json(appointment);
    }

    if (patientId) {
      const appointments = getAppointmentsByPatientId(patientId);
      return NextResponse.json(appointments);
    }

    if (practitionerId) {
      const appointments = getAppointmentsByPractitioner(practitionerId, date || undefined);
      return NextResponse.json(appointments);
    }

    if (date) {
      const appointments = getAppointmentsByDate(date);
      return NextResponse.json(appointments);
    }

    const appointments = getAllAppointments();
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['patientId', 'practitionerId', 'appointmentDate', 'appointmentTime', 'duration', 'appointmentType', 'reason'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Check for appointment conflicts
    const hasConflict = checkAppointmentConflict(
      body.practitionerId,
      body.appointmentDate,
      body.appointmentTime,
      body.duration
    );

    if (hasConflict) {
      return NextResponse.json({ 
        error: 'Appointment conflict detected. This time slot is already booked.' 
      }, { status: 409 });
    }

    // Set defaults for optional fields
    const appointmentData = {
      ...body,
      clinicId: body.clinicId || 'clinic-1', // Default clinic
      urgency: body.urgency || 'routine',
      status: body.status || 'confirmed',
      notes: body.notes || '',
      medications: body.medications || '',
      allergies: body.allergies || '',
      symptoms: body.symptoms || '',
      bookingFor: body.bookingFor || 'myself',
      relationship: body.relationship || ''
    };

    const newAppointment = createAppointment(appointmentData);
    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    const body = await request.json();
    
    // If updating time/date/practitioner, check for conflicts
    if (body.practitionerId || body.appointmentDate || body.appointmentTime || body.duration) {
      const existingAppointment = getAppointmentById(id);
      if (!existingAppointment) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      const practitionerId = body.practitionerId || existingAppointment.practitionerId;
      const appointmentDate = body.appointmentDate || existingAppointment.appointmentDate;
      const appointmentTime = body.appointmentTime || existingAppointment.appointmentTime;
      const duration = body.duration || existingAppointment.duration;

      const hasConflict = checkAppointmentConflict(
        practitionerId,
        appointmentDate,
        appointmentTime,
        duration,
        id // Exclude current appointment from conflict check
      );

      if (hasConflict) {
        return NextResponse.json({ 
          error: 'Appointment conflict detected. This time slot is already booked.' 
        }, { status: 409 });
      }
    }

    const updatedAppointment = updateAppointment(id, body);
    
    if (!updatedAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    const deleted = deleteAppointment(id);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
