import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { AICopilotConfig, PageConfig } from '@/store/useAppStore';

const CONFIG_PATH = join(process.cwd(), 'data', 'config.json');

type StoredAICopilotConfig = AICopilotConfig & {
  apiKey?: string;
};

type StoredPageConfig = Omit<PageConfig, 'aiCopilot'> & {
  aiCopilot?: StoredAICopilotConfig;
};

const DEFAULT_AI_COPILOT_CONFIG: AICopilotConfig = {
  baseUrl: '',
  model: '',
  hasApiKey: false,
};

function normalizeStoredAICopilotConfig(config?: StoredAICopilotConfig | null): StoredAICopilotConfig {
  if (!config || typeof config !== 'object') {
    return { ...DEFAULT_AI_COPILOT_CONFIG };
  }

  const apiKey = typeof config.apiKey === 'string' ? config.apiKey.trim() : '';

  return {
    baseUrl: typeof config.baseUrl === 'string' ? config.baseUrl : DEFAULT_AI_COPILOT_CONFIG.baseUrl,
    model: typeof config.model === 'string' ? config.model : DEFAULT_AI_COPILOT_CONFIG.model,
    hasApiKey: apiKey.length > 0,
    ...(apiKey ? { apiKey } : {}),
  };
}

function loadConfig(): StoredPageConfig | null {
  try {
    const raw = readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as StoredPageConfig;
    return {
      ...parsed,
      aiCopilot: normalizeStoredAICopilotConfig(parsed.aiCopilot),
    };
  } catch {
    // fall through
  }

  return null;
}

function sanitizeAICopilotConfig(config?: StoredAICopilotConfig | null): AICopilotConfig {
  const normalized = normalizeStoredAICopilotConfig(config);
  return {
    baseUrl: normalized.baseUrl,
    model: normalized.model,
    hasApiKey: normalized.hasApiKey,
  };
}

function sanitizeConfig(config: StoredPageConfig): PageConfig {
  return {
    ...config,
    aiCopilot: sanitizeAICopilotConfig(config.aiCopilot),
    modules: config.modules.map((m) => {
      if (!m.props.pluginSettings) return m;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { token: _t, cookie: _c, secret: _s, apiKey: _ak, api_key: _a, accessToken: _at, ...safeSettings } =
        m.props.pluginSettings as Record<string, unknown>;
      return { ...m, props: { ...m.props, pluginSettings: safeSettings } };
    }),
  };
}

function mergeStoredConfig(body: PageConfig, existingConfig: StoredPageConfig | null): StoredPageConfig {
  const currentAi = normalizeStoredAICopilotConfig(existingConfig?.aiCopilot);
  const incomingAi = body.aiCopilot as AICopilotConfig & { apiKey?: string };
  const nextApiKey = typeof incomingAi?.apiKey === 'string' ? incomingAi.apiKey.trim() : '';

  return {
    ...body,
    aiCopilot: {
      baseUrl: typeof incomingAi?.baseUrl === 'string' ? incomingAi.baseUrl : currentAi.baseUrl,
      model: typeof incomingAi?.model === 'string' ? incomingAi.model : currentAi.model,
      hasApiKey: nextApiKey ? true : currentAi.hasApiKey,
      ...((nextApiKey ? nextApiKey : currentAi.apiKey) ? { apiKey: nextApiKey || currentAi.apiKey } : {}),
    },
  };
}

function isValidPageConfigBody(body: Partial<PageConfig>): body is PageConfig {
  return Boolean(body.version && body.layouts && body.modules && body.site && body.aiCopilot);
}

export function getStoredAICopilotConfig(): StoredAICopilotConfig {
  return normalizeStoredAICopilotConfig(loadConfig()?.aiCopilot);
}

export function resolveAICopilotRuntimeConfig(): { baseUrl: string; apiKey: string; model: string } {
  const stored = getStoredAICopilotConfig();

  return {
    baseUrl: stored.baseUrl || process.env.LUMINA_AI_BASE_URL || 'https://api.openai.com/v1',
    apiKey: stored.apiKey || process.env.LUMINA_AI_API_KEY || '',
    model: stored.model || process.env.LUMINA_AI_MODEL || 'gpt-4o-mini',
  };
}

export function toChatCompletionsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
}

export async function GET() {
  const config = loadConfig();
  if (!config) {
    return NextResponse.json({ error: 'No config saved yet' }, { status: 404 });
  }
  return NextResponse.json(sanitizeConfig(config));
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
    const { mkdirSync } = await import('fs');
    mkdirSync(join(process.cwd(), 'data'), { recursive: true });
    const merged = mergeStoredConfig(body, loadConfig());
    writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    console.error('[POST /api/config] write error:', err);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
