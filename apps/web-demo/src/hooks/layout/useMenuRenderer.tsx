/**
 * 菜单项通用渲染工厂（TieredMenu #item slot 渲染器）
 *
 * 职责：
 * - 统一 Header / Sidebar / Breadcrumb 等场景下 TieredMenu 子项的 DOM 结构与状态样式
 * - 复用 useMenuVisuals 提供的 base/state/icon 逻辑，避免在布局组件中重复实现
 *
 * 边界：
 * - 仅负责菜单项自身的视觉与 click 行为，不参与菜单数据结构与布局容器逻辑
 * - 场景化差异通过 context / inactiveClasses / onItemClick / emphasizeActiveLabel 参数传入
 */

import { Icons } from '@ccd/vue-ui'
import {
  MENU_ADMIN_POPUP_ITEM_UNIFIED,
  MENU_ICON_COMMON_CLASS,
  MENU_POPUP_ITEM_CLASS,
  MENU_TEXT_CLASS,
} from '@/constants/layout-menu'
import type { VNode } from 'vue'
import {
  getMenuItemBase,
  getMenuStateClasses,
  getIconSize,
  type MenuVisualContext,
} from '@/hooks/layout/useMenuVisuals'
import { goToRoute, type PrimeMenuModelItem } from '@/router/utils/helper'

export interface TieredMenuItemSlotProps {
  item: PrimeMenuModelItem
  props: {
    action: Record<string, unknown> & {
      class?: string
      onClick?: (e: Event) => void
    }
  }
  hasSubmenu: boolean
}

export interface TieredMenuInactiveClasses {
  root?: string
  child?: string
}

export interface TieredMenuItemRendererOptions {
  /** 菜单视觉上下文（header / sidebar / breadcrumb） */
  context: MenuVisualContext
  /**
   * 计算当前菜单项与激活路由的距离（由调用方根据场景提供）。
   * - 0 = 当前激活项
   * - 正数 = 激活路径上的祖先（1=父级, 2=祖父级, ...）
   * - 负数 = 不在激活路径上
   */
  getDistance: (item: PrimeMenuModelItem) => number
  /** 非激活态文字样式覆写（默认使用 layout-menu.ts 中的语义类） */
  inactiveClasses?: TieredMenuInactiveClasses
  /**
   * 自定义点击逻辑：
   * - 若提供：完全接管点击行为（内部不会再调用 goToRoute 或 action.onClick）
   * - 若未提供：默认行为为根据 route.name/path 调用 goToRoute，再透传 action.onClick
   */
  onItemClick?: (
    item: PrimeMenuModelItem,
    ev: Event,
    action?: {
      onClick?: (ev: Event) => void
    }
  ) => void
  /** 是否对当前激活项（distance === 0）的 label 增强强调（如 font-bold），适用于 Breadcrumb 等场景 */
  emphasizeActiveLabel?: boolean
}

function getLabelClassByContext(context: MenuVisualContext): string {
  if (context === 'breadcrumb') {
    return 'truncate flex-1 text-left pt-px text-sm !text-current'
  }
  if (context === 'header') {
    return `truncate flex-1 text-left !text-current ${MENU_TEXT_CLASS} font-medium pt-px`
  }
  return ['truncate flex-1 !text-current', MENU_TEXT_CLASS].join(' ')
}

export function createTieredMenuItemRenderer(
  options: TieredMenuItemRendererOptions
): (slotProps: TieredMenuItemSlotProps) => VNode {
  const {
    context,
    getDistance,
    inactiveClasses,
    onItemClick,
    emphasizeActiveLabel,
  }: TieredMenuItemRendererOptions = options

  const labelClassBase: string = getLabelClassByContext(context)

  return ({ item, props: slotProps, hasSubmenu }: TieredMenuItemSlotProps) => {
    const action = slotProps.action

    const actionClassStr: string = typeof action?.class === 'string' ? action.class : ''

    const isFocused: boolean =
      actionClassStr.includes('p-focus') ||
      actionClassStr.includes('p-active') ||
      actionClassStr.includes('p-highlight') ||
      /p-tieredmenu[^"'\s]*(active|focus)/.test(actionClassStr)

    const distance: number = getDistance(item)

    const stateClasses: string = getMenuStateClasses({
      context,
      distance,
      isFocused,
      level: context === 'sidebar' ? undefined : 0,
      inactiveRootClass: inactiveClasses?.root,
      inactiveChildClass: inactiveClasses?.child,
    })

    /** 铺满 PrimeVue `.p-tieredmenu-item-content`，避免首次点击落在空白处只触发外层 div、不触发本链接 */
    const mergedClass: string = [
      getMenuItemBase(context),
      'w-full min-w-0 flex-1 self-stretch relative z-content',
      stateClasses,
      MENU_POPUP_ITEM_CLASS,
      MENU_ADMIN_POPUP_ITEM_UNIFIED,
      actionClassStr,
    ]
      .filter(Boolean)
      .join(' ')
      .trim()

    const isActive: boolean = distance === 0
    const stateData = {
      'data-menu-state':
        distance === 0 ? 'active' : distance > 0 ? 'ancestor' : isFocused ? 'open' : 'idle',
    }
    const finalLabelClass: string =
      emphasizeActiveLabel && isActive ? `${labelClassBase} font-bold` : labelClassBase

    const runItemAction = (ev: Event): void => {
      if (onItemClick) {
        onItemClick(item, ev, action)
        return
      }

      if (item.route?.name || item.route?.path) {
        ev.preventDefault()
        goToRoute(item.route.name ?? item.route.path, undefined, undefined, false)
      }

      if (typeof action?.onClick === 'function') {
        action.onClick(ev)
      }
    }

    /** 同一手势内 pointerdown 已导航时跳过后续 click，避免重复；若无 click（个别环境），用 queueMicrotask 复位 */
    let skipClickFromPointer = false

    const resetSkipFlag = (): void => {
      if (skipClickFromPointer) skipClickFromPointer = false
    }

    const handlePointerDown = (ev: PointerEvent): void => {
      if (ev.pointerType === 'mouse' && ev.button !== 0) return
      skipClickFromPointer = true
      runItemAction(ev)
    }

    const handlePointerUp = (): void => {
      queueMicrotask(resetSkipFlag)
    }

    const handlePointerCancel = (): void => {
      skipClickFromPointer = false
    }

    const handleClick = (ev: Event): void => {
      if (skipClickFromPointer) {
        skipClickFromPointer = false
        return
      }
      runItemAction(ev)
    }

    return (
      <a
        {...action}
        {...stateData}
        class={mergedClass}
        onPointerdown={handlePointerDown}
        onPointerup={handlePointerUp}
        onPointercancel={handlePointerCancel}
        onClick={handleClick}
      >
        {item.icon && (
          <Icons
            name={item.icon}
            size={getIconSize(context)}
            class={`!text-current shrink-0 ${MENU_ICON_COMMON_CLASS}`}
          />
        )}
        <span class={finalLabelClass}>{item.label}</span>
        {hasSubmenu && (
          <Icons
            name="i-lucide-chevron-right"
            size={getIconSize(context)}
            class={`ml-auto !text-current shrink-0 ${MENU_ICON_COMMON_CLASS}`}
          />
        )}
      </a>
    )
  }
}
