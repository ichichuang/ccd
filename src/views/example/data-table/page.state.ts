import type { UIDesignState } from '@/types/design-state'

/**
 * 页面设计状态声明 (Design Compiler Input)
 * 该配置定义了本页面的宏观结构，AI 生成或修改 UI 时必须严格遵守。
 */
export const pageState: UIDesignState = {
  intent: 'data-management',
  context: 'desktop-first',
  archetype: 'A4-table-drawer', // 必须对应 Toolbar + Table + Drawer 结构
  density: 'spacious', // Round-Trip 测试：改为宽松布局
  hierarchy: 'data-first', // 核心内容是数据本身
  emphasis: 'medium',
  ctaPolicy: 'single-primary', // 只允许一个主按钮（例如「新建」/「添加」）
}
