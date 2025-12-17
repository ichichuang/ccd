import type { MenuItem } from 'primevue/menuitem'

/**
 * 菜单类型
 *
 * - 'custom': 自定义菜单
 * - 'bar': 水平菜单栏（MenuBar）
 * - 'mega': 大型菜单（MegaMenu）
 * - 'panel': 面板菜单（PanelMenu）
 * - 'tier': 层级菜单（TieredMenu）
 */
export type MenuType = 'custom' | 'bar' | 'mega' | 'panel' | 'tier'

/**
 * 扩展键类型
 *
 * 用于 PanelMenu 的 expandedKeys，控制哪些菜单项处于展开状态
 * 键为菜单项的 key 或 label，值为布尔值（true 表示展开）
 */
export type ExpandedKeys = Record<string | number, boolean>

/**
 * 菜单属性接口
 *
 * 定义 PrimeMenu 组件接受的所有 props
 *
 * @example
 * ```vue
 * <template>
 *   <PrimeMenu
 *     type="bar"
 *     :items="menuItems"
 *     :components-props="{ style: 'custom-style' }"
 *   />
 * </template>
 *
 * <script setup lang="ts">
 * import type { MenuItem } from 'primevue/menuitem'
 *
 * const menuItems: MenuItem[] = [
 *   { label: 'Home', icon: 'pi pi-home', command: () => {} },
 *   { label: 'About', icon: 'pi pi-info', command: () => {} },
 * ]
 * </script>
 * ```
 */
export interface MenuProps {
  /**
   * 菜单类型（必填）
   *
   * 指定要渲染的菜单组件类型
   *
   * @example
   * - type="bar" - 水平菜单栏
   * - type="panel" - 面板菜单
   * - type="tier" - 层级菜单
   */
  type: MenuType

  /**
   * 菜单项数组（必填）
   *
   * 菜单的数据源，每个菜单项遵循 PrimeVue MenuItem 类型
   *
   * @example
   * ```typescript
   * const items: MenuItem[] = [
   *   {
   *     label: 'Home',
   *     icon: 'pi pi-home',
   *     command: () => router.push('/')
   *   },
   *   {
   *     label: 'Users',
   *     icon: 'pi pi-users',
   *     items: [
   *       { label: 'List', command: () => {} },
   *       { label: 'Add', command: () => {} }
   *     ]
   *   }
   * ]
   * ```
   */
  items: MenuItem[]

  /**
   * 菜单组件属性（通用对象）
   *
   * 传递给底层 PrimeVue 菜单组件的额外属性
   * 不同菜单类型支持的属性可能不同
   *
   * @default undefined
   * @example
   * ```typescript
   * // 对于 PanelMenu
   * const componentsProps = {
   *   expandedKeys: { 'users': true },
   *   multiple: true
   * }
   *
   * // 对于 MenuBar
   * const componentsProps = {
   *   model: items,
   *   style: { background: '#f0f0f0' }
   * }
   * ```
   */
  componentsProps?: Record<string, any>
}

/**
 * 类型安全的菜单属性接口
 *
 * 使用泛型约束，提供更好的类型提示
 *
 * @template T 菜单类型
 *
 * @example
 * ```typescript
 * // 类型为 'panel' 时，TypeScript 会提示 PanelMenu 相关的属性
 * const props: TypedMenuProps<'panel'> = {
 *   type: 'panel',
 *   items: menuItems,
 *   componentsProps: {
 *     expandedKeys: { 'users': true }
 *   }
 * }
 * ```
 */
export interface TypedMenuProps<T extends MenuType> {
  /**
   * 菜单类型（可选，通常由泛型参数推断）
   */
  type?: T

  /**
   * 菜单项数组
   */
  items: MenuItem[]

  /**
   * 菜单组件属性
   */
  componentsProps?: Record<string, any>
}

/**
 * PanelMenu 特有的属性接口
 *
 * 继承 MenuProps，并添加 PanelMenu 专用的 expandedKeys 属性
 *
 * @example
 * ```vue
 * <template>
 *   <PrimeMenu
 *     type="panel"
 *     :items="menuItems"
 *     :expanded-keys="expandedKeys"
 *   />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue'
 * import type { ExpandedKeys } from '@/components/modules/prime-menu'
 *
 * const expandedKeys = ref<ExpandedKeys>({
 *   'users': true,
 *   'settings': false
 * })
 * </script>
 * ```
 */
export interface PanelMenuProps extends MenuProps {
  /**
   * 控制展开状态的键值对（PanelMenu 专用）
   *
   * 用于控制哪些菜单项处于展开状态
   * 键为菜单项的 key 或 label，值为布尔值
   *
   * @default undefined
   * @example
   * ```typescript
   * const expandedKeys: ExpandedKeys = {
   *   'users': true,      // 'users' 菜单项展开
   *   'settings': false,  // 'settings' 菜单项收起
   * }
   * ```
   */
  expandedKeys?: ExpandedKeys
}
