'use client';

import React from 'react';
import { useAppStore, ModuleInstance, ModuleCategory, GithubPluginSettings } from '@/store/useAppStore';

interface ModuleTemplate {
  type: string;
  title: string;
  category: ModuleCategory;
  description: string;
  defaultProps: ModuleInstance['props'];
  defaultAppearance: ModuleInstance['appearance'];
}

const MODULE_TEMPLATES: ModuleTemplate[] = [
  {
    type: 'profile',
    title: '个人档案',
    category: 'core',
    description: '显示头像、姓名、简介和社交链接',
    defaultProps: {
      name: '新用户',
      bio: '个人简介',
      avatar: 'https://avatars.githubusercontent.com/u/0',
      links: [],
    },
    defaultAppearance: {
      colors: {
        primary: '#58a6ff',
        surface: 'rgba(15, 23, 42, 0.88)',
        text: '#f8fafc',
      },
      background: {
        type: 'color',
        value: 'rgba(255,255,255,0.03)',
        blur: 18,
        opacity: 1,
        noisePattern: false,
      },
      borderRadius: 20,
      padding: 18,
      shadow: 'medium',
    },
  },
  {
    type: 'html_block',
    title: 'HTML Block',
    category: 'core',
    description: '自定义 HTML/CSS 内容块',
    defaultProps: {
      htmlContent:
        '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#e6edf3;font-size:18px;">Hello, World!</div>',
    },
    defaultAppearance: {
      colors: {
        primary: '#22c55e',
        surface: 'rgba(10, 14, 23, 0.92)',
        text: '#e5eefc',
      },
      background: {
        type: 'color',
        value: 'rgba(255,255,255,0.02)',
        blur: 12,
        opacity: 1,
        noisePattern: false,
      },
      borderRadius: 18,
      padding: 12,
      shadow: 'soft',
    },
  },
  {
    type: 'github_plugin',
    title: 'GitHub',
    category: 'plugin',
    description: '显示 GitHub 资料、统计和仓库列表',
    defaultProps: {
      pluginSettings: {
        username: 'octocat',
        showProfile: true,
        showStats: true,
        showRepos: true,
        repoLimit: 4,
      } satisfies GithubPluginSettings,
    },
    defaultAppearance: {
      colors: {
        primary: '#8b5cf6',
        surface: 'rgba(17, 24, 39, 0.9)',
        text: '#f8fafc',
      },
      background: {
        type: 'color',
        value: 'rgba(139,92,246,0.06)',
        blur: 20,
        opacity: 1,
        noisePattern: false,
      },
      borderRadius: 20,
      padding: 16,
      shadow: 'strong',
    },
  },
];

const CATEGORY_LABEL: Record<ModuleCategory, string> = {
  core: '模块',
  plugin: '模块',
};

const CATEGORY_COLOR: Record<ModuleCategory, string> = {
  core: 'bg-blue-500/20 text-blue-300',
  plugin: 'bg-blue-500/20 text-blue-300',
};

export function ModuleLibraryPanel() {
  const isOpen = useAppStore((s) => s.isModuleLibraryOpen);
  const closeModuleLibrary = useAppStore((s) => s.closeModuleLibrary);
  const addModule = useAppStore((s) => s.addModule);

  const handleAdd = (template: ModuleTemplate) => {
    const id = `${template.type}-${Date.now()}`;
    addModule({
      id,
      category: template.category,
      type: template.type,
      title: template.title,
      appearance: {
        ...template.defaultAppearance,
        colors: { ...template.defaultAppearance.colors },
        background: { ...template.defaultAppearance.background },
      },
      props: { ...template.defaultProps },
    });
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={closeModuleLibrary} />}

      <div
        className={`fixed top-0 left-0 z-50 flex h-full w-72 flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'rgba(13,17,23,0.97)',
          backdropFilter: 'blur(24px) saturate(180%)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          boxShadow: isOpen ? '8px 0 40px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div>
            <p className="text-xs opacity-40" style={{ color: 'var(--color-text)' }}>
              编辑模式
            </p>
            <h3 className="mt-0.5 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              模块库
            </h3>
          </div>
          <button
            onClick={closeModuleLibrary}
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

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-3">
          {MODULE_TEMPLATES.map((tpl) => (
            <div
              key={tpl.type}
              className="flex flex-col gap-2 rounded-xl border p-3"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                      {tpl.title}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${CATEGORY_COLOR[tpl.category]}`}>
                      {CATEGORY_LABEL[tpl.category]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed opacity-40" style={{ color: 'var(--color-text)' }}>
                    {tpl.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleAdd(tpl)}
                className="w-full rounded-lg border border-blue-500/20 bg-blue-500/20 py-1.5 text-xs font-medium text-blue-300 transition-colors duration-150 hover:bg-blue-500/40"
              >
                + 添加到页面
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
