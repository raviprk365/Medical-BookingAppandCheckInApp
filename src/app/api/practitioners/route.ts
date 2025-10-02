import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/users';

export async function GET(request: NextRequest) {
  try {
    console.log('📖 API: Getting all practitioners');
    
    // Read current database
    const db = await readDatabase();
    
    // Get all practitioners
    const practitioners = db.practitioners || [];

    console.log('✅ API: Retrieved practitioners count:', practitioners.length);

    return NextResponse.json({ 
      success: true,
      data: practitioners
    });

  } catch (error) {
    console.error('💥 API: Error getting practitioners:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}