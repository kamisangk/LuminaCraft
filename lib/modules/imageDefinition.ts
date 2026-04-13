import type { ModuleDefinition } from '../moduleRegistry';
import { lazy } from 'react';
import { ImageForm } from '@/components/modules/ImageForm';

const ImageModule = lazy(() => import('@/components/modules/ImageModule').then(m => ({ default: m.ImageModule })));

export const imageDefinition: ModuleDefinition = {
  type: 'image_block',
  title: '图片展示',
  category: 'core',
  description: '展示单张图片，支持自定义比例和点击跳转',
  defaultProps: {
    src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    alt: 'Default Image',
    objectFit: 'cover',
    link: '',
    openInNewTab: true,
  },
  defaultAppearance: {
    themePreset: 'default',
    colors: {
      primary: '#000000',
      surface: 'rgba(255, 255, 255, 0.05)',
      text: '#000000',
    },
    background: {
      type: 'transparent',
      value: 'transparent',
      blur: 0,
      opacity: 1,
      noisePattern: false,
    },
    borderRadius: 16,
    padding: 0,
    shadow: 'soft',
    showBorder: true,
  },
  appearanceConfig: {
    showColorSection: true,
    showBackgroundSection: true,
  },
  Component: ImageModule,
  ConfigForm: ImageForm,
};
