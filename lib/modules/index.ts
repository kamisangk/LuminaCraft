import type { ModuleDefinition } from '../moduleRegistry';
import { profileDefinition } from './profileDefinition';
import { htmlBlockDefinition } from './htmlBlockDefinition';
import { githubPluginDefinition } from './githubPluginDefinition';

/**
 * 所有已注册模块定义。新增模块时只需：
 * 1. 创建 xxxDefinition.ts
 * 2. 在此处 import 并加入数组
 */
const MODULE_DEFINITIONS: ModuleDefinition[] = [
  profileDefinition,
  htmlBlockDefinition,
  githubPluginDefinition,
];

/** 按 type 查找模块定义 */
export function getModuleDefinition(type: string): ModuleDefinition | undefined {
  return MODULE_DEFINITIONS.find((d) => d.type === type);
}

/** 获取所有已注册的模块定义（用于模块库面板） */
export function getAllModuleDefinitions(): readonly ModuleDefinition[] {
  return MODULE_DEFINITIONS;
}
