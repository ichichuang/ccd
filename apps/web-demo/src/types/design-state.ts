/**
 * @file src/types/design-state.ts
 * @description 核心 UI 状态契约 (Source of Truth)。
 *
 * 此类型定义是页面级设计决策的规范语言，供 AI 代码生成和人工审查参考。
 * 每个业务页面应通过 page.state.ts 声明其 UIDesignState，以确保布局、密度、层级等
 * 设计维度的一致性。
 *
 * @remarks
 * - 当前作为 AI 设计契约和页面规范使用（参见 .ai/rules/design-system/04-design-state-contract.mdc）
 * - 运行时消费者（Design Compiler / 布局引擎）尚未实现，`pageState` 目前仅作为声明性锚点
 * - 禁止在 UI 层随意绕过此状态直接修改布局结构
 * - 此类型文件为只读基准，修改需经过架构师的显式审批。AI 不得自行扩展 archetype 或新增 intent。
 *
 * @see {@link file://./../../views/dashboard/page.state.ts} 唯一的真实消费者示例
 * @see {@link file://./../../.ai/rules/design-system/04-design-state-contract.mdc} AI 设计契约规则
 */

/**
 * Base DTO for business models. All page.state.ts models (formValues, table rows)
 * SHOULD extend or Pick from API-generated DTOs to ensure end-to-end type safety.
 * When backend fields change, frontend will fail at compile time instead of runtime.
 *
 * @example
 * // In src/api/user/user.ts: export interface UserDetailRes { id: string; name: string; role: string }
 * // In page.state.ts or useSchemaForm: type UserFormModel = Pick<UserDetailRes, 'name' | 'role'>
 */
export type BaseBusinessDTO = Record<string, unknown>

export interface UIDesignState {
  /** 页面核心业务意图 */
  intent: 'dashboard' | 'data-management' | 'form-workflow' | 'detail-view' | 'settings'

  /** 响应式上下文偏好 */
  context?: 'desktop-first' | 'mobile-first'

  /** 布局原型 (Layout Archetype) */
  archetype:
    | 'A1-toolbar-content'
    | 'A2-sidebar-inspector'
    | 'A3-stats-grid'
    | 'A4-table-drawer'
    | 'A5-form-wizard'

  /** 空间信息密度 */
  density: 'compact' | 'comfortable' | 'spacious'

  /** 视觉与结构层级 */
  hierarchy: 'data-first' | 'action-first' | 'reading-first'

  /** 视觉强调程度 */
  emphasis: 'low' | 'medium' | 'high'

  /** 行为召唤 (CTA) 约束策略 */
  ctaPolicy: 'minimal' | 'single-primary' | 'dual-primary'
}
