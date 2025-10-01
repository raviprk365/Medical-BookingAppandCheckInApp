import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/users';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test: Starting DB test');
    const db = await readDatabase();
    console.log('🧪 Test: Database loaded successfully');
    console.log('🧪 Test: Users count:', db.users?.length || 0);
    
    if (db.users && db.users.length > 0) {
      console.log('🧪 Test: First user:', {
        id: db.users[0].id,
        email: db.users[0].email,
        role: db.users[0].role,
        hasPassword: !!db.users[0].password
      });
    }
    
    return NextResponse.json({
      success: true,
      usersCount: db.users?.length || 0,
      users: (db.users || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        hasPassword: !!u.password
      }))
    });
  } catch (error) {
    console.error('🧪 Test: Database error:', error);
    return NextResponse.json({ success: false, error: String(error) });
  }
}
