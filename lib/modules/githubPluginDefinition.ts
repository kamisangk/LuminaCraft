import type { ModuleDefinition } from '../moduleRegistry';
import type { GithubPluginSettings } from '@/store/useAppStore';
import { GithubPlaceholderModule } from '@/components/modules/GithubPlaceholderModule';
import { GithubPluginForm } from '@/components/modules/GithubPluginForm';

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
  appearanceConfig: {
    showColorSection: true,
    showBackgroundSection: true,
  },
  Component: GithubPlaceholderModule,
  ConfigForm: GithubPluginForm,
};
