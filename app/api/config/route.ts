import { NextRequest, NextResponse } from 'next/server';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { ChatCompletionConfig, PageConfig } from '@/store/useAppStore';

const CONFIG_PATH = join(process.cwd(), 'data', 'config.json');

type LegacyCompletionConfig = ChatCompletionConfig & {
  apiKey?: string;
};

type StoredPageConfig = Omit<PageConfig, 'chatCompletion'> & {
  chatCompletion?: ChatCompletionConfig;
  aiCopilot?: LegacyCompletionConfig;
};

const DEFAULT_CHAT_COMPLETION_CONFIG: ChatCompletionConfig = {
  baseUrl: '',
  model: '',
  hasApiKey: false,
};

function normalizeStoredChatCompletionConfig(
  config?: Partial<ChatCompletionConfig> | LegacyCompletionConfig | null
): ChatCompletionConfig {
  if (!config || typeof config !== 'object') {
    return { ...DEFAULT_CHAT_COMPLETION_CONFIG };
  }

  return {
    baseUrl: typeof config.baseUrl === 'string' ? config.baseUrl : DEFAULT_CHAT_COMPLETION_CONFIG.baseUrl,
    model: typeof config.model === 'string' ? config.model : DEFAULT_CHAT_COMPLETION_CONFIG.model,
    hasApiKey: typeof config.hasApiKey === 'boolean' ? config.hasApiKey : DEFAULT_CHAT_COMPLETION_CONFIG.hasApiKey,
  };
}

function loadConfig(): StoredPageConfig | null {
  try {
    const raw = readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as StoredPageConfig;
    return {
      ...parsed,
      chatCompletion: normalizeStoredChatCompletionConfig(parsed.chatCompletion ?? parsed.aiCopilot),
    };
  } catch {
    return null;
  }
}

function sanitizeConfig(config: StoredPageConfig): PageConfig {
  return {
    ...config,
    chatCompletion: normalizeStoredChatCompletionConfig(config.chatCompletion ?? config.aiCopilot),
    modules: config.modules.map((m) => {
      if (!m.props.pluginSettings) return m;
      const { token: _t, cookie: _c, secret: _s, apiKey: _ak, api_key: _a, accessToken: _at, ...safeSettings } =
        m.props.pluginSettings as Record<string, unknown>;
      return { ...m, props: { ...m.props, pluginSettings: safeSettings } };
    }),
  };
}

function mergeStoredConfig(body: PageConfig, existingConfig: StoredPageConfig | null): StoredPageConfig {
  const nextChatCompletion = normalizeStoredChatCompletionConfig(
    body.chatCompletion ?? existingConfig?.chatCompletion ?? existingConfig?.aiCopilot
  );

  return {
    ...body,
    chatCompletion: nextChatCompletion,
  };
}

function isValidPageConfigBody(body: Partial<PageConfig>): body is PageConfig {
  return Boolean(body.version && body.layouts && body.modules && body.site && body.chatCompletion);
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
    mkdirSync(join(process.cwd(), 'data'), { recursive: true });
    const merged = mergeStoredConfig(body, loadConfig());
    writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    console.error('[POST /api/config] write error:', err);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
