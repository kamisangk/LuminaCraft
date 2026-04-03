import { NextRequest, NextResponse } from 'next/server';
import {
  getStoredCompletionConfig,
  sanitizeCompletionConfig,
  saveCompletionConfig,
} from '@/lib/server/completion-config';

interface CompletionConfigPayload {
  baseUrl?: string;
  model?: string;
  apiKey?: string;
}

function normalizePayload(body?: CompletionConfigPayload | null) {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const baseUrl = typeof body.baseUrl === 'string' ? body.baseUrl.trim() : '';
  const model = typeof body.model === 'string' ? body.model.trim() : '';
  const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';

  if (!baseUrl || !model) {
    return null;
  }

  return {
    baseUrl,
    model,
    ...(apiKey ? { apiKey } : {}),
  };
}

export async function GET() {
  return NextResponse.json(sanitizeCompletionConfig(getStoredCompletionConfig()));
}

export async function POST(req: NextRequest) {
  let body: CompletionConfigPayload;
  try {
    body = (await req.json()) as CompletionConfigPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const normalized = normalizePayload(body);
  if (!normalized) {
    return NextResponse.json({ error: 'Invalid completion config' }, { status: 400 });
  }

  const current = getStoredCompletionConfig();
  saveCompletionConfig({
    ...current,
    ...normalized,
    hasApiKey: normalized.apiKey ? true : current.hasApiKey,
  });

  return NextResponse.json(sanitizeCompletionConfig(getStoredCompletionConfig()));
}
