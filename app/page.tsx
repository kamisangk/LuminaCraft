'use client';

import { CSSProperties, useEffect, useRef, useState } from 'react';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { useAppStore, PageConfig } from '@/store/useAppStore';

function getPageBackgroundStyle(background?: NonNullable<PageConfig['appearance']>['background']): CSSProperties | undefined {
  if (!background) return undefined;

  return {
    ...(background.type === 'color' ? { background: background.value } : {}),
    ...(background.type === 'transparent' ? { background: 'transparent' } : {}),
    opacity: background.type === 'color' || background.type === 'transparent' ? background.opacity : undefined,
    backdropFilter: `blur(${background.blur}px)`,
    WebkitBackdropFilter: `blur(${background.blur}px)`,
  };
}

export default function HomePage() {
  const { pageConfig, setPageConfig } = useAppStore();
  const [configReady, setConfigReady] = useState(false);
  const pageBackground = pageConfig.appearance?.background;
  const pageBackgroundStyle = getPageBackgroundStyle(pageBackground);
  const configLoadedRef = useRef(false);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setPageConfig(data);
      })
      .catch(() => {})
      .finally(() => {
        configLoadedRef.current = true;
        setConfigReady(true);
      });
  }, [setPageConfig]);

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {pageBackground?.type === 'image' && pageBackground.value && (
        <div
          className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${pageBackground.value})`,
            opacity: pageBackground.opacity,
          }}
        />
      )}
      {pageBackground?.type === 'video' && pageBackground.value && (
        <div className="pointer-events-none fixed inset-0 z-0" style={{ opacity: pageBackground.opacity }}>
          <video className="h-full w-full object-cover" src={pageBackground.value} autoPlay muted loop playsInline />
        </div>
      )}
      {pageBackground?.type === 'html' && pageBackground.value && (
        <div className="pointer-events-none fixed inset-0 z-0" style={{ opacity: pageBackground.opacity }}>
          <iframe
            title="page-background"
            className="h-full w-full border-0"
            srcDoc={pageBackground.value}
            sandbox="allow-scripts"
            loading="lazy"
          />
        </div>
      )}
      <div className="pointer-events-none fixed inset-0 z-0" style={pageBackgroundStyle} />
      {pageBackground?.noisePattern && (
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
            backgroundSize: '200px 200px',
          }}
        />
      )}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: '32px 32px',
          maskImage: 'linear-gradient(180deg, rgba(255,255,255,0.8), transparent 85%)',
        }}
      />

      <div className="relative z-10">
        {configReady ? <ResponsiveGrid editModeOverride={false} /> : null}
      </div>
    </main>
  );
}
