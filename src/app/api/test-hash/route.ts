import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { password, hash } = await request.json();
    
    console.log('🔐 Hash Test: Testing password verification');
    console.log('🔐 Hash Test: Password:', password);
    console.log('🔐 Hash Test: Hash:', hash);
    
    const isValid = await bcrypt.compare(password, hash);
    console.log('🔐 Hash Test: Result:', isValid);
    
    // Also test creating a new hash
    const newHash = await bcrypt.hash(password, 12);
    const newHashTest = await bcrypt.compare(password, newHash);
    
    return NextResponse.json({
      originalHashTest: isValid,
      newHashCreated: newHash,
      newHashTest: newHashTest,
      password: password,
      originalHash: hash
    });
  } catch (error) {
    console.error('🔐 Hash Test Error:', error);
    return NextResponse.json({ error: String(error) });
  }
}
