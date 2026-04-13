import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import type { PageConfig } from '@/store/useAppStore';
import {
  loadOrCreateStoredPageConfig,
  sanitizePageConfig,
  saveStoredPageConfig,
} from '@/lib/server/page-config-storage';

const CONFIG_PATH = join(process.cwd(), 'data', 'config.json');

function isValidPageConfigBody(body: Partial<PageConfig>): body is PageConfig {
  return Boolean(body.version && body.layouts && body.modules && body.site && body.chatCompletion);
}

export async function GET() {
  try {
    const config = loadOrCreateStoredPageConfig(CONFIG_PATH);
    return NextResponse.json(sanitizePageConfig(config));
  } catch (err) {
    console.error('[GET /api/config] load error:', err);
    return NextResponse.json({ error: 'Failed to load config' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: PageConfig;
  try {
    body = (await req.json()) as PageConfig;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!isValidPageConfigBody(body)) {
    return NextResponse.json({ error: 'Invalid PageConfig structure' }, { status: 400 });
  }

  try {
    saveStoredPageConfig(CONFIG_PATH, body);
  } catch (err) {
    console.error('[POST /api/config] write error:', err);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
