import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.LUMINA_JWT_SECRET ?? 'lumina-dev-secret-change-in-production'
);
const DEFAULT_OWNER_PASSWORD = 'lumina-dev-password';

export async function POST(req: NextRequest) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const ownerPassword = process.env.LUMINA_OWNER_PASSWORD ?? DEFAULT_OWNER_PASSWORD;

  if (body.password !== ownerPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = await new SignJWT({ role: 'owner' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);

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
