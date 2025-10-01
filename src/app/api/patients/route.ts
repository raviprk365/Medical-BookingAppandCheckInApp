/**
 * API Route: /api/patients
 * Handles patient CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllPatients, 
  getPatientById, 
  getPatientByEmail, 
  createPatient, 
  updatePatient 
} from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (id) {
      const patient = getPatientById(id);
      if (!patient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }
      return NextResponse.json(patient);
    }

    if (email) {
      const patient = getPatientByEmail(email);
      if (!patient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }
      return NextResponse.json(patient);
    }

    const patients = getAllPatients();
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'phone', 'email'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Check if patient with email already exists
    const existingPatient = getPatientByEmail(body.email);
    if (existingPatient) {
      return NextResponse.json({ error: 'Patient with this email already exists' }, { status: 409 });
    }

    // Set defaults for optional fields
    const patientData = {
      ...body,
      address: body.address || '',
      emergencyContact: body.emergencyContact || {
        name: '',
        phone: '',
        relationship: ''
      },
      medicalHistory: body.medicalHistory || {
        allergies: '',
        medications: '',
        conditions: []
      }
    };

    const newPatient = createPatient(patientData);
    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const updatedPatient = updatePatient(id, body);
    
    if (!updatedPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(updatedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
