import type { ModuleDefinition } from '../moduleRegistry';
import { DEFAULT_GITHUB_HEATMAP_COLOR, type GithubPluginSettings } from '@/store/useAppStore';
import { lazy } from 'react';
import { GithubPluginForm } from '@/components/modules/GithubPluginForm';

const GithubPlaceholderModule = lazy(() => import('@/components/modules/GithubPlaceholderModule').then(m => ({ default: m.GithubPlaceholderModule })));

export const githubPluginDefinition: ModuleDefinition = {
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
      showHeatmap: false,
      heatmapColor: DEFAULT_GITHUB_HEATMAP_COLOR,
      repoLimit: 4,
    } satisfies GithubPluginSettings,
  },
  defaultAppearance: {
    themePreset: 'default',
    colors: {
      primary: '#000000',
      surface: 'rgba(17, 24, 39, 0.9)',
      text: '#000000',
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
    showBorder: true,
  },
  appearanceConfig: {
    showColorSection: true,
    showBackgroundSection: true,
  },
  Component: GithubPlaceholderModule,
  ConfigForm: GithubPluginForm,
};
