'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

type Task = 'generate_layout' | 'html_block';

export function AICopilotPanel() {
  const isOpen = useAppStore((s) => s.isAiCopilotOpen);
  const closeAiCopilot = useAppStore((s) => s.closeAiCopilot);
  const pageConfig = useAppStore((s) => s.pageConfig);
  const updateLayouts = useAppStore((s) => s.updateLayouts);
  const updateModuleProps = useAppStore((s) => s.updateModuleProps);
  const addModule = useAppStore((s) => s.addModule);
  const openModulePanel = useAppStore((s) => s.openModulePanel);
  const activePanelModuleId = useAppStore((s) => s.activePanelModuleId);
  const updateAICopilotConfig = useAppStore((s) => s.updateAICopilotConfig);

  const [task, setTask] = useState<Task>('generate_layout');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [configStatus, setConfigStatus] = useState('');
  const [baseUrl, setBaseUrl] = useState(pageConfig.aiCopilot.baseUrl);
  const [model, setModel] = useState(pageConfig.aiCopilot.model);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    setBaseUrl(pageConfig.aiCopilot.baseUrl);
    setModel(pageConfig.aiCopilot.model);
  }, [pageConfig.aiCopilot.baseUrl, pageConfig.aiCopilot.model]);

  const targetHtmlModule = useMemo(() => {
    const selected = pageConfig.modules.find((m) => m.id === activePanelModuleId && m.type === 'html_block');
    if (selected) return selected;
    return pageConfig.modules.find((m) => m.type === 'html_block') ?? null;
  }, [activePanelModuleId, pageConfig.modules]);

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    setConfigStatus('');
    setError('');

    const nextBaseUrl = baseUrl.trim();
    const nextModel = model.trim();
    const nextApiKey = apiKey.trim();

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-lumina-owner': 'local' },
        body: JSON.stringify({
          ...pageConfig,
          aiCopilot: {
            ...pageConfig.aiCopilot,
            baseUrl: nextBaseUrl,
            model: nextModel,
            hasApiKey: pageConfig.aiCopilot.hasApiKey || Boolean(nextApiKey),
            ...(nextApiKey ? { apiKey: nextApiKey } : {}),
          },
        }),
      });

      if (res.status === 401) {
        setError('未登录或权限不足，请先以拥有者身份登录。');
        return;
      }

      if (!res.ok) {
        setError(`配置保存失败: ${res.status}`);
        return;
      }

      updateAICopilotConfig({
        baseUrl: nextBaseUrl,
        model: nextModel,
        hasApiKey: pageConfig.aiCopilot.hasApiKey || Boolean(nextApiKey),
      });
      setApiKey('');
      setConfigStatus(nextApiKey ? 'AI 接口配置已保存，API Key 已更新。' : 'AI 接口配置已保存。');
    } catch {
      setError('配置保存失败，请检查连接。');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setResult('');

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task,
          prompt,
          currentContext: {
            layouts: pageConfig.layouts,
            modules: pageConfig.modules.map((m) => ({ id: m.id, type: m.type, title: m.title })),
          },
        }),
      });

      if (res.status === 401) {
        setError('未登录或权限不足，请先以拥有者身份登录。');
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? `请求失败: ${res.status}`);
        return;
      }

      const data = (await res.json()) as { result: string };
      setResult(data.result);

      if (task === 'generate_layout') {
        try {
          const parsed = JSON.parse(data.result);
          updateLayouts(parsed);
          setResult('布局已应用到页面。');
        } catch {
          // 保留原始结果让用户查看
        }
        return;
      }

      if (task === 'html_block') {
        if (targetHtmlModule) {
          updateModuleProps(targetHtmlModule.id, { htmlContent: data.result });
          openModulePanel(targetHtmlModule.id);
          setResult(`HTML 已应用到模块「${targetHtmlModule.title}」。\n\n${data.result}`);
        } else {
          const id = `html_block-${Date.now()}`;
          addModule({
            id,
            category: 'core',
            type: 'html_block',
            title: 'AI 生成 HTML',
            appearance: {
              colors: {
                primary: '#58a6ff',
                surface: 'rgba(22, 27, 34, 0.85)',
                text: '#e6edf3',
              },
              background: {
                type: 'color',
                value: 'rgba(255,255,255,0.02)',
                blur: 18,
                opacity: 1,
                noisePattern: false,
              },
              borderRadius: 16,
              padding: 16,
              shadow: 'medium',
            },
            props: { htmlContent: data.result },
          });
          openModulePanel(id);
          setResult(`已新建 HTML Block 并应用结果。\n\n${data.result}`);
        }
      }
    } catch {
      setError('网络请求失败，请检查连接。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          onClick={closeAiCopilot}
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'rgba(13,17,23,0.97)',
          backdropFilter: 'blur(24px) saturate(180%)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: isOpen ? '-8px 0 40px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div>
            <p className="text-xs opacity-40" style={{ color: 'var(--color-text)' }}>AI 辅助</p>
            <h3 className="text-sm font-semibold mt-0.5" style={{ color: 'var(--color-text)' }}>
              AI Copilot
            </h3>
          </div>
          <button
            onClick={closeAiCopilot}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
            aria-label="关闭"
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
            <div>
              <p className="text-xs opacity-50" style={{ color: 'var(--color-text)' }}>接口配置</p>
              <p className="mt-1 text-[11px] leading-relaxed text-white/45">
                在这里配置 OpenAI 兼容接口的 Base URL、API Key 和模型。
              </p>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs opacity-50" style={{ color: 'var(--color-text)' }}>Base URL</span>
              <input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full rounded-lg px-3 py-2 text-xs outline-none bg-white/5 border border-white/10 focus:border-purple-400/60 transition-colors"
                style={{ color: 'var(--color-text)' }}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs opacity-50" style={{ color: 'var(--color-text)' }}>模型</span>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gpt-4o-mini"
                className="w-full rounded-lg px-3 py-2 text-xs outline-none bg-white/5 border border-white/10 focus:border-purple-400/60 transition-colors"
                style={{ color: 'var(--color-text)' }}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs opacity-50" style={{ color: 'var(--color-text)' }}>API Key</span>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={pageConfig.aiCopilot.hasApiKey ? '已保存，留空则保持不变' : '输入新的 API Key'}
                className="w-full rounded-lg px-3 py-2 text-xs outline-none bg-white/5 border border-white/10 focus:border-purple-400/60 transition-colors"
                style={{ color: 'var(--color-text)' }}
              />
            </label>

            {pageConfig.aiCopilot.hasApiKey && (
              <p className="text-[11px] leading-relaxed text-emerald-400/80">当前已保存 API Key，输入新值可覆盖。</p>
            )}

            <button
              onClick={handleSaveConfig}
              disabled={savingConfig || !baseUrl.trim() || !model.trim()}
              className="w-full py-2 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {savingConfig ? '保存中…' : '保存接口配置'}
            </button>

            {configStatus && (
              <p className="text-xs text-emerald-400 bg-emerald-400/10 rounded-lg px-3 py-2">{configStatus}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs opacity-50" style={{ color: 'var(--color-text)' }}>任务类型</label>
            <div className="grid grid-cols-2 gap-1">
              {([
                { value: 'generate_layout', label: '生成布局' },
                { value: 'html_block', label: 'HTML Block' },
              ] as const).map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTask(t.value)}
                  className={`py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    task === t.value
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {task === 'html_block' && (
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] leading-relaxed text-white/45">
              {targetHtmlModule
                ? `将写入当前 HTML Block：${targetHtmlModule.title}`
                : '当前没有 HTML Block，生成后会自动新建一个。'}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs opacity-50" style={{ color: 'var(--color-text)' }}>自然语言描述</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder={
                task === 'generate_layout'
                  ? '例如：把布局调整为 3 列 Bento Grid，左侧放个人档案，右侧放 GitHub 和终端'
                  : '例如：生成一个实时显示北京时间的数字时钟卡片'
              }
              className="w-full rounded-lg px-3 py-2 text-xs outline-none bg-white/5 border border-white/10 focus:border-purple-400/60 transition-colors font-mono resize-none leading-relaxed"
              style={{ color: 'var(--color-text)' }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !prompt.trim()}
            className="w-full py-2 rounded-lg text-sm font-medium bg-purple-500/80 text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '生成中…' : '发送给 AI'}
          </button>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          {result && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs opacity-50" style={{ color: 'var(--color-text)' }}>AI 返回结果</label>
              <pre
                className="text-xs rounded-lg px-3 py-2 bg-white/5 border border-white/10 overflow-auto whitespace-pre-wrap leading-relaxed"
                style={{ color: 'var(--color-text)', maxHeight: '300px' }}
              >
                {result}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
