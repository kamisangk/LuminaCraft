import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecretBytes } from '@/lib/server/auth-config';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('lumina_token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecretBytes());
    return NextResponse.json({ authenticated: payload.role === 'owner' });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
