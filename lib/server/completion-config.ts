import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { ChatCompletionConfig } from '@/store/useAppStore';

type StoredCompletionConfig = ChatCompletionConfig & {
  apiKey?: string;
};

const COMPLETION_CONFIG_PATH = join(process.cwd(), 'data', 'completion-config.json');

const DEFAULT_COMPLETION_CONFIG: ChatCompletionConfig = {
  baseUrl: '',
  model: '',
  hasApiKey: false,
};

function normalizeStoredCompletionConfig(config?: StoredCompletionConfig | null): StoredCompletionConfig {
  if (!config || typeof config !== 'object') {
    return { ...DEFAULT_COMPLETION_CONFIG };
  }

  const apiKey = typeof config.apiKey === 'string' ? config.apiKey.trim() : '';

  return {
    baseUrl: typeof config.baseUrl === 'string' ? config.baseUrl : DEFAULT_COMPLETION_CONFIG.baseUrl,
    model: typeof config.model === 'string' ? config.model : DEFAULT_COMPLETION_CONFIG.model,
    hasApiKey: apiKey.length > 0,
    ...(apiKey ? { apiKey } : {}),
  };
}

function loadStoredCompletionConfig(): StoredCompletionConfig {
  try {
    const raw = readFileSync(COMPLETION_CONFIG_PATH, 'utf-8');
    return normalizeStoredCompletionConfig(JSON.parse(raw) as StoredCompletionConfig);
  } catch {
    return normalizeStoredCompletionConfig();
  }
}

export function getStoredCompletionConfig(): StoredCompletionConfig {
  return loadStoredCompletionConfig();
}

export function sanitizeCompletionConfig(config?: StoredCompletionConfig | null): ChatCompletionConfig {
  const normalized = normalizeStoredCompletionConfig(config);
  return {
    baseUrl: normalized.baseUrl,
    model: normalized.model,
    hasApiKey: normalized.hasApiKey,
  };
}

export function saveCompletionConfig(config?: StoredCompletionConfig | null) {
  mkdirSync(join(process.cwd(), 'data'), { recursive: true });
  const normalized = normalizeStoredCompletionConfig(config);
  writeFileSync(COMPLETION_CONFIG_PATH, JSON.stringify(normalized, null, 2), 'utf-8');
}

export function resolveCompletionRuntimeConfig(): { baseUrl: string; apiKey: string; model: string } {
  const stored = getStoredCompletionConfig();

  return {
    baseUrl: stored.baseUrl || process.env.LUMINA_AI_BASE_URL || 'https://api.openai.com/v1',
    apiKey: stored.apiKey || process.env.LUMINA_AI_API_KEY || '',
    model: stored.model || process.env.LUMINA_AI_MODEL || 'gpt-4o-mini',
  };
}

export function toChatCompletionsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
}
