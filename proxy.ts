import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecretBytes } from '@/lib/server/auth-config';

const PROTECTED_PATHS = [
  { method: 'POST', path: '/api/config' },
  { method: 'POST', path: '/api/chat-completion' },
  { method: 'POST', path: '/api/completion-config' },
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  const needsAuth = PROTECTED_PATHS.some(
    (p) => method === p.method && pathname === p.path
  );

  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get('lumina_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecretBytes());
    if (payload.role !== 'owner') throw new Error('Not owner');
    return NextResponse.next();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/config', '/api/chat-completion', '/api/completion-config'],
};
