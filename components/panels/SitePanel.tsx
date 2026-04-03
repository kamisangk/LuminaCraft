'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useAppStore, Breakpoint, LayoutRect, ModuleInstance, PageConfig } from '@/store/useAppStore';
import { HTML_PRESETS } from './backgroundHtmlPresets';

const HTML_CUSTOM_VALUE = '__custom__';
const PAGE_BG_TYPE_OPTIONS = [
  { value: 'color', label: '纯色' },
  { value: 'media', label: '媒体' },
  { value: 'html', label: 'HTML' },
  { value: 'transparent', label: '透明' },
] as const;
const MEDIA_KIND_OPTIONS = [
  { value: 'image', label: '图片' },
  { value: 'video', label: '视频' },
] as const;

type PageBackground = NonNullable<PageConfig['appearance']>['background'];
const BREAKPOINTS: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'xs'];

function isPageBackgroundType(value: unknown): value is PageBackground['type'] {
  return value === 'color' || value === 'image' || value === 'video' || value === 'html' || value === 'transparent';
}

function isLayoutRect(value: unknown): value is LayoutRect {
  if (!value || typeof value !== 'object') return false;
  const rect = value as Record<string, unknown>;
  return (
    typeof rect.i === 'string' &&
    typeof rect.x === 'number' &&
    typeof rect.y === 'number' &&
    typeof rect.w === 'number' &&
    typeof rect.h === 'number'
  );
}

function isModuleInstance(value: unknown): value is ModuleInstance {
  if (!value || typeof value !== 'object') return false;
  const mod = value as Record<string, unknown>;
  return (
    typeof mod.id === 'string' &&
    typeof mod.category === 'string' &&
    typeof mod.type === 'string' &&
    typeof mod.title === 'string' &&
    !!mod.props &&
    typeof mod.props === 'object' &&
    (!('appearance' in mod) || typeof mod.appearance === 'object')
  );
}

function normalizeImportedConfig(raw: unknown, currentConfig: PageConfig): PageConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  const input = raw as Record<string, unknown>;
  if (!input.version || !Array.isArray(input.modules) || !input.layouts || typeof input.layouts !== 'object') {
    return null;
  }

  const layoutsInput = input.layouts as Record<string, unknown>;
  const layouts = Object.fromEntries(
    BREAKPOINTS.map((bp) => {
      const value = layoutsInput[bp];
      return [bp, Array.isArray(value) ? value.filter(isLayoutRect) : currentConfig.layouts[bp]];
    })
  ) as Record<Breakpoint, LayoutRect[]>;

  const modules = (input.modules as unknown[]).filter(isModuleInstance);
  if (modules.length !== (input.modules as unknown[]).length) {
    return null;
  }

  const siteInput = input.site && typeof input.site === 'object' ? (input.site as Record<string, unknown>) : {};
  const appearanceInput = input.appearance && typeof input.appearance === 'object'
    ? (input.appearance as Record<string, unknown>)
    : null;
  const backgroundInput = appearanceInput?.background && typeof appearanceInput.background === 'object'
    ? (appearanceInput.background as Record<string, unknown>)
    : null;

  return {
    ...currentConfig,
    version: String(input.version),
    templateName: typeof input.templateName === 'string' ? input.templateName : currentConfig.templateName,
    templateAuthor: typeof input.templateAuthor === 'string' ? input.templateAuthor : currentConfig.templateAuthor,
    site: {
      ...currentConfig.site,
      title: typeof siteInput.title === 'string' ? siteInput.title : currentConfig.site.title,
      description:
        typeof siteInput.description === 'string'
          ? siteInput.description
          : currentConfig.site.description,
      keywords: Array.isArray(siteInput.keywords)
        ? siteInput.keywords.filter((kw): kw is string => typeof kw === 'string')
        : currentConfig.site.keywords,
      favicon: typeof siteInput.favicon === 'string' ? siteInput.favicon : currentConfig.site.favicon,
      language: typeof siteInput.language === 'string' ? siteInput.language : currentConfig.site.language,
    },
    appearance: backgroundInput
      ? {
          themePreset: currentConfig.appearance?.themePreset ?? 'liquid-glass',
          mode: currentConfig.appearance?.mode ?? 'dark',
          colors: currentConfig.appearance?.colors ?? {
            primary: '#58a6ff',
            surface: 'rgba(22, 27, 34, 0.85)',
            text: '#e6edf3',
          },
          borderRadius: currentConfig.appearance?.borderRadius ?? 16,
          customGlobalCss: currentConfig.appearance?.customGlobalCss ?? '',
          background: {
            type: isPageBackgroundType(backgroundInput.type)
              ? backgroundInput.type
              : (currentConfig.appearance?.background?.type ?? 'color'),
            value:
              typeof backgroundInput.value === 'string'
                ? backgroundInput.value
                : (currentConfig.appearance?.background?.value ?? '#0d1117'),
            blur:
              typeof backgroundInput.blur === 'number'
                ? backgroundInput.blur
                : (currentConfig.appearance?.background?.blur ?? 0),
            opacity:
              typeof backgroundInput.opacity === 'number'
                ? backgroundInput.opacity
                : (currentConfig.appearance?.background?.opacity ?? 1),
            noisePattern:
              typeof backgroundInput.noisePattern === 'boolean'
                ? backgroundInput.noisePattern
                : (currentConfig.appearance?.background?.noisePattern ?? false),
          },
        }
      : currentConfig.appearance,
    layouts,
    modules,
  };
}

export function SitePanel() {
  const isOpen = useAppStore((s) => s.isSitePanelOpen);
  const closeSitePanel = useAppStore((s) => s.closeSitePanel);
  const pageConfig = useAppStore((s) => s.pageConfig);
  const site = pageConfig.site;
  const updateSite = useAppStore((s) => s.updateSite);
  const setPageConfig = useAppStore((s) => s.setPageConfig);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [templateStatus, setTemplateStatus] = useState('');

  const keywordsStr = site.keywords.join(', ');

  const handleKeywords = (raw: string) => {
    const arr = raw
      .split(/[,，]+/)
      .map((k) => k.trim())
      .filter(Boolean);
    updateSite({ keywords: arr });
  };

  const handleExport = () => {
    const content = JSON.stringify(pageConfig, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(pageConfig.templateName ?? 'lumina-template').replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setTemplateStatus('模板已导出。');
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const raw = JSON.parse(await file.text()) as unknown;
      const normalized = normalizeImportedConfig(raw, pageConfig);
      if (!normalized) {
        setTemplateStatus('导入失败：不是有效的 PageConfig JSON。');
        return;
      }
      setPageConfig(normalized);
      setTemplateStatus(`模板已导入：${file.name}`);
    } catch {
      setTemplateStatus('导入失败：JSON 解析错误。');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          onClick={closeSitePanel}
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
        {/* 标题栏 */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div>
            <p className="text-xs opacity-40" style={{ color: 'var(--color-text)' }}>站点设置</p>
            <h3 className="text-sm font-semibold mt-0.5" style={{ color: 'var(--color-text)' }}>
              SEO 信息
            </h3>
          </div>
          <button
            onClick={closeSitePanel}
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

        {/* 表单 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          <Field label="模板">
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm transition-colors hover:bg-white/10"
                style={{ color: 'var(--color-text)' }}
              >
                导出 JSON
              </button>
              <button
                onClick={handleImportClick}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm transition-colors hover:bg-white/10"
                style={{ color: 'var(--color-text)' }}
              >
                导入 JSON
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImport}
            />
            {templateStatus && (
              <p className="text-[11px] leading-relaxed opacity-60" style={{ color: 'var(--color-text)' }}>
                {templateStatus}
              </p>
            )}
          </Field>

          <Section title="SEO 信息">
            <Field label="站点标题">
              <TextInput
                value={site.title}
                onChange={(v) => updateSite({ title: v })}
                placeholder="My Site"
              />
            </Field>

            <Field label="站点描述">
              <textarea
                value={site.description}
                onChange={(e) => updateSite({ description: e.target.value })}
                rows={3}
                placeholder="一句话描述你的站点"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none bg-white/5 border border-white/10 focus:border-blue-400/60 transition-colors resize-none leading-relaxed"
                style={{ color: 'var(--color-text)' }}
              />
            </Field>

            <Field label="关键词（逗号分隔）">
              <TextInput
                value={keywordsStr}
                onChange={handleKeywords}
                placeholder="portfolio, homepage, bento"
              />
              {site.keywords.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {site.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[11px] text-blue-300"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </Field>

            <Field label="语言">
              <TextInput
                value={site.language}
                onChange={(v) => updateSite({ language: v })}
                placeholder="zh-CN"
              />
            </Field>
          </Section>
        </div>
      </div>
    </>
  );
}

export function BackgroundPanel() {
  const isOpen = useAppStore((s) => s.isBackgroundPanelOpen);
  const closeBackgroundPanel = useAppStore((s) => s.closeBackgroundPanel);
  const background = useAppStore((s) => s.pageConfig.appearance?.background);
  const updatePageBackground = useAppStore((s) => s.updatePageBackground);
  const [customHtml, setCustomHtml] = useState(background?.type === 'html' ? background.value : '');
  const [isHtmlPresetMenuOpen, setIsHtmlPresetMenuOpen] = useState(false);
  const htmlPresetMenuRef = useRef<HTMLDivElement>(null);
  const matchedHtmlPreset = useMemo(
    () => (background?.type === 'html' ? HTML_PRESETS.find((preset) => preset.html === background.value) ?? null : null),
    [background?.type, background?.value]
  );
  const htmlSelectValue = matchedHtmlPreset?.name ?? HTML_CUSTOM_VALUE;
  const isCustomHtmlSelected = htmlSelectValue === HTML_CUSTOM_VALUE;
  const backgroundUiType = background?.type === 'image' || background?.type === 'video' ? 'media' : background?.type;
  const mediaKind = background?.type === 'video' ? 'video' : 'image';

  React.useEffect(() => {
    if (background?.type === 'html' && !matchedHtmlPreset) {
      setCustomHtml(background.value);
    }
  }, [background?.type, background?.value, matchedHtmlPreset]);

  React.useEffect(() => {
    if (!isHtmlPresetMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!htmlPresetMenuRef.current?.contains(event.target as Node)) {
        setIsHtmlPresetMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsHtmlPresetMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isHtmlPresetMenuOpen]);

  const setBackground = (key: keyof PageBackground, value: unknown) => {
    updatePageBackground({ [key]: value } as Partial<PageBackground>);
  };

  const setBackgroundType = (type: PageBackground['type'] | 'media') => {
    const resolvedType = type === 'media' ? (background?.type === 'video' ? 'video' : 'image') : type;
    const nextValue =
      resolvedType === 'color'
        ? '#0d1117'
        : resolvedType === 'html'
          ? customHtml
          : resolvedType === 'transparent'
            ? ''
            : background?.type === resolvedType
              ? background.value
              : '';

    updatePageBackground({ type: resolvedType, value: nextValue });

    if (resolvedType === 'html' && !customHtml) {
      setCustomHtml(nextValue);
    }
  };

  const setMediaKind = (type: 'image' | 'video') => {
    updatePageBackground({ type, value: background?.type === 'image' || background?.type === 'video' ? background.value : '' });
  };

  const applyHtmlPreset = (html: string) => {
    updatePageBackground({ type: 'html', value: html });
  };

  const handleHtmlPresetSelect = (value: string) => {
    setIsHtmlPresetMenuOpen(false);

    if (value === HTML_CUSTOM_VALUE) {
      const nextValue = matchedHtmlPreset ? '' : customHtml;
      setCustomHtml(nextValue);
      updatePageBackground({ type: 'html', value: nextValue });
      return;
    }

    const preset = HTML_PRESETS.find((item) => item.name === value);
    if (preset) {
      applyHtmlPreset(preset.html);
    }
  };

  const handleCustomHtml = (value: string) => {
    setCustomHtml(value);
    updatePageBackground({ type: 'html', value });
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          onClick={closeBackgroundPanel}
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
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div>
            <p className="text-xs opacity-40" style={{ color: 'var(--color-text)' }}>页面设置</p>
            <h3 className="text-sm font-semibold mt-0.5" style={{ color: 'var(--color-text)' }}>
              主页背景
            </h3>
          </div>
          <button
            onClick={closeBackgroundPanel}
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
          <Section title="主页背景">
            <Field label="背景类型">
              <div className="grid grid-cols-4 gap-1">
                {PAGE_BG_TYPE_OPTIONS.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setBackgroundType(type.value)}
                    className={`rounded-lg py-1.5 text-[11px] font-medium transition-colors ${
                      backgroundUiType === type.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </Field>

            {backgroundUiType === 'color' && background && (
              <Field label="背景颜色">
                <input
                  type="color"
                  value={toHexSafe(background.value)}
                  onChange={(e) => setBackground('value', e.target.value)}
                  className="h-10 w-full rounded-lg border border-white/10 bg-transparent"
                />
              </Field>
            )}

            {backgroundUiType === 'media' && background && (
              <>
                <Field label="媒体类型">
                  <div className="grid grid-cols-2 gap-1">
                    {MEDIA_KIND_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setMediaKind(option.value)}
                        className={`rounded-lg py-1.5 text-[11px] font-medium transition-colors ${
                          mediaKind === option.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label={mediaKind === 'image' ? '图片 URL' : '视频 URL'}>
                  <TextInput
                    value={background.value}
                    onChange={(v) => setBackground('value', v)}
                    placeholder={mediaKind === 'image' ? 'https://example.com/bg.jpg' : 'https://example.com/bg.mp4'}
                  />
                  {mediaKind === 'video' && (
                    <p className="mt-1 text-[10px] opacity-30" style={{ color: 'var(--color-text)' }}>
                      作为主页背景视频循环播放，静音且不显示控件。
                    </p>
                  )}
                </Field>

                {mediaKind === 'image' && background.value && (
                  <div
                    className="h-16 w-full rounded-lg border border-white/10 bg-cover bg-center"
                    style={{ backgroundImage: `url(${background.value})` }}
                  />
                )}
              </>
            )}

            {background?.type === 'html' && (
              <>
                <Field label="预设 / 自定义">
                  <div className="relative" ref={htmlPresetMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsHtmlPresetMenuOpen((open) => !open)}
                      aria-haspopup="listbox"
                      aria-expanded={isHtmlPresetMenuOpen}
                      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 px-3 py-2.5 text-sm outline-none transition-all duration-200 hover:border-white/20 hover:from-slate-800/95 hover:to-slate-700/95 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20"
                      style={{ color: 'var(--color-text)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.18)' }}
                    >
                      <span className="truncate text-left">{matchedHtmlPreset?.name ?? '自定义'}</span>
                      <svg
                        viewBox="0 0 20 20"
                        className={`h-4 w-4 flex-shrink-0 fill-current text-white/45 transition-transform duration-200 ${isHtmlPresetMenuOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {isHtmlPresetMenuOpen && (
                      <div
                        className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 p-1 shadow-2xl backdrop-blur-xl"
                        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)' }}
                      >
                        <div className="mb-1 rounded-xl border border-blue-400/15 bg-blue-500/8 p-1">
                          <button
                            type="button"
                            onClick={() => handleHtmlPresetSelect(HTML_CUSTOM_VALUE)}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                              isCustomHtmlSelected
                                ? 'bg-blue-500/20 text-blue-200'
                                : 'text-white/80 hover:bg-white/6 hover:text-white'
                            }`}
                          >
                            <span>自定义</span>
                            {isCustomHtmlSelected && <span className="text-[11px] text-blue-300/80">当前</span>}
                          </button>
                        </div>
                        <div className="mx-2 mb-1 flex items-center gap-2 px-1">
                          <div className="h-px flex-1 bg-white/10" />
                          <span className="text-[10px] uppercase tracking-[0.24em] text-white/30">Presets</span>
                          <div className="h-px flex-1 bg-white/10" />
                        </div>
                        <div className="max-h-64 overflow-y-auto rounded-xl bg-white/[0.02] p-1">
                          {HTML_PRESETS.map((preset) => {
                            const active = matchedHtmlPreset?.name === preset.name;
                            return (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => handleHtmlPresetSelect(preset.name)}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                  active
                                    ? 'bg-blue-500/18 text-blue-200'
                                    : 'text-white/75 hover:bg-white/6 hover:text-white'
                                }`}
                              >
                                <span>{preset.name}</span>
                                {active && <span className="text-[11px] text-blue-300/80">当前</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </Field>
                {isCustomHtmlSelected && (
                  <Field label="自定义 HTML 代码">
                    <textarea
                      value={customHtml}
                      onChange={(e) => handleCustomHtml(e.target.value)}
                      rows={8}
                      placeholder="<!DOCTYPE html><html>...</html>"
                      className="w-full rounded-lg px-3 py-2 text-xs outline-none bg-white/5 border border-white/10 focus:border-blue-400/60 transition-colors font-mono resize-none leading-relaxed"
                      style={{ color: 'var(--color-text)' }}
                    />
                    <p className="text-[10px] opacity-30" style={{ color: 'var(--color-text)' }}>
                      在 iframe sandbox 中运行，仅允许脚本执行，无法访问父页面
                    </p>
                  </Field>
                )}
              </>
            )}

            {background && (
              <Field label={`背景透明度 · ${Math.round(background.opacity * 100)}%`}>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={background.opacity}
                  onChange={(e) => setBackground('opacity', Number(e.target.value))}
                  className="w-full cursor-pointer accent-blue-400"
                />
              </Field>
            )}

            {background && (
              <>
                <Field label={`毛玻璃模糊度 · ${background.blur}px`}>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={background.blur}
                    onChange={(e) => setBackground('blur', Number(e.target.value))}
                    className="w-full cursor-pointer accent-blue-400"
                  />
                </Field>

                <Field label="噪点遮罩">
                  <Toggle checked={background.noisePattern} onChange={(checked) => setBackground('noisePattern', checked)} />
                </Field>
              </>
            )}
          </Section>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
      <p
        className="mb-3 text-[11px] font-semibold uppercase tracking-widest opacity-30"
        style={{ color: 'var(--color-text)' }}
      >
        {title}
      </p>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium opacity-50" style={{ color: 'var(--color-text)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-10 rounded-full transition-colors duration-200 ${checked ? 'bg-blue-500' : 'bg-white/10'}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function toHexSafe(value: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const expanded = value
      .slice(1)
      .split('')
      .map((char) => char + char)
      .join('');
    return `#${expanded}`;
  }
  return '#0d1117';
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg px-3 py-2 text-sm outline-none bg-white/5 border border-white/10 focus:border-blue-400/60 transition-colors placeholder:opacity-30"
      style={{ color: 'var(--color-text)' }}
    />
  );
}
