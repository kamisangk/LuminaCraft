/**
 * 全局 CSS 样式管理器
 * 将所有模块的 CSS 合并到单一 style 标签中，避免多个 style 标签导致的性能问题
 */

class StyleManager {
  private styleElement: HTMLStyleElement | null = null;
  private styles: Map<string, string> = new Map();

  private ensureStyleElement() {
    if (this.styleElement && document.head.contains(this.styleElement)) {
      return this.styleElement;
    }

    // 创建或重新创建 style 元素
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'lumina-module-styles';
    this.styleElement.setAttribute('data-managed', 'true');
    document.head.appendChild(this.styleElement);

    return this.styleElement;
  }

  /**
   * 注册或更新模块样式
   */
  setModuleStyle(moduleId: string, css: string) {
    this.styles.set(moduleId, css);
    this.updateStyleElement();
  }

  /**
   * 移除模块样式
   */
  removeModuleStyle(moduleId: string) {
    this.styles.delete(moduleId);
    this.updateStyleElement();
  }

  /**
   * 更新 style 元素内容
   */
  private updateStyleElement() {
    const element = this.ensureStyleElement();
    const combinedCss = Array.from(this.styles.values()).join('\n\n');
    element.textContent = combinedCss;
  }

  /**
   * 清空所有样式
   */
  clear() {
    this.styles.clear();
    if (this.styleElement) {
      this.styleElement.textContent = '';
    }
  }
}

// 单例实例
export const styleManager = new StyleManager();
