import type { ModuleDefinition } from '../moduleRegistry';
import { HtmlBlockModule } from '@/components/modules/HtmlBlockModule';
import { HtmlBlockForm } from '@/components/modules/HtmlBlockForm';

export const htmlBlockDefinition: ModuleDefinition = {
  type: 'html_block',
  title: 'HTML Block',
  category: 'core',
  description: '支持完整 HTML 文档的自定义内容块',
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
  appearanceConfig: {
    showColorSection: false,
    showBackgroundSection: false,
  },
  Component: HtmlBlockModule,
  ConfigForm: HtmlBlockForm,
};
