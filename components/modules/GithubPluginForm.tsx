'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { DEFAULT_GITHUB_HEATMAP_COLOR, GithubPluginSettings, ModuleInstance, useAppStore } from '@/store/useAppStore';
import { Field, TextInput, ToggleRow, toHexSafe } from '@/components/panels/FormPrimitives';

const GITHUB_USERNAME_LABEL = 'GitHub \u7528\u6237\u540d';
const REPO_LIMIT_LABEL = '\u4ed3\u5e93\u6570\u91cf';
const REPO_LIMIT_HINT_PREFIX = '\u6700\u591a\u663e\u793a ';
const REPO_LIMIT_HINT_SUFFIX = ' \u4e2a\u516c\u5f00\u4ed3\u5e93';
const SHOW_PROFILE_LABEL = '\u663e\u793a\u8d44\u6599';
const SHOW_STATS_LABEL = '\u663e\u793a\u7edf\u8ba1';
const SHOW_REPOS_LABEL = '\u663e\u793a\u4ed3\u5e93';
const SHOW_HEATMAP_LABEL = '\u663e\u793a\u70ed\u529b\u56fe';
const HEATMAP_COLOR_LABEL = '\u70ed\u529b\u56fe\u989c\u8272';

function isValidHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

export function GithubPluginForm({ module }: { module: ModuleInstance }) {
  const updateModuleProps = useAppStore((s) => s.updateModuleProps);
  const settings = (module.props.pluginSettings ?? {}) as GithubPluginSettings;
  const storedHeatmapColor = settings.heatmapColor ?? DEFAULT_GITHUB_HEATMAP_COLOR;
  const [heatmapColorInput, setHeatmapColorInput] = useState(storedHeatmapColor);

  useEffect(() => {
    setHeatmapColorInput(storedHeatmapColor);
  }, [module.id, storedHeatmapColor]);

  const colorPickerValue = useMemo(() => {
    if (isValidHexColor(heatmapColorInput)) return heatmapColorInput;
    return toHexSafe(storedHeatmapColor);
  }, [heatmapColorInput, storedHeatmapColor]);

  const setSettings = (patch: Partial<GithubPluginSettings>) => {
    const hasChange = Object.entries(patch).some(([key, value]) => settings[key as keyof GithubPluginSettings] !== value);
    if (!hasChange) return;

    updateModuleProps(module.id, {
      pluginSettings: { ...settings, ...patch },
    });
  };

  const handleHeatmapColorTextChange = (value: string) => {
    setHeatmapColorInput(value);
    if (isValidHexColor(value)) {
      setSettings({ heatmapColor: value });
    }
  };

  const handleHeatmapColorPickerChange = (value: string) => {
    setHeatmapColorInput(value);
    setSettings({ heatmapColor: value });
  };

  return (
    <div className="flex flex-col gap-4">
      <Field label={GITHUB_USERNAME_LABEL}>
        <TextInput
          value={settings.username ?? ''}
          onChange={(value) => setSettings({ username: value })}
          placeholder="octocat"
        />
      </Field>

      <Field label={REPO_LIMIT_LABEL}>
        <input
          type="range"
          min={1}
          max={8}
          value={settings.repoLimit ?? 4}
          onChange={(e) => setSettings({ repoLimit: Number(e.target.value) })}
          className="w-full accent-blue-400"
        />
        <div className="mt-1 text-xs opacity-40" style={{ color: 'var(--color-text)' }}>
          {REPO_LIMIT_HINT_PREFIX}
          {settings.repoLimit ?? 4}
          {REPO_LIMIT_HINT_SUFFIX}
        </div>
      </Field>

      <div className="grid grid-cols-1 gap-2">
        <ToggleRow
          label={SHOW_PROFILE_LABEL}
          checked={settings.showProfile ?? true}
          onChange={(checked) => setSettings({ showProfile: checked })}
        />
        <ToggleRow
          label={SHOW_STATS_LABEL}
          checked={settings.showStats ?? true}
          onChange={(checked) => setSettings({ showStats: checked })}
        />
        <ToggleRow
          label={SHOW_REPOS_LABEL}
          checked={settings.showRepos ?? true}
          onChange={(checked) => setSettings({ showRepos: checked })}
        />
        <ToggleRow
          label={SHOW_HEATMAP_LABEL}
          checked={settings.showHeatmap ?? false}
          onChange={(checked) => setSettings({ showHeatmap: checked })}
        />
      </div>

      {(settings.showHeatmap ?? false) && (
        <Field label={HEATMAP_COLOR_LABEL}>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colorPickerValue}
              onChange={(e) => handleHeatmapColorPickerChange(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded-lg border border-white/10 bg-transparent p-0.5"
            />
            <TextInput value={heatmapColorInput} onChange={handleHeatmapColorTextChange} monospace className="flex-1" />
          </div>
        </Field>
      )}
    </div>
  );
}
