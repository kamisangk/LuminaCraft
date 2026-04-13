import type { ModuleDefinition } from '../moduleRegistry';
import { lazy } from 'react';
import { ProfileForm } from '@/components/modules/ProfileForm';

const ProfileModule = lazy(() => import('@/components/modules/ProfileModule').then(m => ({ default: m.ProfileModule })));

export const profileDefinition: ModuleDefinition = {
  type: 'profile',
  title: '个人档案',
  category: 'core',
  description: '显示头像、姓名、简介和社交链接',
  defaultProps: {
    name: '新用户',
    bio: '个人简介',
    avatar: 'https://avatars.githubusercontent.com/u/0',
    links: [],
  },
  defaultAppearance: {
    themePreset: 'default',
    colors: {
      primary: '#000000',
      surface: 'rgba(15, 23, 42, 0.88)',
      text: '#000000',
    },
    background: {
      type: 'color',
      value: 'rgba(255,255,255,0.03)',
      blur: 18,
      opacity: 1,
      noisePattern: false,
    },
    borderRadius: 20,
    padding: 18,
    shadow: 'medium',
    showBorder: true,
  },
  appearanceConfig: {
    showColorSection: true,
    showBackgroundSection: true,
  },
  Component: ProfileModule,
  ConfigForm: ProfileForm,
};
