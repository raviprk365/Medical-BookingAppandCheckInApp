import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '@/lib/users';

// Check database and return current users from db.json
export async function GET(request: NextRequest) {
  try {
    const db = await readDatabase();
    
    const users = (db.users || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clinicId: user.clinicId
    }));

    return NextResponse.json(
      { 
        message: 'Current users from db.json',
        users: users,
        count: users.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Database read error:', error);
    return NextResponse.json(
      { error: 'Failed to read database' },
      { status: 500 }
    );
  }
}

// This route now just reads from db.json instead of creating conflicting users
export async function POST(request: NextRequest) {
  try {
    const db = await readDatabase();
    
    return NextResponse.json(
      { 
        message: 'Database uses existing db.json file. No initialization needed.',
        userCount: (db.users || []).length,
        testCredentials: {
          admin: 'admin@sydneymed.com / password123',
          doctor: 'doctor@sydneymed.com / password123',
          staff: 'reception@sydneymed.com / password123',
          patient: 'patient1@example.com / password123'
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to access database' },
      { status: 500 }
    );
  }
}
