import type { ModuleCategory, ModuleAppearance, ModuleInstance } from '@/store/useAppStore';
import type React from 'react';

/**
 * 模块定义接口 – 每个模块通过该对象向注册表声明自己的元数据。
 * 新增模块只需创建一个 ModuleDefinition 并在 lib/modules/index.ts 中注册。
 */
export interface ModuleDefinition {
  /** 唯一模块类型标识符，如 'profile', 'html_block' */
  type: string;
  /** 默认显示名称 */
  title: string;
  /** 模块分类 */
  category: ModuleCategory;
  /** 模块库中显示的描述 */
  description: string;
  /** 新建实例时的默认 props */
  defaultProps: ModuleInstance['props'];
  /** 新建实例时的默认外观 */
  defaultAppearance: ModuleAppearance;
  /** 控制外观配置面板中哪些节显示 */
  appearanceConfig: {
    showColorSection: boolean;
    showBackgroundSection: boolean;
  };
  /** 模块内容渲染组件 */
  Component: React.ComponentType<{ module: ModuleInstance }>;
  /** 模块内容配置表单组件 */
  ConfigForm: React.ComponentType<{ module: ModuleInstance }>;
}
