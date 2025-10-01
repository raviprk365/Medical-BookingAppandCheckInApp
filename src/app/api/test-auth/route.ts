import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/users';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Test API: Testing login for:', email);
    
    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' });
    }
    
    console.log('Test API: User found:', { id: user.id, email: user.email, role: user.role });
    console.log('Test API: Stored hash:', user.password);
    console.log('Test API: Provided password:', password);
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Test API: Password valid:', isValid);
    
    return NextResponse.json({ 
      success: isValid, 
      user: isValid ? { id: user.id, email: user.email, role: user.role } : null,
      message: isValid ? 'Login successful' : 'Invalid password'
    });
    
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ success: false, message: 'Server error' });
  }
}
