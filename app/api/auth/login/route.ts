import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { getAuthRuntimeConfig, getJwtSecretBytes } from '@/lib/server/auth-config';

export async function POST(req: NextRequest) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { ownerPassword } = getAuthRuntimeConfig();

  if (body.password !== ownerPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = await new SignJWT({ role: 'owner' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecretBytes());

  const response = NextResponse.json({ ok: true });
  response.cookies.set('lumina_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
