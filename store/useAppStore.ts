import { create } from 'zustand';
import { DEFAULT_HTML_BLOCK_CONTENT } from '@/lib/modules/htmlBlockDefaults';

export type ModuleCategory = 'core' | 'plugin';
export type Breakpoint = 'xl' | 'lg' | 'md' | 'sm' | 'xs';
export type BackgroundType = 'color' | 'image' | 'video' | 'html' | 'transparent';
export type ThemePreset = 'default' | 'liquid-glass' | 'custom';
export type ModuleThemePreset = ThemePreset;
export type PageThemePreset = ThemePreset;
export type LegacyPageThemePreset = 'liquid-glass' | 'skeuomorph' | 'cyberpunk' | 'minimalist';
export type StoredPageThemePreset = PageThemePreset | LegacyPageThemePreset;

export const BREAKPOINTS: Record<Breakpoint, number> = {
  xl: 1600,
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
};

export const COLS: Record<Breakpoint, number> = {
  xl: 12,
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
};

export interface GithubPluginSettings {
  username?: string;
  showProfile?: boolean;
  showStats?: boolean;
  showRepos?: boolean;
  showHeatmap?: boolean;
  heatmapColor?: string;
  repoLimit?: number;
}

export const DEFAULT_GITHUB_HEATMAP_COLOR = '#39d353';

export interface LayoutRect {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
}

export interface ModuleAppearance {
  themePreset: ModuleThemePreset;
  colors: {
    primary: string;
    surface: string;
    text: string;
  };
  background: {
    type: BackgroundType;
    value: string;
    blur: number;
    opacity: number;
    noisePattern: boolean;
  };
  borderRadius: number;
  padding: number;
  shadow: 'soft' | 'medium' | 'strong' | 'none';
  showBorder: boolean;
}

export interface LegacyPageAppearance {
  themePreset: StoredPageThemePreset;
  mode: 'light' | 'dark' | 'system';
  colors: { primary: string; surface: string; text: string };
  background: {
    type: BackgroundType;
    value: string;
    blur: number;
    opacity: number;
    noisePattern: boolean;
  };
  borderRadius: number;
  customGlobalCss?: string;
}

export type ResolvedPageAppearance = Omit<LegacyPageAppearance, 'themePreset'> & {
  themePreset: PageThemePreset;
};

export type PageAppearancePatch = Partial<Omit<LegacyPageAppearance, 'colors' | 'background'>> & {
  colors?: Partial<LegacyPageAppearance['colors']>;
  background?: Partial<LegacyPageAppearance['background']>;
};

export interface ModuleInstance {
  id: string;
  category: ModuleCategory;
  type: string;
  title: string;
  appearance: ModuleAppearance;
  props: {
    customCss?: string;
    htmlContent?: string;
    pluginSettings?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

export interface ChatCompletionConfig {
  baseUrl: string;
  model: string;
  hasApiKey: boolean;
}

export interface PageConfig {
  version: string;
  templateName?: string;
  templateAuthor?: string;
  site: {
    title: string;
    description: string;
    keywords: string[];
    favicon: string;
    language: string;
  };
  chatCompletion: ChatCompletionConfig;
  appearance?: LegacyPageAppearance;
  layouts: Record<Breakpoint, LayoutRect[]>;
  modules: ModuleInstance[];
}

export interface AppUIState {
  isAuthenticated: boolean;
  isEditMode: boolean;
  activePanel: 'none' | 'modules' | 'plugins' | 'chat_completion';
}

const DEFAULT_MODULE_APPEARANCE: ModuleAppearance = {
  colors: {
    primary: '#000000',
    surface: 'rgba(22, 27, 34, 0.85)',
    text: '#000000',
  },
  background: {
    type: 'color',
    value: 'rgba(255,255,255,0.02)',
    blur: 18,
    opacity: 1,
    noisePattern: false,
  },
  borderRadius: 16,
  padding: 16,
  shadow: 'medium',
  showBorder: true,
  themePreset: 'default',
};

const DEFAULT_CHAT_COMPLETION_CONFIG: ChatCompletionConfig = {
  baseUrl: '',
  model: '',
  hasApiKey: false,
};

function normalizeChatCompletionConfig(config?: Partial<ChatCompletionConfig> | Record<string, unknown> | null): ChatCompletionConfig {
  if (!config || typeof config !== 'object') return DEFAULT_CHAT_COMPLETION_CONFIG;

  return {
    baseUrl: typeof config.baseUrl === 'string' ? config.baseUrl : DEFAULT_CHAT_COMPLETION_CONFIG.baseUrl,
    model: typeof config.model === 'string' ? config.model : DEFAULT_CHAT_COMPLETION_CONFIG.model,
    hasApiKey: typeof config.hasApiKey === 'boolean' ? config.hasApiKey : DEFAULT_CHAT_COMPLETION_CONFIG.hasApiKey,
  };
}

const LEGACY_DEFAULT_APPEARANCE: LegacyPageAppearance = {
  themePreset: 'default',
  mode: 'dark',
  colors: {
    primary: '#58a6ff',
    surface: 'rgba(22, 27, 34, 0.85)',
    text: '#e6edf3',
  },
  background: {
    type: 'color',
    value: '#0d1117',
    blur: 0,
    opacity: 1,
    noisePattern: false,
  },
  borderRadius: 16,
  customGlobalCss: '',
};

const LIQUID_GLASS_PAGE_APPEARANCE: LegacyPageAppearance = {
  themePreset: 'liquid-glass',
  mode: 'light',
  colors: {
    primary: '#111827',
    surface: 'rgba(255, 255, 255, 0.18)',
    text: '#0f172a',
  },
  background: {
    type: 'color',
    value: '#dfe7f6',
    blur: 0,
    opacity: 1,
    noisePattern: false,
  },
  borderRadius: 28,
  customGlobalCss: '',
};

export function normalizePageThemePreset(value?: StoredPageThemePreset | null): PageThemePreset {
  if (value === 'liquid-glass' || value === 'custom' || value === 'default') {
    return value;
  }
  return 'default';
}

export function createPageAppearance(
  overrides: PageAppearancePatch = {},
  current?: Partial<LegacyPageAppearance>
): LegacyPageAppearance {
  const source = current ?? LEGACY_DEFAULT_APPEARANCE;
  const sourceColors = source.colors ?? LEGACY_DEFAULT_APPEARANCE.colors;
  const sourceBackground = source.background ?? LEGACY_DEFAULT_APPEARANCE.background;

  return {
    themePreset: normalizePageThemePreset(overrides.themePreset ?? source.themePreset ?? LEGACY_DEFAULT_APPEARANCE.themePreset),
    mode: overrides.mode ?? source.mode ?? LEGACY_DEFAULT_APPEARANCE.mode,
    colors: {
      ...sourceColors,
      ...overrides.colors,
    },
    background: {
      ...sourceBackground,
      ...overrides.background,
    },
    borderRadius: overrides.borderRadius ?? source.borderRadius ?? LEGACY_DEFAULT_APPEARANCE.borderRadius,
    customGlobalCss: overrides.customGlobalCss ?? source.customGlobalCss ?? LEGACY_DEFAULT_APPEARANCE.customGlobalCss,
  };
}

export function resolvePageAppearance(appearance?: Partial<LegacyPageAppearance>): ResolvedPageAppearance {
  const normalized = createPageAppearance({}, appearance);
  const themePreset = normalizePageThemePreset(normalized.themePreset);

  if (themePreset !== 'liquid-glass') {
    return {
      ...normalized,
      themePreset,
    };
  }

  return {
    ...normalized,
    themePreset,
    mode: LIQUID_GLASS_PAGE_APPEARANCE.mode,
    colors: LIQUID_GLASS_PAGE_APPEARANCE.colors,
    background: LIQUID_GLASS_PAGE_APPEARANCE.background,
    borderRadius: LIQUID_GLASS_PAGE_APPEARANCE.borderRadius,
  };
}

function createModuleAppearance(overrides: Partial<ModuleAppearance> = {}): ModuleAppearance {
  return {
    ...DEFAULT_MODULE_APPEARANCE,
    ...overrides,
    colors: {
      ...DEFAULT_MODULE_APPEARANCE.colors,
      ...overrides.colors,
    },
    background: {
      ...DEFAULT_MODULE_APPEARANCE.background,
      ...overrides.background,
    },
    shadow: overrides.shadow ?? DEFAULT_MODULE_APPEARANCE.shadow,
    showBorder: overrides.showBorder ?? DEFAULT_MODULE_APPEARANCE.showBorder,
  };
}

export function getEffectiveModuleAppearance(
  appearance: ModuleAppearance
): ModuleAppearance {
  if (appearance.themePreset !== 'liquid-glass') {
    return appearance;
  }

  return createModuleAppearance({
    ...appearance,
    colors: {
      primary: '#111827',
      surface: 'rgba(255, 255, 255, 0.18)',
      text: '#0f172a',
    },
    background: {
      type: 'color',
      value: 'linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,255,255,0.22))',
      blur: 28,
      opacity: 1,
      noisePattern: false,
    },
    borderRadius: Math.max(appearance.borderRadius, 24),
    shadow: 'none',
    showBorder: true,
  });
}

function moduleAppearanceFromLegacy(appearance?: Partial<LegacyPageAppearance>): ModuleAppearance {
  if (!appearance) return createModuleAppearance();
  const normalizedAppearance = createPageAppearance({}, appearance);
  return createModuleAppearance({
    colors: normalizedAppearance.colors,
    background: normalizedAppearance.background,
    borderRadius: normalizedAppearance.borderRadius,
  });
}

function normalizeModule(module: ModuleInstance | Record<string, unknown>, legacyAppearance?: Partial<LegacyPageAppearance>): ModuleInstance {
  const raw = module as Record<string, unknown>;
  const legacyModuleAppearance =
    raw.appearance && typeof raw.appearance === 'object'
      ? (raw.appearance as Partial<ModuleAppearance>)
      : undefined;

  const appearance = legacyModuleAppearance
    ? createModuleAppearance(legacyModuleAppearance)
    : moduleAppearanceFromLegacy(legacyAppearance);

  return {
    id: String(raw.id ?? ''),
    category: (raw.category === 'plugin' ? 'plugin' : 'core') as ModuleCategory,
    type: String(raw.type ?? ''),
    title: String(raw.title ?? ''),
    appearance,
    props: raw.props && typeof raw.props === 'object' ? (raw.props as ModuleInstance['props']) : {},
  };
}

function normalizePageConfig(config: PageConfig): PageConfig {
  const legacyAppearance = createPageAppearance({}, config.appearance);
  return {
    ...config,
    chatCompletion: normalizeChatCompletionConfig(config.chatCompletion),
    appearance: legacyAppearance,
    modules: config.modules.map((module) => normalizeModule(module, legacyAppearance)),
  };
}

function cloneSerializable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const DEFAULT_MODULES: ModuleInstance[] = [
  {
    id: 'profile-1',
    category: 'core',
    type: 'profile',
    title: '个人档案',
    appearance: createModuleAppearance(),
    props: {
      name: 'LuminaCraft User',
      bio: '欢迎来到我的个人主页 · Welcome to my homepage',
      avatar: 'https://avatars.githubusercontent.com/u/0',
      links: [
        { label: 'GitHub', url: 'https://github.com' },
        { label: 'Blog', url: '#' },
      ],
    },
  },
  {
    id: 'html-terminal-1',
    category: 'core',
    type: 'html_block',
    title: '代码块',
    appearance: createModuleAppearance({
      colors: {
        primary: '#58a6ff',
        surface: 'rgba(13,17,23,0.92)',
        text: '#e6edf3',
      },
      borderRadius: 18,
      padding: 0,
      shadow: 'strong',
    }),
    props: {
      htmlContent: DEFAULT_HTML_BLOCK_CONTENT,
    },
  },
  {
    id: 'github-placeholder-1',
    category: 'plugin',
    type: 'github_plugin',
    title: 'GitHub',
    appearance: createModuleAppearance({
      colors: {
        primary: '#8b5cf6',
        surface: 'rgba(15, 23, 42, 0.88)',
        text: '#f8fafc',
      },
    }),
    props: {
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
  },
];

export function createDefaultPageConfig(): PageConfig {
  return normalizePageConfig({
  version: '1.0.0',
  templateName: 'Bento Geek Dark',
  templateAuthor: 'LuminaCraft',
  site: {
    title: 'LuminaCraft - 琉璃工艺',
    description: '我的个人主页',
    keywords: ['portfolio', 'homepage', 'bento'],
    favicon: '/favicon.ico',
    language: 'zh-CN',
  },
  chatCompletion: { ...DEFAULT_CHAT_COMPLETION_CONFIG },
  appearance: cloneSerializable(LEGACY_DEFAULT_APPEARANCE),
  layouts: {
    xl: [
      { i: 'profile-1', x: 0, y: 0, w: 4, h: 6 },
      { i: 'html-terminal-1', x: 4, y: 0, w: 5, h: 6 },
      { i: 'github-placeholder-1', x: 9, y: 0, w: 3, h: 6 },
    ],
    lg: [
      { i: 'profile-1', x: 0, y: 0, w: 4, h: 6 },
      { i: 'html-terminal-1', x: 4, y: 0, w: 5, h: 6 },
      { i: 'github-placeholder-1', x: 9, y: 0, w: 3, h: 6 },
    ],
    md: [
      { i: 'profile-1', x: 0, y: 0, w: 5, h: 5 },
      { i: 'html-terminal-1', x: 5, y: 0, w: 5, h: 5 },
      { i: 'github-placeholder-1', x: 0, y: 5, w: 10, h: 4 },
    ],
    sm: [
      { i: 'profile-1', x: 0, y: 0, w: 6, h: 5 },
      { i: 'html-terminal-1', x: 0, y: 5, w: 6, h: 5 },
      { i: 'github-placeholder-1', x: 0, y: 10, w: 6, h: 4 },
    ],
    xs: [
      { i: 'profile-1', x: 0, y: 0, w: 4, h: 5 },
      { i: 'html-terminal-1', x: 0, y: 5, w: 4, h: 5 },
      { i: 'github-placeholder-1', x: 0, y: 10, w: 4, h: 4 },
    ],
  },
  modules: cloneSerializable(DEFAULT_MODULES),
  });
}

interface AppStore extends AppUIState {
  pageConfig: PageConfig;
  activePanelModuleId: string | null;
  isModuleLibraryOpen: boolean;
  isSitePanelOpen: boolean;
  isBackgroundPanelOpen: boolean;
  isChatCompletionOpen: boolean;
  toggleEditMode: () => void;
  setAuthenticated: (v: boolean) => void;
  setActivePanel: (panel: AppUIState['activePanel']) => void;
  setPageConfig: (config: PageConfig) => void;
  updateLayouts: (layouts: Record<string, LayoutRect[]>) => void;
  openModulePanel: (id: string) => void;
  closeModulePanel: () => void;
  updateModuleProps: (id: string, props: Partial<ModuleInstance['props']>) => void;
  updateModuleAppearance: (id: string, patch: Partial<ModuleAppearance>) => void;
  updatePageAppearance: (patch: PageAppearancePatch) => void;
  updatePageBackground: (patch: Partial<LegacyPageAppearance['background']>) => void;
  addModule: (module: ModuleInstance) => void;
  removeModule: (id: string) => void;
  bringModuleToFront: (id: string) => void;
  toggleModuleLibrary: () => void;
  closeModuleLibrary: () => void;
  toggleSitePanel: () => void;
  closeSitePanel: () => void;
  toggleBackgroundPanel: () => void;
  closeBackgroundPanel: () => void;
  updateSite: (patch: Partial<PageConfig['site']>) => void;
  updateChatCompletionConfig: (patch: Partial<ChatCompletionConfig>) => void;
  toggleChatCompletion: () => void;
  closeChatCompletion: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  isAuthenticated: false,
  isEditMode: false,
  activePanel: 'none',
  activePanelModuleId: null,
  isModuleLibraryOpen: false,
  isSitePanelOpen: false,
  isBackgroundPanelOpen: false,
  isChatCompletionOpen: false,
  pageConfig: createDefaultPageConfig(),

  toggleEditMode: () =>
    set((state) => ({ isEditMode: !state.isEditMode })),

  setAuthenticated: (v) => set({ isAuthenticated: v }),

  setActivePanel: (panel) => set({ activePanel: panel }),

  setPageConfig: (config) => set({ pageConfig: normalizePageConfig(config) }),

  updateLayouts: (newLayouts) =>
    set((state) => {
      const activeBreakpoint = Object.keys(newLayouts)[0] as Breakpoint;
      const activeLayout = newLayouts[activeBreakpoint];
      if (!activeLayout) {
        return {
          pageConfig: {
            ...state.pageConfig,
            layouts: { ...state.pageConfig.layouts, ...newLayouts } as Record<Breakpoint, LayoutRect[]>,
          },
        };
      }

      // 只更新当前断点的布局，不自动同步到其他断点
      // 这样可以保持每个断点的独立布局设计
      const updatedLayouts = {
        ...state.pageConfig.layouts,
        [activeBreakpoint]: activeLayout,
      };

      return {
        pageConfig: {
          ...state.pageConfig,
          layouts: updatedLayouts,
        },
      };
    }),

  openModulePanel: (id) => set({ activePanelModuleId: id }),

  closeModulePanel: () => set({ activePanelModuleId: null }),

  updateModuleProps: (id, props) =>
    set((state) => ({
      pageConfig: {
        ...state.pageConfig,
        modules: state.pageConfig.modules.map((m) =>
          m.id === id ? { ...m, props: { ...m.props, ...props } } : m
        ),
      },
    })),

  updateModuleAppearance: (id, patch) =>
    set((state) => ({
      pageConfig: {
        ...state.pageConfig,
        modules: state.pageConfig.modules.map((m) =>
          m.id === id
            ? {
                ...m,
                appearance: createModuleAppearance({
                  ...m.appearance,
                  ...patch,
                  colors: { ...m.appearance.colors, ...patch.colors },
                  background: { ...m.appearance.background, ...patch.background },
                }),
              }
            : m
        ),
      },
    })),

  updatePageAppearance: (patch) =>
    set((state) => ({
      pageConfig: {
        ...state.pageConfig,
        appearance: createPageAppearance(patch, state.pageConfig.appearance),
      },
    })),

  updatePageBackground: (patch) =>
    set((state) => ({
      pageConfig: {
        ...state.pageConfig,
        appearance: createPageAppearance(
          {
            background: patch,
          },
          state.pageConfig.appearance
        ),
      },
    })),

  addModule: (module) =>
    set((state) => {
      const normalizedModule = normalizeModule(module, state.pageConfig.appearance);
      const defaultRect = (bp: Breakpoint, rects: LayoutRect[], id: string): LayoutRect => {
        const maxY = rects.reduce((max, rect) => Math.max(max, rect.y + rect.h), 0);
        return {
          i: id,
          x: 0,
          y: maxY,
          w: Math.min(4, COLS[bp]),
          h: 5,
        };
      };

      const updatedLayouts = Object.fromEntries(
        (Object.entries(state.pageConfig.layouts) as [Breakpoint, LayoutRect[]][]).map(([bp, rects]) => [
          bp,
          [...rects, defaultRect(bp, rects, normalizedModule.id)],
        ])
      ) as Record<Breakpoint, LayoutRect[]>;

      return {
        pageConfig: {
          ...state.pageConfig,
          layouts: updatedLayouts,
          modules: [...state.pageConfig.modules, normalizedModule],
        },
      };
    }),

  removeModule: (id) =>
    set((state) => {
      const updatedLayouts = Object.fromEntries(
        Object.entries(state.pageConfig.layouts).map(([bp, rects]) => [
          bp,
          rects.filter((r) => r.i !== id),
        ])
      ) as Record<Breakpoint, LayoutRect[]>;
      return {
        activePanelModuleId:
          state.activePanelModuleId === id ? null : state.activePanelModuleId,
        pageConfig: {
          ...state.pageConfig,
          layouts: updatedLayouts,
          modules: state.pageConfig.modules.filter((m) => m.id !== id),
        },
      };
    }),

  bringModuleToFront: (id) =>
    set((state) => {
      const target = state.pageConfig.modules.find((m) => m.id === id);
      if (!target) return state;
      return {
        pageConfig: {
          ...state.pageConfig,
          modules: [...state.pageConfig.modules.filter((m) => m.id !== id), target],
        },
      };
    }),

  toggleModuleLibrary: () =>
    set((state) => ({ isModuleLibraryOpen: !state.isModuleLibraryOpen })),

  closeModuleLibrary: () => set({ isModuleLibraryOpen: false }),

  toggleSitePanel: () =>
    set((state) => ({ isSitePanelOpen: !state.isSitePanelOpen })),

  closeSitePanel: () => set({ isSitePanelOpen: false }),

  toggleBackgroundPanel: () =>
    set((state) => ({ isBackgroundPanelOpen: !state.isBackgroundPanelOpen })),

  closeBackgroundPanel: () => set({ isBackgroundPanelOpen: false }),

  updateSite: (patch) =>
    set((state) => ({
      pageConfig: {
        ...state.pageConfig,
        site: { ...state.pageConfig.site, ...patch },
      },
    })),

  updateChatCompletionConfig: (patch) =>
    set((state) => ({
      pageConfig: {
        ...state.pageConfig,
        chatCompletion: {
          ...state.pageConfig.chatCompletion,
          ...patch,
        },
      },
    })),

  toggleChatCompletion: () =>
    set((state) => ({ isChatCompletionOpen: !state.isChatCompletionOpen })),

  closeChatCompletion: () => set({ isChatCompletionOpen: false }),
}));
