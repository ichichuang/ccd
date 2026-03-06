import type { UIDesignState } from '@/types/design-state'

/**
 * 页面设计状态声明 (Design Compiler Input)
 * 该配置定义了本页面的宏观结构，AI 生成或修改 UI 时必须严格遵守。
 */
export const pageState: UIDesignState = {
  intent: 'detail-view',
  context: 'desktop-first',
  archetype: 'A2-sidebar-inspector', // 必须对应 main-content + inspector 左右分栏结构
  density: 'comfortable',
  hierarchy: 'reading-first',
  emphasis: 'medium',
  ctaPolicy: 'minimal',
}
