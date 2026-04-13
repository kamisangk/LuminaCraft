'use client';

import React, { useMemo, useEffect } from 'react';
import {
  useAppStore,
  ModuleInstance,
  getEffectiveModuleAppearance,
} from '@/store/useAppStore';
import { getModuleDefinition } from '@/lib/modules';
import { styleManager } from '@/lib/StyleManager';
import { buildCustomThemeArtifacts } from '@/lib/moduleCustomTheme';

interface ModuleWrapperProps {
  module: ModuleInstance;
  editModeOverride?: boolean;
}

const MODULE_STYLE_VARS = {
  gap: 12,
  fontScale: 1,
};

const SHADOW_STYLES: Record<ModuleInstance['appearance']['shadow'], string> = {
  none: 'none',
  soft: '0 8px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04)',
  medium: '0 14px 36px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.05)',
  strong: '0 22px 48px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08)',
};

function renderModule(module: ModuleInstance) {
  const definition = getModuleDefinition(module.type);
  if (definition) {
    const Comp = definition.Component;
    return (
      <React.Suspense fallback={
        <div className="flex h-full items-center justify-center opacity-40">
          <p className="text-sm" style={{ color: 'var(--color-text)' }}>
            加载中...
          </p>
        </div>
      }>
        <Comp module={module} />
      </React.Suspense>
    );
  }
  return (
    <div className="flex h-full items-center justify-center opacity-40">
      <p className="text-sm" style={{ color: 'var(--color-text)' }}>
        未知模块: {module.type}
      </p>
    </div>
  );
}

export function ModuleWrapper({ module, editModeOverride }: ModuleWrapperProps) {
  const storeEditMode = useAppStore((s) => s.isEditMode);
  const isEditMode = editModeOverride ?? storeEditMode;
  const openModulePanel = useAppStore((s) => s.openModulePanel);
  const removeModule = useAppStore((s) => s.removeModule);
  const customThemeSource =
    module.appearance.themePreset === 'custom' && typeof module.props.customCss === 'string'
      ? module.props.customCss
      : '';
  const effectiveAppearance = useMemo(() => getEffectiveModuleAppearance(module.appearance), [module.appearance]);
  const scopeSelector = useMemo(() => `[data-module-scope="${module.id}"]`, [module.id]);
  const backgroundOverlay = effectiveAppearance.background;

  const customThemeArtifacts = useMemo(() => {
    const cssVars = `${scopeSelector} {
  --color-primary: ${effectiveAppearance.colors.primary};
  --color-surface: ${effectiveAppearance.colors.surface};
  --color-text: ${effectiveAppearance.colors.text};
  --module-padding: ${effectiveAppearance.padding}px;
  --module-gap: ${MODULE_STYLE_VARS.gap}px;
  --module-font-scale: ${MODULE_STYLE_VARS.fontScale};
}`;

    return buildCustomThemeArtifacts({
      moduleId: module.id,
      scopeSelector,
      cssVars,
      source: customThemeSource,
    });
  }, [customThemeSource, effectiveAppearance, module.id, scopeSelector]);

  const scopedCss = customThemeArtifacts.scopedCss;
  const customThemeSvgMarkup = customThemeArtifacts.svgMarkup;

  // 判断是否使用自定义 CSS（非空字符串）
  const shouldUseMinimalStyle = module.appearance.themePreset === 'custom';

  const moduleStyle = shouldUseMinimalStyle
    ? {
        // 使用自定义 CSS 时，只应用最基础的样式
        color: effectiveAppearance.colors.text,
        borderRadius: `${effectiveAppearance.borderRadius}px`,
      }
    : {
        // 默认样式时，应用完整的外观配置
        color: effectiveAppearance.colors.text,
        border: effectiveAppearance.showBorder !== false
          ? '1px solid color-mix(in srgb, var(--color-primary) 18%, rgba(255,255,255,0.08))'
          : 'none',
        borderRadius: `${effectiveAppearance.borderRadius}px`,
        boxShadow: effectiveAppearance.shadow === 'none'
          ? 'none'
          : `${SHADOW_STYLES[effectiveAppearance.shadow]}, inset 0 1px 0 color-mix(in srgb, var(--color-primary) 12%, transparent)`,
        backdropFilter: `blur(${backgroundOverlay.blur}px) saturate(180%)`,
        WebkitBackdropFilter: `blur(${backgroundOverlay.blur}px) saturate(180%)`,
      } satisfies React.CSSProperties;

  const overlayStyle = getBackgroundOverlayStyle(backgroundOverlay);
  const backgroundLayerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    opacity: backgroundOverlay.opacity,
    zIndex: 0,
  };
  const svgMountStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    overflow: 'hidden',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: 0,
  };
  const contentLayerStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 1,
    height: '100%',
    width: '100%',
  };
  const dragOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    zIndex: 2,
    pointerEvents: 'auto',
  };
  const controlsStyle: React.CSSProperties = {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    zIndex: 3,
    pointerEvents: 'auto',
  };

  // 使用全局样式管理器而不是内联 style 标签
  useEffect(() => {
    if (scopedCss) {
      styleManager.setModuleStyle(module.id, scopedCss);
    }
    return () => {
      styleManager.removeModuleStyle(module.id);
    };
  }, [scopedCss, module.id]);

  return (
    <div className="relative h-full w-full overflow-hidden isolate" data-module-scope={module.id} style={moduleStyle}>
      <div className="pointer-events-none absolute inset-0" style={backgroundLayerStyle}>
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
      {customThemeSvgMarkup && (
        <div
          aria-hidden="true"
          data-module-theme-svg="true"
          className="pointer-events-none absolute left-0 top-0 h-0 w-0 overflow-hidden opacity-0"
          style={svgMountStyle}
          dangerouslySetInnerHTML={{ __html: customThemeSvgMarkup }}
        />
      )}
      <div data-module-content="true" className="relative z-[1] h-full w-full" style={contentLayerStyle}>
        {renderModule(module)}
      </div>
      {isEditMode && (
        <>
          <div
            data-module-chrome="overlay"
            className="absolute inset-0 z-[2] cursor-move pointer-events-auto"
            style={dragOverlayStyle}
            aria-hidden="true"
          />
          <div
            data-module-chrome="controls"
            className="absolute right-2 top-2 z-[3] flex gap-1 pointer-events-auto"
            style={controlsStyle}
          >
            <button
              type="button"
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
              type="button"
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
        </>
      )}
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
  const [isVisible, setIsVisible] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // 使用 Intersection Observer 检测可见性
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        rootMargin: '50px', // 提前 50px 开始加载
        threshold: 0.01,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (background.type === 'image' && background.value) {
    return (
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: isVisible ? `url(${background.value})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: background.opacity,
        }}
      />
    );
  }

  if (background.type === 'video' && background.value) {
    return (
      <div ref={containerRef} className="pointer-events-none absolute inset-0" style={{ opacity: background.opacity }}>
        {isVisible && (
          <video
            className="h-full w-full object-cover"
            src={background.value}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        )}
      </div>
    );
  }

  if (background.type === 'html' && background.value) {
    return (
      <div ref={containerRef} className="pointer-events-none absolute inset-0" style={{ opacity: background.opacity }}>
        {isVisible && (
          <iframe
            title="module-background"
            className="h-full w-full border-0"
            srcDoc={background.value}
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
          />
        )}
      </div>
    );
  }

  return null;
}
