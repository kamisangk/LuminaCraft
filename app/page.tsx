'use client';

import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { ModuleConfigPanel } from '@/components/panels/ModuleConfigPanel';
import { ModuleLibraryPanel } from '@/components/panels/ModuleLibraryPanel';
import { ChatCompletionPanel } from '@/components/panels/ChatCompletionPanel';
import { SitePanel, BackgroundPanel } from '@/components/panels/SitePanel';
import { LoginModal } from '@/components/LoginModal';
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

const FLOATING_BUTTON_CLASS =
  'fixed bottom-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border shadow-2xl backdrop-blur-sm transition-all duration-300';
const FLOATING_BUTTON_IDLE_CLASS = 'border-white/10 bg-gray-800/80 hover:bg-gray-700/80';

export default function HomePage() {
  const {
    isEditMode,
    toggleEditMode,
    pageConfig,
    setPageConfig,
    isAuthenticated,
    setAuthenticated,
    toggleModuleLibrary,
    closeBackgroundPanel,
    closeChatCompletion,
    toggleSitePanel,
    closeSitePanel,
    toggleBackgroundPanel,
  } = useAppStore();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showLogin, setShowLogin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [configReady, setConfigReady] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageBackground = pageConfig.appearance?.background;
  const pageBackgroundStyle = getPageBackgroundStyle(pageBackground);

  const openSitePanel = useCallback(() => {
    closeBackgroundPanel();
    closeChatCompletion();
    toggleSitePanel();
  }, [closeChatCompletion, closeBackgroundPanel, toggleSitePanel]);

  const openBackgroundPanel = useCallback(() => {
    closeSitePanel();
    closeChatCompletion();
    toggleBackgroundPanel();
  }, [closeChatCompletion, closeSitePanel, toggleBackgroundPanel]);

  const handleEditModeToggle = useCallback(() => {
    if (isEditMode) {
      toggleEditMode();
      return;
    }

    if (!authReady) return;
    if (isAuthenticated) {
      toggleEditMode();
      return;
    }

    setShowLogin(true);
  }, [authReady, isAuthenticated, isEditMode, toggleEditMode]);

  const handleLoginSuccess = useCallback(() => {
    setAuthenticated(true);
    setShowLogin(false);
    toggleEditMode();
  }, [setAuthenticated, toggleEditMode]);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setPageConfig(data);
      })
      .catch(() => {})
      .finally(() => {
        setConfigReady(true);
      });
  }, [setPageConfig]);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setAuthenticated(Boolean(data?.authenticated));
      })
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => {
        setAuthReady(true);
      });
  }, [setAuthenticated]);

  useEffect(() => {
    if (!isEditMode) return;
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-lumina-owner': 'local' },
        body: JSON.stringify(pageConfig),
      })
        .then((res) => {
          if (res.ok) setSaveStatus('saved');
          else if (res.status === 401) {
            setAuthenticated(false);
            setSaveStatus('idle');
          }
        })
        .catch(() => setSaveStatus('idle'));
    }, 1000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [pageConfig, isEditMode, setAuthenticated]);

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

      {isEditMode && (
        <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-blue-500/90 py-2 text-xs font-medium text-white backdrop-blur-sm">
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-white" aria-hidden="true">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          编辑模式已开启 · 拖拽卡片以调整布局
          {saveStatus === 'saving' && <span className="ml-2 opacity-70">保存中…</span>}
          {saveStatus === 'saved' && <span className="ml-2 opacity-90">已保存 ✓</span>}
        </div>
      )}

      <div className={`relative z-10 ${isEditMode ? 'pt-8' : ''}`}>
        {configReady ? <ResponsiveGrid /> : null}
      </div>

      <ModuleConfigPanel />
      <ModuleLibraryPanel />
      <ChatCompletionPanel />
      <SitePanel />
      <BackgroundPanel />

      {isEditMode && (
        <>
          <button
            onClick={toggleModuleLibrary}
            title="模块库"
            className={`${FLOATING_BUTTON_CLASS} ${FLOATING_BUTTON_IDLE_CLASS} right-20`}
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5 fill-white/70" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={openSitePanel}
            title="SEO 信息"
            className={`${FLOATING_BUTTON_CLASS} ${FLOATING_BUTTON_IDLE_CLASS} right-[8.5rem]`}
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5 fill-white/70" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={openBackgroundPanel}
            title="主页背景"
            className={`${FLOATING_BUTTON_CLASS} ${FLOATING_BUTTON_IDLE_CLASS} right-[12rem]`}
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5 fill-white/70" aria-hidden="true">
              <path d="M2 5a3 3 0 013-3h10a3 3 0 013 3v6a3 3 0 01-3 3h-1.382l-2.724 2.27a1 1 0 01-1.28 0L6.89 14H5a3 3 0 01-3-3V5zm3-1a1 1 0 00-1 1v6a1 1 0 001 1h2.25a1 1 0 01.64.232L10 14.021l2.11-1.79A1 1 0 0112.75 12H15a1 1 0 001-1V5a1 1 0 00-1-1H5z" />
            </svg>
          </button>
        </>
      )}

      {showLogin && <LoginModal onSuccess={handleLoginSuccess} onCancel={() => setShowLogin(false)} />}

      <button
        onClick={handleEditModeToggle}
        title={isEditMode ? '退出编辑模式' : '进入编辑模式 (Owner)'}
        disabled={!isEditMode && !authReady}
        className={`${FLOATING_BUTTON_CLASS} right-6 ${
          isEditMode
            ? 'scale-110 border-blue-400/60 bg-blue-500 shadow-blue-500/40'
            : FLOATING_BUTTON_IDLE_CLASS
        } ${!isEditMode && !authReady ? 'cursor-wait opacity-60' : ''}`}
      >
        {isEditMode ? (
          <svg viewBox="0 0 20 20" className="h-5 w-5 fill-white" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" className="h-5 w-5 fill-white/70" aria-hidden="true">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        )}
      </button>
    </main>
  );
}
