import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Session Test: Starting session check');
    const session = await getServerSession(authOptions);
    console.log('🔍 Session Test: Session result:', session);
    
    return NextResponse.json({
      hasSession: !!session,
      session: session,
      user: session?.user || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('🔍 Session Test Error:', error);
    return NextResponse.json({ 
      error: String(error),
      hasSession: false,
      timestamp: new Date().toISOString()
    });
  }
}
