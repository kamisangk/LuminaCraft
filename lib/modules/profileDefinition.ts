import type { ModuleDefinition } from '../moduleRegistry';
import { ProfileModule } from '@/components/modules/ProfileModule';
import { ProfileForm } from '@/components/modules/ProfileForm';

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
    colors: {
      primary: '#58a6ff',
      surface: 'rgba(15, 23, 42, 0.88)',
      text: '#f8fafc',
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
  },
  appearanceConfig: {
    showColorSection: true,
    showBackgroundSection: true,
  },
  Component: ProfileModule,
  ConfigForm: ProfileForm,
};
