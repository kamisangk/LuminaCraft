import type { ModuleDefinition } from '../moduleRegistry';
import { lazy } from 'react';
import { HtmlBlockForm } from '@/components/modules/HtmlBlockForm';
import { DEFAULT_HTML_BLOCK_CONTENT } from './htmlBlockDefaults';

const HtmlBlockModule = lazy(() => import('@/components/modules/HtmlBlockModule').then(m => ({ default: m.HtmlBlockModule })));

export const htmlBlockDefinition: ModuleDefinition = {
  type: 'html_block',
  title: 'HTML Block',
  category: 'core',
  description: '支持完整 HTML 文档的自定义内容块',
  defaultProps: {
    htmlContent: DEFAULT_HTML_BLOCK_CONTENT,
  },
  defaultAppearance: {
    themePreset: 'default',
    colors: {
      primary: '#000000',
      surface: 'rgba(10, 14, 23, 0.92)',
      text: '#000000',
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
    showBorder: true,
  },
  appearanceConfig: {
    showColorSection: false,
    showBackgroundSection: false,
  },
  Component: HtmlBlockModule,
  ConfigForm: HtmlBlockForm,
};
