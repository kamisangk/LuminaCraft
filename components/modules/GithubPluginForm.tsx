'use client';

import React from 'react';
import { useAppStore, ModuleInstance, GithubPluginSettings } from '@/store/useAppStore';
import { Field, TextInput, ToggleRow } from '@/components/panels/FormPrimitives';

export function GithubPluginForm({ module }: { module: ModuleInstance }) {
  const updateModuleProps = useAppStore((s) => s.updateModuleProps);
  const settings = (module.props.pluginSettings ?? {}) as GithubPluginSettings;

  const setSettings = (patch: Partial<GithubPluginSettings>) => {
    updateModuleProps(module.id, {
      pluginSettings: { ...settings, ...patch },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Field label="GitHub 用户名">
        <TextInput
          value={settings.username ?? ''}
          onChange={(v) => setSettings({ username: v })}
          placeholder="octocat"
        />
      </Field>

      <Field label="仓库数量">
        <input
          type="range"
          min={1}
          max={8}
          value={settings.repoLimit ?? 4}
          onChange={(e) => setSettings({ repoLimit: Number(e.target.value) })}
          className="w-full accent-blue-400"
        />
        <div className="mt-1 text-xs opacity-40" style={{ color: 'var(--color-text)' }}>
          最多显示 {settings.repoLimit ?? 4} 个公开仓库
        </div>
      </Field>

      <div className="grid grid-cols-1 gap-2">
        <ToggleRow
          label="显示资料"
          checked={settings.showProfile ?? true}
          onChange={(checked) => setSettings({ showProfile: checked })}
        />
        <ToggleRow
          label="显示统计"
          checked={settings.showStats ?? true}
          onChange={(checked) => setSettings({ showStats: checked })}
        />
        <ToggleRow
          label="显示仓库"
          checked={settings.showRepos ?? true}
          onChange={(checked) => setSettings({ showRepos: checked })}
        />
        <ToggleRow
          label="显示热力图"
          checked={settings.showHeatmap ?? false}
          onChange={(checked) => setSettings({ showHeatmap: checked })}
        />
      </div>
    </div>
  );
}
