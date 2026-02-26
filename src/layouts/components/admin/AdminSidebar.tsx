import TieredMenu from 'primevue/tieredmenu'
import PanelMenu from 'primevue/panelmenu'
import Tooltip from 'primevue/tooltip'
import { shallowRef, watch, withDirectives } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Icons } from '@/components/Icons'
import {
  getAdminMenuTree,
  getAuthorizedMenuTree,
  getActiveMenuPath,
  goToRoute,
  menuItemToPrimeModel,
  type PrimeMenuModelItem,
} from '@/router/utils/helper'
import { useLayoutStore } from '@/stores/modules/layout'
import { useUserStore } from '@/stores/modules/user'
import { useAppElementSize } from '@/hooks/modules/useAppElementSize'

/** Record → Map，供 PrimeVue PanelMenu 使用 */

/** Map/Record → Record，供 store 持久化 */
function toRecord(
  val: Map<string, boolean> | Record<string, boolean> | null | undefined
): Record<string, boolean> {
  if (!val) return {}
  if (val instanceof Map) return Object.fromEntries(val)
  return val as Record<string, boolean>
}

/** 根级互斥：只保留指定根及其子路径展开，其余根级收起 */
function applyUniqueRoot(
  nextKeys: Record<string, boolean>,
  rootKeys: string[],
  expandedRootKey: string
): Record<string, boolean> {
  const result = { ...nextKeys }
  for (const root of rootKeys) {
    if (root !== expandedRootKey) result[root] = false
  }
  return result
}

export interface AdminSidebarProps {
  mode: AdminLayoutMode
  showSidebar: boolean
  sidebarCollapse: boolean
  sidebarFixed: boolean
  sidebarWidthClass: string
}

export default defineComponent({
  name: 'AdminSidebar',
  props: {
    mode: {
      type: String as PropType<AdminLayoutMode>,
      required: true,
    },
    showSidebar: {
      type: Boolean,
      required: true,
    },
    sidebarCollapse: {
      type: Boolean,
      required: true,
    },
    sidebarFixed: {
      type: Boolean,
      required: true,
    },
    sidebarWidthClass: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n()
    const route = useRoute()
    const layoutStore = useLayoutStore()
    const userStore = useUserStore()

    const isHorizontal = computed(() => props.mode === 'horizontal')
    const userRoles = computed(() => userStore.getUserRoles || [])

    const panelMenuModel = computed(() => {
      const tree = getAdminMenuTree()
      const authorizedTree = getAuthorizedMenuTree(userRoles.value, tree)
      return authorizedTree.map(item => menuItemToPrimeModel(item, t))
    })

    const allowMultiple = computed(() => !layoutStore.sidebarUniqueOpened)

    const rootKeys = computed(() => panelMenuModel.value.map(item => item.key))

    const onUpdateExpandedKeys = (val: Map<string, boolean> | Record<string, boolean>) => {
      let nextKeys = toRecord(val)

      // sidebarUniqueOpened：根级互斥，仅保留用户点击展开的根级
      if (!allowMultiple.value) {
        const roots = rootKeys.value
        const prevKeys = layoutStore.getExpandedMenuKeys
        const newlyExpandedRoot = roots.find(k => nextKeys[k] && !prevKeys[k])
        if (newlyExpandedRoot) {
          nextKeys = applyUniqueRoot(nextKeys, roots, newlyExpandedRoot)
        }
      }

      layoutStore.setExpandedMenuKeys(nextKeys)
    }

    /** 父级菜单点击时手动切换展开，避免自定义 slot 的 preventDefault 阻断 PanelMenu 的 toggle */
    const handleParentItemClick = (e: Event, _item: PrimeMenuModelItem) => {
      e.preventDefault()
    }

    /** 计算当前项到激活叶子节点的距离：0=激活项, 1=直接父级, 2=祖父级... -1=未激活 */
    const getActiveDistance = (item: PrimeMenuModelItem): number => {
      const activePath = getActiveMenuPath(route)
      if (item.route?.path === activePath) return 0

      const parentPaths = Array.isArray(route.meta?.parentPaths)
        ? (route.meta?.parentPaths as string[])
        : []
      const idx = parentPaths.indexOf(item.key)
      if (idx !== -1) {
        // parentPaths 顺序为 [root, subRoot, ...parent]
        return parentPaths.length - idx
      }
      return -1
    }

    // 根据当前路由的 parentPaths 自动展开父级菜单（对齐老项目行为）
    watch(
      () => route.fullPath,
      () => {
        const parentPaths = Array.isArray(route.meta?.parentPaths) ? route.meta.parentPaths : []
        if (!parentPaths.length) return
        let current = { ...(layoutStore.getExpandedMenuKeys || {}) }
        const roots = rootKeys.value
        let updated = false
        parentPaths.filter(Boolean).forEach((p: string) => {
          if (!current[p]) {
            current[p] = true
            updated = true
            if (!allowMultiple.value && roots.includes(p)) {
              current = applyUniqueRoot(current, roots, p)
            }
          }
        })
        if (updated) layoutStore.setExpandedMenuKeys(current)
      },
      { immediate: true }
    )

    // --- 菜单容器宽度（用于精确限制路由项标题宽度，避免超出侧栏）---
    const menuContainerRef = ref<HTMLElement | null>(null)
    const { width: menuContainerWidth } = useAppElementSize(menuContainerRef, undefined, {
      mode: 'throttle',
      delay: 100,
    })

    // [style] This inline labelMaxWidthStyle exists because UnoCSS cannot dynamically express
    // a calculated runtime pixel width (`calc([dynamic_px] - var(--spacing-4xl))`).
    const labelMaxWidthStyle = computed<Record<string, string>>(() => {
      const w: number = menuContainerWidth.value
      // 初始阶段或测不到宽度时，退化为 100%（不会超过容器）
      if (!w || w <= 0) {
        const style: Record<string, string> = { maxWidth: '100%' }
        return style
      }
      // 预留一部分空间给左侧图标、右侧箭头以及内边距和间距（使用 spacing 变量，避免硬编码 px）
      const style: Record<string, string> = {
        maxWidth: `calc(${w}px - var(--spacing-4xl))`,
      }
      return style
    })

    // 仅记录“真正被省略”的菜单 key，用于控制是否挂 Tooltip
    const truncatedKeys = shallowRef<Set<string>>(new Set())

    function measureTruncation(): void {
      const container: HTMLElement | null = menuContainerRef.value
      if (!container) return

      const nodeList: NodeListOf<HTMLElement> =
        container.querySelectorAll<HTMLElement>('[data-menu-label-key]')

      const next: Set<string> = new Set<string>()
      nodeList.forEach(node => {
        const key: string | undefined = node.dataset.menuLabelKey
        if (!key) return
        const isTruncated: boolean = node.scrollWidth > node.clientWidth + 1
        if (isTruncated) {
          next.add(key)
        }
      })

      const prev: Set<string> = truncatedKeys.value
      let changed: boolean = prev.size !== next.size
      if (!changed) {
        for (const key of next) {
          if (!prev.has(key)) {
            changed = true
            break
          }
        }
      }
      if (!changed) return

      truncatedKeys.value = next
    }

    // 菜单数据或容器宽度变化时，统一测量一次溢出情况
    watch(
      () => [panelMenuModel.value, menuContainerWidth.value],
      () => {
        nextTick(() => {
          measureTruncation()
        })
      },
      { immediate: true }
    )

    // --- PanelMenu 渲染器 (展开态) ---
    const renderPanelMenuItem = ({ item }: { item: PrimeMenuModelItem }) => {
      const distance = getActiveDistance(item)

      // 使用系统 padding 阶梯优化缩进逻辑
      const indentClass = item.level <= 0 ? 'pl-padding-md' : 'pl-padding-sm'

      const baseClasses =
        'group flex items-center w-full rounded-scale-md py-scale-sm pr-padding-sm no-underline ' +
        'transition-[background-color,color,opacity,transform] duration-scale-md ease-in-out ' +
        'focus:outline-none! border-none! bg-transparent active:ring-0! active:border-none! ' +
        'active:shadow-none! focus:shadow-none! active:outline-none! ' +
        indentClass

      const activeBgMapping: Record<number, string> = {
        0: 'bg-primary/90!',
        1: 'bg-primary/20!',
        2: 'bg-primary/10!',
        3: 'bg-primary/5!',
      }

      const stateClasses =
        distance >= 0
          ? `${activeBgMapping[distance] || 'bg-primary/5!'} ${distance === 0 ? 'text-primary-foreground! font-bold' : 'text-primary!'}`
          : 'text-sidebar-foreground hover:menu-item-hover'

      // 标题节点：单行省略 + 最小宽度约束 + 基于容器宽度的 maxWidth，确保绝不超出；
      // 使用 data-menu-label-key 供批量测量是否被省略。
      const labelNode = (
        <span
          data-menu-label-key={item.key}
          class="text-single-line-ellipsis text-left! flex-1 min-w-0"
          style={labelMaxWidthStyle.value}
        >
          {item.label}
        </span>
      )

      const isTruncated: boolean = truncatedKeys.value.has(item.key)
      const labelContent = isTruncated
        ? withDirectives(labelNode, [[Tooltip, item.label, '', { right: true }]])
        : labelNode

      const content = (
        <span class="flex items-center justify-start gap-sm w-full min-w-0 overflow-hidden">
          {item.icon ? (
            <Icons
              name={item.icon}
              size="md"
              class={`shrink-0 transition-colors duration-scale-md ${distance === 0 ? 'text-primary-foreground!' : distance > 0 ? 'text-primary!' : 'text-sidebar-foreground/80! group-hover:text-primary!'}`}
            />
          ) : null}
          {labelContent}
          {!!item.items && item.items.length > 0 ? (
            <Icons
              name="i-lucide-chevron-down"
              size="sm" // 调整 toggle icon 大小
              class={`ml-auto shrink-0 transition-transform duration-scale-md ${distance === 0 ? 'text-primary-foreground!' : distance > 0 ? 'text-primary!' : 'text-sidebar-foreground/60! group-hover:text-primary!'} ${
                layoutStore.getExpandedMenuKeys[item.key] ? 'rotate-180' : 'rotate-0'
              }`}
            />
          ) : null}
        </span>
      )

      const linkClass = `${baseClasses} ${stateClasses}`

      if (item.route?.path) {
        return (
          <a
            href={item.route.path}
            role="link"
            class={[linkClass, 'outline-none! shadow-none!'].join(' ')}
            onClick={(e: MouseEvent) => {
              e.preventDefault()
              e.stopPropagation()
              goToRoute(item.route?.name ?? item.route?.path, undefined, undefined, false)
            }}
          >
            {content}
          </a>
        )
      }
      return (
        <button
          type="button"
          class={[linkClass, 'outline-none! shadow-none!'].join(' ')}
          onClick={(e: Event) => handleParentItemClick(e, item)}
        >
          {content}
        </button>
      )
    }

    // --- Collapsed Sidebar 逻辑 (每个菜单项独立的 TieredMenu 实例) ---
    // 使用 Map 存储每个菜单项的 TieredMenu ref
    const tieredMenuRefs = ref<Map<string, InstanceType<typeof TieredMenu>>>(new Map())
    /** 当前打开的 TieredMenu 对应父级 key，用于子菜单打开时弱化父级高亮，避免与悬停子项同色 */
    const openDropdownKey = ref<string | null>(null)

    // 设置菜单 ref 的回调
    const setMenuRef = (key: string, el: InstanceType<typeof TieredMenu> | null) => {
      if (el) {
        tieredMenuRefs.value.set(key, el)
      } else {
        tieredMenuRefs.value.delete(key)
      }
    }

    // 处理收缩状态下的点击
    const onCollapsedItemClick = (e: MouseEvent, item: PrimeMenuModelItem) => {
      if (item.items && item.items.length > 0) {
        // 如果有子菜单，切换对应的 TieredMenu
        const menuRef = tieredMenuRefs.value.get(item.key)
        if (menuRef) {
          // 先关闭其他打开的菜单
          tieredMenuRefs.value.forEach((ref, key) => {
            if (key !== item.key && ref) {
              ref.hide()
            }
          })
          // 切换当前菜单：toggle 会翻转打开状态，据此更新 openDropdownKey
          const wasOpen = openDropdownKey.value === item.key
          menuRef.toggle(e)
          openDropdownKey.value = wasOpen ? null : item.key
        }
      } else if (item.route?.path) {
        // 无子菜单，直接跳转
        goToRoute(item.route.name || item.route.path, undefined, undefined, false)
      }
    }

    // 收缩态 TieredMenu 弹出子菜单项：与 AdminHeader 样式统一（accent/accent-light）
    const renderTieredMenuItem = ({
      item,
      props: slotProps,
      hasSubmenu,
    }: {
      item: PrimeMenuModelItem
      props: { action: Record<string, unknown> }
      hasSubmenu: boolean
    }) => {
      const action = slotProps.action as Record<string, unknown> & {
        class?: string
        onClick?: (e: Event) => void
      }

      const distance = getActiveDistance(item)
      // PT 在子菜单悬停/展开时会给 action.class 添加 focus/active，需据此高亮（与 AdminHeader 一致）
      const actionClassStr = typeof action?.class === 'string' ? action.class : ''
      const isFocused =
        actionClassStr.includes('p-focus') ||
        actionClassStr.includes('p-active') ||
        actionClassStr.includes('p-highlight') ||
        /p-tieredmenu[^"'\s]*(active|focus)/.test(actionClassStr)

      // 与 AdminHeader subClasses 统一
      const activeBgMapping: Record<number, string> = {
        0: 'bg-primary/90!',
        1: 'bg-primary/20!',
        2: 'bg-primary/10!',
        3: 'bg-primary/5!',
      }

      const stateClasses =
        distance >= 0
          ? `${activeBgMapping[distance] || 'bg-primary/5!'} ${distance === 0 ? 'text-primary-foreground! font-bold' : 'text-primary!'}`
          : isFocused
            ? 'menu-item-hover'
            : 'text-foreground! hover:menu-item-hover'

      const baseClass =
        'group flex items-center gap-sm w-full rounded-scale-md px-padding-md py-padding-sm fs-sm ' +
        'transition-[background-color,color,opacity,transform] duration-scale-md ease-in-out select-none ' +
        'focus:outline-none! border-none! bg-transparent active:ring-0! active:border-none! ' +
        'active:shadow-none! focus:shadow-none! active:outline-none!'
      const mergedClass = [baseClass, stateClasses, actionClassStr].filter(Boolean).join(' ').trim()

      // 图标颜色与 AdminHeader 一致
      const iconColorClass =
        distance >= 0
          ? distance === 0
            ? 'text-primary-foreground! opacity-100!'
            : 'text-primary! opacity-100!'
          : isFocused
            ? 'text-primary! opacity-100!'
            : 'text-muted-foreground! opacity-80 transition-colors transition-opacity duration-scale-md group-hover:text-primary! group-hover:opacity-100'

      const handleClick = (e: Event) => {
        if (item.route?.path) {
          e.preventDefault()
          goToRoute(item.route?.name ?? item.route.path, undefined, undefined, false)
        }
        if (typeof action?.onClick === 'function') action.onClick(e)
      }
      return (
        <a
          {...action}
          class={[mergedClass, 'outline-none! shadow-none!'].join(' ')}
          onClick={handleClick}
        >
          {item.icon && (
            <Icons
              name={item.icon}
              size="sm"
              class={`shrink-0 text-current! ${iconColorClass}`}
            />
          )}
          <span class="truncate flex-1">{item.label}</span>
          {hasSubmenu && (
            <Icons
              name="i-lucide-chevron-right"
              size="sm"
              class={`ml-auto shrink-0 transition-transform duration-scale-md ${iconColorClass.replace('opacity-80', 'opacity-50')}`}
            />
          )}
        </a>
      )
    }

    // 渲染收缩状态下的单个图标项（包含独立的 TieredMenu）
    const renderCollapsedItem = (item: PrimeMenuModelItem) => {
      const distance = getActiveDistance(item)
      const isSubmenuOpen = openDropdownKey.value === item.key

      const activeBgMapping: Record<number, string> = {
        0: 'bg-primary/90!',
        1: 'bg-primary/20!',
        2: 'bg-primary/10!',
        3: 'bg-primary/5!',
      }

      const stateClasses =
        distance >= 0
          ? `${activeBgMapping[distance] || 'bg-primary/5!'} ${distance === 0 ? 'text-primary-foreground! font-bold' : 'text-primary!'}`
          : isSubmenuOpen
            ? 'bg-primary/50 text-primary'
            : 'text-sidebar-foreground hover:menu-item-hover'

      const hasChildren = item.items && item.items.length > 0

      // 使用 withDirectives 应用 PrimeVue Tooltip 指令
      const iconButton = (
        <div
          class={`flex items-center justify-center p-padding-sm rounded-scale-md cursor-pointer transition-[background-color,color,opacity,transform] duration-scale-md aspect-square w-[var(--spacing-xl)] h-[var(--spacing-xl)] focus:outline-none! border-none! active:ring-0! active:border-none! active:shadow-none! focus:shadow-none! active:outline-none! ${stateClasses}`}
          onClick={e => onCollapsedItemClick(e, item)}
        >
          {item.icon ? (
            <Icons
              name={item.icon}
              size="lg"
              class={
                distance === 0
                  ? 'text-primary-foreground!'
                  : distance > 0 || isSubmenuOpen
                    ? 'text-primary!'
                    : 'text-sidebar-foreground/80!'
              }
            />
          ) : (
            <div class="w-[var(--spacing-lg)] h-[var(--spacing-lg)] rounded-full bg-card text-card-foreground flex items-center justify-center fs-xs font-bold">
              {item.label.substring(0, 1)}
            </div>
          )}
        </div>
      )

      // 应用 tooltip 指令，显示在右侧
      const iconWithTooltip = withDirectives(iconButton, [
        [Tooltip, item.label, '', { right: true }],
      ])

      return (
        <div
          key={item.key}
          class="relative"
        >
          {iconWithTooltip}
          {/* 每个有子菜单的项都有独立的 TieredMenu 实例 */}
          {hasChildren && (
            <TieredMenu
              ref={(el: unknown) =>
                setMenuRef(item.key, el as InstanceType<typeof TieredMenu> | null)
              }
              model={item.items}
              popup
              appendTo="body"
              {...{
                onHide: () => {
                  openDropdownKey.value = null
                },
              }}
              v-slots={{ item: renderTieredMenuItem }}
              pt={{
                root: {
                  class:
                    'border border-border rounded-scale-md shadow-md outline-none! box-shadow-none!',
                },
                menu: { class: 'bg-card py-padding-xs rounded-scale-md outline-none!' },
                menuitem: { class: 'bg-transparent border-none rounded-scale-sm outline-none!' },
                content: {
                  class:
                    'bg-transparent! border-none rounded-scale-md outline-none! box-shadow-none!',
                },
                action: { class: 'outline-none! shadow-none!' },
              }}
            />
          )}
        </div>
      )
    }

    return () => {
      if (!props.showSidebar || isHorizontal.value) return null

      return (
        <aside
          class={[
            props.sidebarWidthClass,
            props.sidebarFixed ? 'admin-sidebar--fixed' : '',
            layoutStore.enableTransition ? 'sidebar-width-transition' : '',
            props.sidebarCollapse ? 'gap-md' : '',
            'overflow-hidden flex flex-col select-none', // 增加 flex col
          ]}
        >
          {/* Menus：统一用 CScrollbar 包裹，符合 scrollbar 架构 */}
          <div class="flex-1 min-h-0 flex flex-col overflow-hidden">
            <CScrollbar class="flex-1 min-h-0 px-padding-sm">
              <div
                ref={menuContainerRef}
                class="w-full overflow-hidden"
              >
                {!props.sidebarCollapse ? (
                  // 展开态：PanelMenu
                  <PanelMenu
                    model={panelMenuModel.value}
                    multiple={allowMultiple.value}
                    {...({
                      expandedKeys: layoutStore.getExpandedMenuKeys,
                      ['onUpdate:expandedKeys']: onUpdateExpandedKeys,
                    } as Record<string, unknown>)}
                    class="w-full fs-sm"
                    v-slots={{
                      item: renderPanelMenuItem,
                    }}
                    pt={{
                      root: { class: 'gap-xs outline-none!' },
                      panel: { class: 'bg-transparent border-none outline-none!' },
                      header: { class: 'bg-transparent border-none outline-none!' },
                      headerContent: {
                        class: 'bg-transparent! border-none outline-none! box-shadow-none!',
                      },
                      content: { class: 'bg-transparent border-none py-0 px-0 outline-none!' },
                      menu: { class: 'gap-xs bg-transparent p-0 m-0 list-none outline-none!' },
                      menuitem: { class: 'bg-transparent border-none outline-none!' },
                    }}
                  />
                ) : (
                  // 收缩态：自定义图标列表 + 每个项目独立的 TieredMenu (Popup)
                  <div class="flex flex-col gap-sm items-center">
                    {panelMenuModel.value.map(item => renderCollapsedItem(item))}
                  </div>
                )}
              </div>
            </CScrollbar>
          </div>
        </aside>
      )
    }
  },
})
