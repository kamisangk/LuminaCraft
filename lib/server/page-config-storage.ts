import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { createDefaultPageConfig, type ChatCompletionConfig, type PageConfig } from '@/store/useAppStore';

export type LegacyCompletionConfig = ChatCompletionConfig & {
  apiKey?: string;
};

export type StoredPageConfig = Omit<PageConfig, 'chatCompletion'> & {
  chatCompletion?: ChatCompletionConfig;
  aiCopilot?: LegacyCompletionConfig;
};

const DEFAULT_CHAT_COMPLETION_CONFIG: ChatCompletionConfig = {
  baseUrl: '',
  model: '',
  hasApiKey: false,
};

export function normalizeStoredChatCompletionConfig(
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

export function loadStoredPageConfig(configPath: string): StoredPageConfig | null {
  try {
    const raw = readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw) as StoredPageConfig;
    return {
      ...parsed,
      chatCompletion: normalizeStoredChatCompletionConfig(parsed.chatCompletion ?? parsed.aiCopilot),
    };
  } catch {
    return null;
  }
}

export function sanitizePageConfig(config: StoredPageConfig): PageConfig {
  return {
    ...config,
    chatCompletion: normalizeStoredChatCompletionConfig(config.chatCompletion ?? config.aiCopilot),
    modules: config.modules.map((module) => {
      if (!module.props.pluginSettings) return module;
      const { token: _t, cookie: _c, secret: _s, apiKey: _ak, api_key: _a, accessToken: _at, ...safeSettings } =
        module.props.pluginSettings as Record<string, unknown>;
      return { ...module, props: { ...module.props, pluginSettings: safeSettings } };
    }),
  };
}

export function mergeStoredPageConfig(body: PageConfig, existingConfig: StoredPageConfig | null): StoredPageConfig {
  const nextChatCompletion = normalizeStoredChatCompletionConfig(
    body.chatCompletion ?? existingConfig?.chatCompletion ?? existingConfig?.aiCopilot
  );

  return {
    ...body,
    chatCompletion: nextChatCompletion,
  };
}

export function saveStoredPageConfig(configPath: string, body: PageConfig): StoredPageConfig {
  mkdirSync(dirname(configPath), { recursive: true });
  const merged = mergeStoredPageConfig(body, loadStoredPageConfig(configPath));
  writeFileSync(configPath, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

export function loadOrCreateStoredPageConfig(configPath: string): StoredPageConfig {
  const existing = loadStoredPageConfig(configPath);
  if (existing) {
    return existing;
  }

  const created = mergeStoredPageConfig(createDefaultPageConfig(), null);
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, JSON.stringify(created, null, 2), 'utf-8');
  return created;
}
