import TieredMenu from 'primevue/tieredmenu'
import PanelMenu from 'primevue/panelmenu'
import Tooltip from 'primevue/tooltip'
import { withDirectives } from 'vue'
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
    const handleParentItemClick = (e: MouseEvent, _item: PrimeMenuModelItem) => {
      e.preventDefault()
    }

    const isActiveMenuItem = (item: PrimeMenuModelItem): boolean => {
      const activePath = getActiveMenuPath(route)
      return item.route?.path === activePath
    }

    const isParentOfActive = (item: PrimeMenuModelItem): boolean => {
      const parentPaths = Array.isArray(route.meta?.parentPaths)
        ? (route.meta?.parentPaths as string[])
        : []
      return parentPaths.includes(item.key)
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

    // --- PanelMenu 渲染器 (展开态) ---
    const renderPanelMenuItem = ({ item }: { item: PrimeMenuModelItem }) => {
      const isActive = isActiveMenuItem(item)
      const isParentActive = isParentOfActive(item)

      // 使用系统 padding 阶梯优化缩进逻辑
      const indentClass =
        item.level <= 0 ? 'pl-padding-md' : item.level === 1 ? 'pl-padding-xl' : 'pl-padding-2xl'

      const baseClasses =
        'flex items-center rounded-scale-md py-scale-sm pr-padding-sm no-underline clickable ' +
        indentClass

      const stateClasses = isActive
        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
        : isParentActive
          ? 'bg-sidebar-accent/25 text-sidebar-foreground font-medium' // Increased visibility for active parents
          : 'text-sidebar-foreground hover:bg-sidebar-accent/10 active:bg-sidebar-accent/20' // 统一交互态

      const content = (
        <span class="flex items-center gap-sm w-full">
          {item.icon ? (
            <Icons
              name={item.icon}
              size="md"
              class="shrink-0 text-sidebar-foreground/80"
            />
          ) : null}
          <span class="text-single-line-ellipsis flex-1">{item.label}</span>
          {!!item.items && item.items.length > 0 ? (
            <Icons
              name="i-lucide-chevron-down"
              size="lg" // 调整 toggle icon 大小
              class={
                'ml-auto text-sidebar-foreground/60 transition-transform duration-scale-md' +
                (layoutStore.getExpandedMenuKeys[item.key] ? ' rotate-180' : ' rotate-0')
              }
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
            class={linkClass}
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
        <a
          href="#"
          role="button"
          class={linkClass}
          onClick={(e: MouseEvent) => handleParentItemClick(e, item)}
        >
          {content}
        </a>
      )
    }

    // --- Collapsed Sidebar 逻辑 (每个菜单项独立的 TieredMenu 实例) ---
    // 使用 Map 存储每个菜单项的 TieredMenu ref
    const tieredMenuRefs = ref<Map<string, InstanceType<typeof TieredMenu>>>(new Map())

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
          // 切换当前菜单
          menuRef.toggle(e)
        }
      } else if (item.route?.path) {
        // 无子菜单，直接跳转
        goToRoute(item.route.name || item.route.path, undefined, undefined, false)
      }
    }

    // 收缩态 TieredMenu 弹出子菜单项：图标与文字同色，悬停/激活时一致，并支持当前路由高亮
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

      // 与展开态 PanelMenu 复用同一套「当前激活 / 父级激活」判定逻辑
      const isActive = isActiveMenuItem(item)
      const isParentActive = isParentOfActive(item)

      const stateClasses = isActive
        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
        : isParentActive
          ? 'bg-sidebar-accent/25 text-sidebar-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/10 active:bg-sidebar-accent/20'

      const actionClass = typeof action?.class === 'string' ? action.class : ''
      const mergedClass = [
        'flex items-center gap-sm w-full rounded-scale-md px-padding-sm py-padding-xs',
        stateClasses,
        actionClass,
      ]
        .join(' ')
        .trim()
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
          class={mergedClass}
          onClick={handleClick}
        >
          {item.icon && (
            <Icons
              name={item.icon}
              size="xs"
              class="shrink-0 text-current"
            />
          )}
          <span class="truncate flex-1 text-current">{item.label}</span>
          {hasSubmenu && (
            <Icons
              name="i-lucide-chevron-right"
              size="xs"
              class="text-current ml-auto"
            />
          )}
        </a>
      )
    }

    // 渲染收缩状态下的单个图标项（包含独立的 TieredMenu）
    const renderCollapsedItem = (item: PrimeMenuModelItem) => {
      const isActive = isActiveMenuItem(item)
      const isParentActive = isParentOfActive(item)

      const stateClasses = isActive
        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
        : isParentActive
          ? 'bg-sidebar-accent/25 text-sidebar-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/10'

      const hasChildren = item.items && item.items.length > 0

      // 使用 withDirectives 应用 PrimeVue Tooltip 指令
      const iconButton = (
        <div
          class={`flex items-center justify-center p-padding-sm rounded-scale-md cursor-pointer transition-colors duration-scale-md aspect-square w-[var(--spacing-xl)] h-[var(--spacing-xl)] ${stateClasses}`}
          onClick={e => onCollapsedItemClick(e, item)}
        >
          {item.icon ? (
            <Icons
              name={item.icon}
              size="lg"
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
              v-slots={{ item: renderTieredMenuItem }}
              pt={{
                root: { class: 'border border-sidebar-border rounded-scale-md' },
                menu: { class: 'bg-sidebar py-padding-xs rounded-scale-md' },
                menuitem: { class: 'rounded-scale-sm' },
                content: {
                  class:
                    'rounded-scale-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent/80 active:text-sidebar-accent-foreground',
                },
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
          {/* Header */}
          <div class="h-breadcrumbHeight flex items-center justify-center border-b border-sidebar-border shrink-0">
            {/* 收缩时只显示简单内容或空 */}
            {!props.sidebarCollapse && (
              <div class="fs-sm font-medium text-ellipsis px-padding-md">
                {t('layout.sidebar.title')}
              </div>
            )}
            {props.sidebarCollapse && (
              <div class="w-[var(--spacing-xl)] h-[var(--spacing-xl)] flex items-center justify-center font-bold text-primary bg-primary/10 rounded-scale-md">
                C
              </div>
            )}
          </div>

          {/* Menus：统一用 CScrollbar 包裹，符合 scrollbar 架构 */}
          <div class="flex-1 min-h-0 flex flex-col overflow-hidden">
            <CScrollbar class="flex-1 min-h-0 px-padding-sm">
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
                />
              ) : (
                // 收缩态：自定义图标列表 + 每个项目独立的 TieredMenu (Popup)
                <div class="flex flex-col gap-sm items-center">
                  {panelMenuModel.value.map(item => renderCollapsedItem(item))}
                </div>
              )}
            </CScrollbar>
          </div>
        </aside>
      )
    }
  },
})
