'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  useAppStore,
  ModuleInstance,
  ModuleAppearance,
} from '@/store/useAppStore';
import { HTML_PRESETS } from './backgroundHtmlPresets';
import { getModuleDefinition } from '@/lib/modules';
import {
  Section,
  PanelBlock,
  Field,
  TextInput,
  TextArea,
  ColorRow,
  Toggle,
  toHexSafe,
} from './FormPrimitives';

const HTML_CUSTOM_VALUE = '__custom__';
const BG_TYPES = [
  { value: 'color', label: '纯色' },
  { value: 'media', label: '媒体' },
  { value: 'html', label: 'HTML' },
] as const;
const MEDIA_KIND_OPTIONS = [
  { value: 'image', label: '图片' },
  { value: 'video', label: '视频' },
] as const;
const SHADOW_OPTIONS: { value: ModuleAppearance['shadow']; label: string }[] = [
  { value: 'soft', label: '柔和' },
  { value: 'medium', label: '标准' },
  { value: 'strong', label: '强烈' },
];

function JsonEditor({ module }: { module: ModuleInstance }) {
  const updateModuleProps = useAppStore((s) => s.updateModuleProps);

  const handleChange = (raw: string) => {
    try {
      const parsed = JSON.parse(raw) as ModuleInstance['props'];
      updateModuleProps(module.id, parsed);
    } catch {
      // 忽略非法 JSON，等用户继续输入
    }
  };

  return (
    <Field label="属性 (JSON)">
      <TextArea value={JSON.stringify(module.props, null, 2)} onChange={handleChange} rows={12} monospace />
    </Field>
  );
}

function ModuleAppearanceForm({ module }: { module: ModuleInstance }) {
  const updateModuleAppearance = useAppStore((s) => s.updateModuleAppearance);
  const appearance = module.appearance;
  const definition = getModuleDefinition(module.type);
  const showColorSection = definition?.appearanceConfig.showColorSection ?? true;
  const showBackgroundSection = definition?.appearanceConfig.showBackgroundSection ?? true;
  const [customHtml, setCustomHtml] = useState(
    appearance.background.type === 'html' ? appearance.background.value : ''
  );
  const [isHtmlPresetMenuOpen, setIsHtmlPresetMenuOpen] = useState(false);
  const htmlPresetMenuRef = useRef<HTMLDivElement>(null);
  const matchedHtmlPreset = useMemo(
    () =>
      appearance.background.type === 'html'
        ? HTML_PRESETS.find((preset) => preset.html === appearance.background.value) ?? null
        : null,
    [appearance.background.type, appearance.background.value]
  );
  const htmlSelectValue = matchedHtmlPreset?.name ?? HTML_CUSTOM_VALUE;
  const isCustomHtmlSelected = htmlSelectValue === HTML_CUSTOM_VALUE;
  const backgroundUiType =
    appearance.background.type === 'image' || appearance.background.type === 'video'
      ? 'media'
      : appearance.background.type === 'transparent'
        ? 'color'
        : appearance.background.type;
  const mediaKind = appearance.background.type === 'video' ? 'video' : 'image';

  React.useEffect(() => {
    if (appearance.background.type === 'html' && !matchedHtmlPreset) {
      setCustomHtml(appearance.background.value);
    }
  }, [appearance.background.type, appearance.background.value, matchedHtmlPreset]);

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

  const setAppearance = useCallback(
    (patch: Partial<ModuleAppearance>) => updateModuleAppearance(module.id, patch),
    [module.id, updateModuleAppearance]
  );

  const setColor = (key: keyof ModuleAppearance['colors'], value: string) =>
    setAppearance({ colors: { ...appearance.colors, [key]: value } });

  const setBackground = (key: keyof ModuleAppearance['background'], value: unknown) =>
    setAppearance({ background: { ...appearance.background, [key]: value } as ModuleAppearance['background'] });

  const setBgType = (type: ModuleAppearance['background']['type'] | 'media') => {
    const resolvedType = type === 'media' ? (appearance.background.type === 'video' ? 'video' : 'image') : type;
    const nextValue =
      resolvedType === 'color'
        ? '#0d1117'
        : resolvedType === 'html'
          ? customHtml
          : resolvedType === 'transparent'
            ? ''
            : appearance.background.type === resolvedType
              ? appearance.background.value
              : '';

    setAppearance({
      background: {
        ...appearance.background,
        type: resolvedType,
        value: nextValue,
      },
    });

    if (resolvedType === 'html' && !customHtml) {
      setCustomHtml(nextValue);
    }
  };

  const setMediaKind = (type: 'image' | 'video') => {
    setAppearance({
      background: {
        ...appearance.background,
        type,
        value: appearance.background.type === 'image' || appearance.background.type === 'video' ? appearance.background.value : '',
      },
    });
  };

  const applyPreset = (html: string) => {
    setBackground('value', html);
  };

  const handleHtmlPresetSelect = (value: string) => {
    setIsHtmlPresetMenuOpen(false);

    if (value === HTML_CUSTOM_VALUE) {
      const nextValue = matchedHtmlPreset ? '' : customHtml;
      setCustomHtml(nextValue);
      setBackground('value', nextValue);
      return;
    }

    const preset = HTML_PRESETS.find((item) => item.name === value);
    if (preset) {
      applyPreset(preset.html);
    }
  };

  const handleCustomHtml = (value: string) => {
    setCustomHtml(value);
    setBackground('value', value);
  };

  return (
    <div className="flex flex-col gap-5">
      {showColorSection && (
        <Section title="颜色">
          <Field label="强调色">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={appearance.colors.primary}
                onChange={(e) => setColor('primary', e.target.value)}
                className="h-8 w-8 cursor-pointer rounded-lg border border-white/10 bg-transparent p-0.5"
              />
              <TextInput value={appearance.colors.primary} onChange={(v) => setColor('primary', v)} monospace className="flex-1" />
            </div>
          </Field>
          <ColorRow label="文字颜色" value={toHexSafe(appearance.colors.text)} onChange={(v) => setColor('text', v)} />
        </Section>
      )}

      {showBackgroundSection && (
      <Section title="背景">
        <Field label="背景类型">
          <div className="grid grid-cols-3 gap-1">
            {BG_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setBgType(type.value)}
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

        {backgroundUiType === 'color' && (
          <ColorRow
            label="背景颜色"
            value={toHexSafe(appearance.background.value)}
            onChange={(v) => setBackground('value', v)}
          />
        )}

        {backgroundUiType === 'media' && (
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
                value={appearance.background.value}
                onChange={(v) => setBackground('value', v)}
                placeholder={mediaKind === 'image' ? 'https://example.com/bg.jpg' : 'https://example.com/bg.mp4'}
              />
              {mediaKind === 'video' && (
                <p className="mt-1 text-[10px] opacity-30" style={{ color: 'var(--color-text)' }}>
                  作为模块背景视频循环播放，静音且不显示控件。
                </p>
              )}
            </Field>

            {mediaKind === 'image' && appearance.background.value && (
              <div
                className="h-16 w-full rounded-lg border border-white/10 bg-cover bg-center"
                style={{ backgroundImage: `url(${appearance.background.value})` }}
              />
            )}
          </>
        )}

        {appearance.background.type === 'html' && (
          <>
            <Field label="预设 / 自定义">
              <div className="relative" ref={htmlPresetMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsHtmlPresetMenuOpen((open) => !open)}
                  aria-haspopup="listbox"
                  aria-expanded={isHtmlPresetMenuOpen}
                  className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition-colors hover:border-white/20 hover:bg-white/10 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20"
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
                    className="absolute left-0 right-0 top-[calc(100%+0.375rem)] z-20 overflow-hidden rounded-lg border border-white/10 bg-[#0d1117]/95 p-1 shadow-xl backdrop-blur-sm"
                    style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.28)' }}
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
                <TextArea
                  value={customHtml}
                  onChange={handleCustomHtml}
                  rows={8}
                  monospace
                  placeholder="<!DOCTYPE html><html>...</html>"
                />
                <p className="text-[10px] opacity-30" style={{ color: 'var(--color-text)' }}>
                  在 iframe sandbox 中运行，仅允许脚本执行，无法访问父页面
                </p>
              </Field>
            )}
          </>
        )}

        <Field label={`背景透明度 · ${Math.round(appearance.background.opacity * 100)}%`}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={appearance.background.opacity}
            onChange={(e) => setBackground('opacity', Number(e.target.value))}
            className="w-full cursor-pointer accent-blue-400"
          />
        </Field>

        <Field label={`毛玻璃模糊度 · ${appearance.background.blur}px`}>
          <input
            type="range"
            min={0}
            max={60}
            value={appearance.background.blur}
            onChange={(e) => setBackground('blur', Number(e.target.value))}
            className="w-full cursor-pointer accent-blue-400"
          />
        </Field>

        <Field label="噪点遮罩">
          <Toggle checked={appearance.background.noisePattern} onChange={(checked) => setBackground('noisePattern', checked)} />
        </Field>
      </Section>
      )}

      <Section title="形状与密度">
          <Field label={`圆角 · ${appearance.borderRadius}px`}>
            <input
              type="range"
              min={0}
              max={32}
              value={appearance.borderRadius}
              onChange={(e) => setAppearance({ borderRadius: Number(e.target.value) })}
              className="w-full cursor-pointer accent-blue-400"
            />
          </Field>

          <Field label={`内边距 · ${appearance.padding}px`}>
            <input
              type="range"
              min={0}
              max={40}
              value={appearance.padding}
              onChange={(e) => setAppearance({ padding: Number(e.target.value) })}
              className="w-full cursor-pointer accent-blue-400"
            />
          </Field>

          <Field label="阴影强度">
            <div className="grid grid-cols-3 gap-1">
              {SHADOW_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAppearance({ shadow: option.value })}
                  className={`rounded-lg py-1.5 text-[11px] font-medium transition-colors ${
                    appearance.shadow === option.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Field>
        </Section>

    </div>
  );
}

function ContentForm({ module }: { module: ModuleInstance }) {
  const definition = getModuleDefinition(module.type);
  if (definition) {
    const Form = definition.ConfigForm;
    return <Form module={module} />;
  }
  return <JsonEditor module={module} />;
}

function FormForModule({ module }: { module: ModuleInstance }) {
  const customCss = typeof module.props.customCss === 'string' ? module.props.customCss : '';
  const updateModuleProps = useAppStore((s) => s.updateModuleProps);

  return (
    <div className="flex flex-col gap-4">
      <PanelBlock title="内容配置" description="编辑当前模块的业务内容。">
        <ContentForm module={module} />
      </PanelBlock>

      <PanelBlock title="外观配置" description="当前模块独立生效，不影响其他模块。">
        <ModuleAppearanceForm module={module} />
      </PanelBlock>

      <PanelBlock title="模块自定义 CSS" description="仅作用于当前模块。普通选择器会自动加上模块作用域；如需定位根节点，可用 & 占位。">
        <TextArea
          value={customCss}
          onChange={(value) => updateModuleProps(module.id, { customCss: value })}
          rows={8}
          monospace
          placeholder={".title { color: #58a6ff; }\n& img { border-radius: 24px; }"}
        />
      </PanelBlock>
    </div>
  );
}

export function ModuleConfigPanel() {
  const activePanelModuleId = useAppStore((s) => s.activePanelModuleId);
  const closeModulePanel = useAppStore((s) => s.closeModulePanel);
  const modules = useAppStore((s) => s.pageConfig.modules);

  const module = modules.find((m) => m.id === activePanelModuleId) ?? null;
  const isOpen = module !== null;

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={closeModulePanel} />}

      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-96 max-w-[90vw] flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'rgba(13,17,23,0.97)',
          backdropFilter: 'blur(24px) saturate(180%)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: isOpen ? '-8px 0 40px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div>
            <p className="text-xs opacity-40" style={{ color: 'var(--color-text)' }}>
              模块配置
            </p>
            <h3 className="mt-0.5 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              {module?.title ?? ''}
            </h3>
          </div>
          <button
            onClick={closeModulePanel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white/80"
            aria-label="关闭"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">{module && <FormForModule module={module} />}</div>
      </div>
    </>
  );
}
