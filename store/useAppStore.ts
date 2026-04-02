import { create } from 'zustand';

export type ModuleCategory = 'core' | 'plugin';
export type Breakpoint = 'xl' | 'lg' | 'md' | 'sm' | 'xs';
export type BackgroundType = 'color' | 'image' | 'video' | 'html' | 'transparent';

export interface GithubPluginSettings {
  username?: string;
  showProfile?: boolean;
  showStats?: boolean;
  showRepos?: boolean;
  showHeatmap?: boolean;
  repoLimit?: number;
}

export interface LayoutRect {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
}

export interface ModuleAppearance {
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
  shadow: 'soft' | 'medium' | 'strong';
}

export interface LegacyPageAppearance {
  themePreset: 'liquid-glass' | 'skeuomorph' | 'cyberpunk' | 'minimalist' | 'custom';
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

export interface AICopilotConfig {
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
  aiCopilot: AICopilotConfig;
  appearance?: LegacyPageAppearance;
  layouts: Record<Breakpoint, LayoutRect[]>;
  modules: ModuleInstance[];
}

export interface AppUIState {
  isAuthenticated: boolean;
  isEditMode: boolean;
  activePanel: 'none' | 'modules' | 'plugins' | 'ai_copilot';
}

const DEFAULT_MODULE_APPEARANCE: ModuleAppearance = {
  colors: {
    primary: '#58a6ff',
    surface: 'rgba(22, 27, 34, 0.85)',
    text: '#e6edf3',
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
};

const DEFAULT_AI_COPILOT_CONFIG: AICopilotConfig = {
  baseUrl: '',
  model: '',
  hasApiKey: false,
};

function normalizeAICopilotConfig(config?: Partial<AICopilotConfig> | Record<string, unknown> | null): AICopilotConfig {
  if (!config || typeof config !== 'object') return DEFAULT_AI_COPILOT_CONFIG;

  return {
    baseUrl: typeof config.baseUrl === 'string' ? config.baseUrl : DEFAULT_AI_COPILOT_CONFIG.baseUrl,
    model: typeof config.model === 'string' ? config.model : DEFAULT_AI_COPILOT_CONFIG.model,
    hasApiKey: typeof config.hasApiKey === 'boolean' ? config.hasApiKey : DEFAULT_AI_COPILOT_CONFIG.hasApiKey,
  };
}

const LEGACY_DEFAULT_APPEARANCE: LegacyPageAppearance = {
  themePreset: 'liquid-glass',
  mode: 'dark',
  colors: {
    primary: '#58a6ff',
    surface: 'rgba(22, 27, 34, 0.85)',
    text: '#e6edf3',
  },
  background: {
    type: 'html',
    value: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden}
body{
  background:#ffffff;
  display:flex;
  align-items:center;
  justify-content:center;
}
.clock-wrap{
  position:relative;
  width:min(90vw,90vh);
  height:min(90vw,90vh);
}
.clock-svg{
  width:100%;
  height:100%;
  overflow:visible;
}
.dial-ring{
  transform-origin:250px 250px;
}
</style>
</head>
<body>
<div class="clock-wrap">
<svg class="clock-svg" viewBox="0 0 500 500">
  <g class="dial-ring" id="hourRing">
    <circle cx="250" cy="250" r="140" fill="none" stroke="#d0d0d0" stroke-width="1.5"/>
    <text x="310" y="146.08" font-size="18" fill="#222" text-anchor="middle" dominant-baseline="middle" font-family="JetBrains Mono" font-weight="800" transform="rotate(30,310,146.08)">1</text>
    <text x="353.92" y="190" font-size="18" fill="#222" text-anchor="middle" dominant-baseline="middle" font-family="JetBrains Mono" font-weight="800" transform="rotate(60,353.92,190)">2</text>
    <text x="370" y="250" font-size="18" fill="#222" text-anchor="middle" dominant-baseline="middle" font-family="JetBrains Mono" font-weight="800" transform="rotate(90,370,250)">3</text>
    <text x="353.92" y="310" font-size="18" fill="#222" text-anchor="middle" dominant-baseline="middle" font-family="JetBrains Mono" font-weight="800" transform="rotate(120,353.92,310)">4</text>
    <text x="310" y="353.92" font-size="18" fill="#222" text-anchor="middle" dominant-baseline="middle" font-family="JetBrains Mono" font-weight="800" transform="rotate(150,310,353.92)">5</text>
    <text x="250" y="370" font-size="18" fill="#222" text-anchor="middle" dominant-baseline="middle" font-family="JetBrains Mono" font-weight="800" transform="rotate(180,250,370)">6</text>
    <text x="190" y="353.92" font-size="18" fill="#222" text-anchor="middle" dominant-baseline="middle" font-family="JetBrains Mono" font-weight="800" transform="rotate(210,190,353.92)">7</text>
    <text x="146.08" y="310" font-size="18" fill="#222" text-anchor="middle" dominant-baseline="middle" font-family="JetBrains Mono" font-weight="800" transform="rotate(240,146.08,310)">8</text>
    <text x="130" y="250" font-size="18" fill="#222" text-anchor="middle" dominant-baseline="middle" font-family="JetBrains Mono" font-weight="800" transform="rotate(270,130,250)">9</text>
    <text x="146.08" y="190" font-size="18" fill="#222" text-anchor="middle" dominant-baseline="middle" font-family="JetBrains Mono" font-weight="800" transform="rotate(300,146.08,190)">10</text>
    <text x="190" y="146.08" font-size="18" fill="#222" text-anchor="middle" dominant-baseline="middle" font-family="JetBrains Mono" font-weight="800" transform="rotate(330,190,146.08)">11</text>
    <text x="250" y="130" font-size="18" fill="#222" text-anchor="middle" dominant-baseline="middle" font-family="JetBrains Mono" font-weight="800" transform="rotate(360,250,130)">12</text>
  </g>
</svg>
</div>
<script>
function update(){
  var now=new Date();
  var h=now.getHours()%12+now.getMinutes()/60+now.getSeconds()/3600;
  document.getElementById('hourRing').style.transform='rotate('+(- h*(360/12))+'deg)';
}
update();
setInterval(update,50);
</script>
</body>
</html>`,
    blur: 0,
    opacity: 1,
    noisePattern: false,
  },
  borderRadius: 16,
  customGlobalCss: '',
};

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
  };
}

function moduleAppearanceFromLegacy(appearance?: Partial<LegacyPageAppearance>): ModuleAppearance {
  if (!appearance) return createModuleAppearance();
  return createModuleAppearance({
    colors: appearance.colors,
    background: appearance.background,
    borderRadius: appearance.borderRadius,
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
  const legacyAppearance = config.appearance ?? LEGACY_DEFAULT_APPEARANCE;
  return {
    ...config,
    aiCopilot: normalizeAICopilotConfig(config.aiCopilot),
    modules: config.modules.map((module) => normalizeModule(module, legacyAppearance)),
  };
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
      bio: '欢迎来到我的数字身份枢纽 · Welcome to my digital hub',
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
    title: '终端模拟器',
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
      htmlContent: `<style>
  .terminal { background: #0d1117; color: #58d68d; font-family: 'Courier New', monospace; padding: 16px; border-radius: 8px; height: 100%; box-sizing: border-box; overflow: auto; }
  .terminal .line { margin: 2px 0; font-size: 13px; }
  .terminal .prompt { color: #58a6ff; }
  .terminal .cmd { color: #e6edf3; }
  .terminal .out { color: #8b949e; }
  .blink { animation: blink 1s step-end infinite; }
  @keyframes blink { 50% { opacity: 0; } }
</style>
<div class="terminal">
  <div class="line"><span class="prompt">lumina@craft</span><span class="cmd"> ~ % whoami</span></div>
  <div class="line out">LuminaCraft - Personal Homepage Builder</div>
  <div class="line">&nbsp;</div>
  <div class="line"><span class="prompt">lumina@craft</span><span class="cmd"> ~ % cat features.txt</span></div>
  <div class="line out">✓ Bento Box Layout Engine</div>
  <div class="line out">✓ Multi-breakpoint Responsive Grid</div>
  <div class="line out">✓ Plugin Ecosystem</div>
  <div class="line out">✓ AI Copilot Design</div>
  <div class="line out">✓ Module-level Styling</div>
  <div class="line">&nbsp;</div>
  <div class="line"><span class="prompt">lumina@craft</span><span class="cmd"> ~ % <span class="blink">█</span></span></div>
</div>`,
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
        repoLimit: 4,
      } satisfies GithubPluginSettings,
    },
  },
];

const DEFAULT_PAGE_CONFIG: PageConfig = normalizePageConfig({
  version: '1.0.0',
  templateName: 'Bento Geek Dark',
  templateAuthor: 'LuminaCraft',
  site: {
    title: 'LuminaCraft - 琉璃工艺',
    description: '我的个人数字身份枢纽',
    keywords: ['portfolio', 'homepage', 'bento'],
    favicon: '/favicon.ico',
    language: 'zh-CN',
  },
  aiCopilot: DEFAULT_AI_COPILOT_CONFIG,
  appearance: LEGACY_DEFAULT_APPEARANCE,
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
  modules: DEFAULT_MODULES,
});

interface AppStore extends AppUIState {
  pageConfig: PageConfig;
  activePanelModuleId: string | null;
  isModuleLibraryOpen: boolean;
  isSitePanelOpen: boolean;
  isBackgroundPanelOpen: boolean;
  isAiCopilotOpen: boolean;
  toggleEditMode: () => void;
  setAuthenticated: (v: boolean) => void;
  setActivePanel: (panel: AppUIState['activePanel']) => void;
  setPageConfig: (config: PageConfig) => void;
  updateLayouts: (layouts: Record<string, LayoutRect[]>) => void;
  openModulePanel: (id: string) => void;
  closeModulePanel: () => void;
  updateModuleProps: (id: string, props: Partial<ModuleInstance['props']>) => void;
  updateModuleAppearance: (id: string, patch: Partial<ModuleAppearance>) => void;
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
  updateAICopilotConfig: (patch: Partial<AICopilotConfig>) => void;
  toggleAiCopilot: () => void;
  closeAiCopilot: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  isAuthenticated: false,
  isEditMode: false,
  activePanel: 'none',
  activePanelModuleId: null,
  isModuleLibraryOpen: false,
  isSitePanelOpen: false,
  isBackgroundPanelOpen: false,
  isAiCopilotOpen: false,
  pageConfig: DEFAULT_PAGE_CONFIG,

  toggleEditMode: () =>
    set((state) => ({ isEditMode: !state.isEditMode })),

  setAuthenticated: (v) => set({ isAuthenticated: v }),

  setActivePanel: (panel) => set({ activePanel: panel }),

  setPageConfig: (config) => set({ pageConfig: normalizePageConfig(config) }),

  updateLayouts: (newLayouts) =>
    set((state) => ({
      pageConfig: {
        ...state.pageConfig,
        layouts: {
          ...state.pageConfig.layouts,
          ...(Object.fromEntries(
            Object.entries(newLayouts).map(([k, v]) => [k, v])
          ) as Record<Breakpoint, LayoutRect[]>),
        },
      },
    })),

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

  updatePageBackground: (patch) =>
    set((state) => ({
      pageConfig: {
        ...state.pageConfig,
        appearance: {
          ...(state.pageConfig.appearance ?? LEGACY_DEFAULT_APPEARANCE),
          background: {
            ...(state.pageConfig.appearance?.background ?? LEGACY_DEFAULT_APPEARANCE.background),
            ...patch,
          },
        },
      },
    })),

  addModule: (module) =>
    set((state) => {
      const normalizedModule = normalizeModule(module, state.pageConfig.appearance);
      const defaultRect = (id: string): LayoutRect => ({ i: id, x: 0, y: Infinity, w: 4, h: 5 });
      const updatedLayouts = Object.fromEntries(
        Object.entries(state.pageConfig.layouts).map(([bp, rects]) => [
          bp,
          [...rects, defaultRect(normalizedModule.id)],
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

  updateAICopilotConfig: (patch) =>
    set((state) => ({
      pageConfig: {
        ...state.pageConfig,
        aiCopilot: {
          ...state.pageConfig.aiCopilot,
          ...patch,
        },
      },
    })),

  toggleAiCopilot: () =>
    set((state) => ({ isAiCopilotOpen: !state.isAiCopilotOpen })),

  closeAiCopilot: () => set({ isAiCopilotOpen: false }),
}));
