import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.LUMINA_JWT_SECRET ?? 'lumina-dev-secret-change-in-production'
);

export async function GET(req: NextRequest) {
  const token = req.cookies.get('lumina_token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return NextResponse.json({ authenticated: payload.role === 'owner' });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
