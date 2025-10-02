import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '@/lib/users';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { availability, breaks, exceptions } = body;

    console.log('💾 API: Updating practitioner settings for ID:', id);
    console.log('📊 API: Session user:', { 
      id: session.user.id, 
      role: session.user.role,
      practitionerId: (session.user as any).practitionerId,
      fullUser: session.user
    });
    
    // Verify the user can update this practitioner's settings
    // (either it's their own settings or they're an admin)
    const practitionerId = (session.user as any).practitionerId;
    const canUpdate = 
      session.user.role === 'admin' || 
      (session.user.role === 'doctor' && practitionerId === id);
    
    console.log('🔍 API: Authorization check:', {
      userRole: session.user.role,
      userPractitionerId: practitionerId,
      requestedId: id,
      canUpdate
    });
    
    if (!canUpdate) {
      console.log('❌ API: User not authorized to update these settings');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Read current database
    const db = await readDatabase();
    
    // Find the practitioner
    const practitionerIndex = db.practitioners?.findIndex((p: any) => p.id === id);
    
    if (practitionerIndex === -1) {
      console.log('❌ API: Practitioner not found:', id);
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 });
    }

    // Update practitioner data
    if (!db.practitioners[practitionerIndex].settings) {
      db.practitioners[practitionerIndex].settings = {};
    }

    db.practitioners[practitionerIndex].settings = {
      availability,
      breaks,
      exceptions,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.id
    };

    // Also update the availability field for backward compatibility
    if (availability) {
      db.practitioners[practitionerIndex].availability = availability;
    }

    // Save to database
    await writeDatabase(db);
    
    console.log('✅ API: Settings saved successfully for practitioner:', id);

    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully',
      data: {
        availability,
        breaks,
        exceptions
      }
    });

  } catch (error) {
    console.error('💥 API: Error updating practitioner settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    console.log('📖 API: Getting practitioner settings for ID:', id);
    
    // Read current database
    const db = await readDatabase();
    
    // Find the practitioner
    const practitioner = db.practitioners?.find((p: any) => p.id === id);
    
    if (!practitioner) {
      console.log('❌ API: Practitioner not found:', id);
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 });
    }

    console.log('✅ API: Settings retrieved successfully for practitioner:', id);

    return NextResponse.json({ 
      success: true,
      data: {
        availability: practitioner.availability || {},
        breaks: practitioner.settings?.breaks || [],
        exceptions: practitioner.settings?.exceptions || []
      }
    });

  } catch (error) {
    console.error('💥 API: Error getting practitioner settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}