'use client';

import React, { useCallback } from 'react';
import { useAppStore, ModuleInstance } from '@/store/useAppStore';
import { Field, TextInput, TextArea } from '@/components/panels/FormPrimitives';

export function ProfileForm({ module }: { module: ModuleInstance }) {
  const updateModuleProps = useAppStore((s) => s.updateModuleProps);
  const props = module.props as {
    name?: string;
    bio?: string;
    avatar?: string;
    links?: { label: string; url: string }[];
  };
  const links: { label: string; url: string }[] = Array.isArray(props.links) ? props.links : [];

  const set = useCallback(
    (patch: Record<string, unknown>) => updateModuleProps(module.id, patch),
    [module.id, updateModuleProps]
  );

  const setLink = (i: number, field: 'label' | 'url', val: string) => {
    const next = links.map((l, idx) => (idx === i ? { ...l, [field]: val } : l));
    set({ links: next });
  };

  const addLink = () => set({ links: [...links, { label: '', url: '' }] });

  const removeLink = (i: number) => set({ links: links.filter((_, idx) => idx !== i) });

  return (
    <div className="flex flex-col gap-4">
      <Field label="姓名">
        <TextInput value={props.name ?? ''} onChange={(v) => set({ name: v })} />
      </Field>
      <Field label="简介">
        <TextArea value={props.bio ?? ''} onChange={(v) => set({ bio: v })} rows={3} />
      </Field>
      <Field label="头像 URL">
        <TextInput value={props.avatar ?? ''} onChange={(v) => set({ avatar: v })} placeholder="https://..." />
      </Field>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium opacity-60" style={{ color: 'var(--color-text)' }}>
            链接
          </span>
          <button
            type="button"
            onClick={addLink}
            className="rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300 transition-colors hover:bg-blue-500/40"
          >
            + 添加
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {links.map((link, i) => (
            <div key={i} className="grid w-full grid-cols-[5rem_minmax(0,1fr)_1.5rem] items-center gap-2">
              <TextInput
                value={link.label}
                onChange={(v) => setLink(i, 'label', v)}
                placeholder="标签"
                className="min-w-0"
              />
              <TextInput
                value={link.url}
                onChange={(v) => setLink(i, 'url', v)}
                placeholder="URL"
                className="min-w-0"
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-red-400/70 transition-colors hover:bg-red-500/10 hover:text-red-400"
                title="删除"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
