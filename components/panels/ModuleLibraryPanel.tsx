'use client';

import React from 'react';
import { useAppStore, ModuleInstance, ModuleCategory } from '@/store/useAppStore';
import { getAllModuleDefinitions } from '@/lib/modules';
import type { ModuleDefinition } from '@/lib/moduleRegistry';

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

  const handleAdd = (definition: ModuleDefinition) => {
    const id = `${definition.type}-${Date.now()}`;
    addModule({
      id,
      category: definition.category,
      type: definition.type,
      title: definition.title,
      appearance: {
        ...definition.defaultAppearance,
        colors: { ...definition.defaultAppearance.colors },
        background: { ...definition.defaultAppearance.background },
      },
      props: { ...definition.defaultProps },
    });
  };

  const definitions = getAllModuleDefinitions();

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
          {definitions.map((def) => (
            <div
              key={def.type}
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
                      {def.title}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${CATEGORY_COLOR[def.category]}`}>
                      {CATEGORY_LABEL[def.category]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed opacity-40" style={{ color: 'var(--color-text)' }}>
                    {def.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleAdd(def)}
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
