'use client';

import React, { useMemo } from 'react';
import { useAppStore, ModuleInstance } from '@/store/useAppStore';
import { ProfileModule } from './ProfileModule';
import { HtmlBlockModule } from './HtmlBlockModule';
import { GithubPlaceholderModule } from './GithubPlaceholderModule';

interface ModuleWrapperProps {
  module: ModuleInstance;
}

const MODULE_STYLE_VARS = {
  gap: 12,
  fontScale: 1,
};

const SHADOW_STYLES: Record<ModuleInstance['appearance']['shadow'], string> = {
  soft: '0 8px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04)',
  medium: '0 14px 36px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.05)',
  strong: '0 22px 48px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08)',
};

function renderModule(module: ModuleInstance) {
  switch (module.type) {
    case 'profile':
      return <ProfileModule module={module} />;
    case 'html_block':
      return <HtmlBlockModule module={module} />;
    case 'github_plugin':
      return <GithubPlaceholderModule module={module} />;
    default:
      return (
        <div className="flex h-full items-center justify-center opacity-40">
          <p className="text-sm" style={{ color: 'var(--color-text)' }}>
            未知模块: {module.type}
          </p>
        </div>
      );
  }
}

export function ModuleWrapper({ module }: ModuleWrapperProps) {
  const isEditMode = useAppStore((s) => s.isEditMode);
  const openModulePanel = useAppStore((s) => s.openModulePanel);
  const removeModule = useAppStore((s) => s.removeModule);
  const customCss = typeof module.props.customCss === 'string' ? module.props.customCss.trim() : '';
  const scopeSelector = useMemo(() => `[data-module-scope="${module.id}"]`, [module.id]);
  const backgroundOverlay = module.appearance.background;

  const scopedCss = useMemo(() => {
    const cssVars = `${scopeSelector} {
  --color-primary: ${module.appearance.colors.primary};
  --color-surface: ${module.appearance.colors.surface};
  --color-text: ${module.appearance.colors.text};
  --module-padding: ${module.appearance.padding}px;
  --module-gap: ${MODULE_STYLE_VARS.gap}px;
  --module-font-scale: ${MODULE_STYLE_VARS.fontScale};
}`;

    if (!customCss) return cssVars;

    const customBlocks = customCss
      .split('}')
      .map((block) => {
        const [selector, declarations] = block.split('{');
        if (!declarations) return '';
        const normalizedSelector = selector.trim();
        if (!normalizedSelector) {
          return `${scopeSelector} {${declarations}}`;
        }
        const scopedSelector = normalizedSelector
          .split(',')
          .map((part) => {
            const trimmed = part.trim();
            if (!trimmed) return scopeSelector;
            if (trimmed.includes('&')) {
              return trimmed.replaceAll('&', scopeSelector);
            }
            return `${scopeSelector} ${trimmed}`;
          })
          .join(', ');
        return `${scopedSelector} {${declarations}}`;
      })
      .filter(Boolean)
      .join('\n');

    return `${cssVars}\n${customBlocks}`;
  }, [customCss, module.appearance, scopeSelector]);

  const moduleStyle = {
    color: module.appearance.colors.text,
    border: '1px solid color-mix(in srgb, var(--color-primary) 18%, rgba(255,255,255,0.08))',
    borderRadius: `${module.appearance.borderRadius}px`,
    boxShadow: `${SHADOW_STYLES[module.appearance.shadow]}, inset 0 1px 0 color-mix(in srgb, var(--color-primary) 12%, transparent)`,
    backdropFilter: `blur(${backgroundOverlay.blur}px) saturate(180%)`,
    WebkitBackdropFilter: `blur(${backgroundOverlay.blur}px) saturate(180%)`,
  } satisfies React.CSSProperties;

  const overlayStyle = getBackgroundOverlayStyle(backgroundOverlay);

  return (
    <div className="relative h-full w-full overflow-hidden isolate" data-module-scope={module.id} style={moduleStyle}>
      {scopedCss && <style>{scopedCss}</style>}
      <div className="pointer-events-none absolute inset-0" style={{ opacity: backgroundOverlay.opacity }}>
        <ModuleBackgroundLayer background={backgroundOverlay} />
        {overlayStyle && <div className="absolute inset-0" style={overlayStyle} />}
        {backgroundOverlay.noisePattern && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
              backgroundSize: '200px 200px',
            }}
          />
        )}
      </div>
      {isEditMode && (
        <div className="absolute right-2 top-2 z-10 flex gap-1">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm transition-colors duration-200 hover:bg-red-500/60"
            title={`删除 ${module.title}`}
            onClick={(e) => {
              e.stopPropagation();
              removeModule(module.id);
            }}
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4 fill-white/70" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm transition-colors duration-200"
            style={{
              borderColor: 'color-mix(in srgb, var(--color-primary) 28%, rgba(255,255,255,0.08))',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 32%, rgba(0,0,0,0.4))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
            }}
            title={`配置 ${module.title}`}
            onClick={(e) => {
              e.stopPropagation();
              openModulePanel(module.id);
            }}
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4 fill-white/70" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
      <div className="relative z-[1] h-full w-full">{renderModule(module)}</div>
      {isEditMode && <div className="absolute inset-0 z-[2] cursor-move" aria-hidden="true" />}
    </div>
  );
}

function getBackgroundOverlayStyle(background: ModuleInstance['appearance']['background']): React.CSSProperties | null {
  switch (background.type) {
    case 'color':
      return {
        background: background.value,
        opacity: background.opacity,
      };
    case 'transparent':
      return {
        background: 'transparent',
        opacity: background.opacity,
      };
    default:
      return {
        opacity: background.opacity,
      };
  }
}

function ModuleBackgroundLayer({ background }: { background: ModuleInstance['appearance']['background'] }) {
  if (background.type === 'image' && background.value) {
    return (
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url(${background.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: background.opacity,
        }}
      />
    );
  }

  if (background.type === 'video' && background.value) {
    return (
      <div className="pointer-events-none absolute inset-0" style={{ opacity: background.opacity }}>
        <video
          className="h-full w-full object-cover"
          src={background.value}
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
    );
  }

  if (background.type === 'html' && background.value) {
    return (
      <div className="pointer-events-none absolute inset-0" style={{ opacity: background.opacity }}>
        <iframe
          title="module-background"
          className="h-full w-full border-0"
          srcDoc={background.value}
          sandbox="allow-scripts allow-same-origin"
          loading="lazy"
        />
      </div>
    );
  }

  return null;
}
