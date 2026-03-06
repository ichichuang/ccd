import type { UIDesignState } from '@/types/design-state'

/**
 * 页面设计状态声明 (Design Compiler Input)
 * 该配置定义了本页面的宏观结构，AI 生成或修改 UI 时必须严格遵守。
 */
export const pageState: UIDesignState = {
  intent: 'settings',
  context: 'desktop-first',
  archetype: 'A1-toolbar-content', // 必须对应 Toolbar + Content 结构
  density: 'comfortable',
  hierarchy: 'reading-first',
  emphasis: 'low',
  ctaPolicy: 'single-primary',
}
