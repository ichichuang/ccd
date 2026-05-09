import PanelMenu from 'primevue/panelmenu'
import Tooltip from 'primevue/tooltip'
import type { ComponentPublicInstance, VNode, VNodeRef } from 'vue'
import { withDirectives } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Icons } from '@/components/Icons'
import {
  getAdminMenuTree,
  getAuthorizedMenuTree,
  getActiveDistance,
  goToRoute,
  menuItemToPrimeModel,
  type PrimeMenuModelItem,
} from '@/router/utils/helper'
import {
  MENU_FALLBACK_ICON,
  MENU_INACTIVE_TEXT,
  MENU_ITEM_GAP,
  MENU_TEXT_WEIGHT,
  MENU_PANEL_INDENT_ROOT,
  MENU_PANEL_INDENT_CHILD,
  MENU_TEXT_CLASS,
  MENU_ICON_COMMON_CLASS,
} from '@/constants/layout-menu'
import { getMenuItemBase, getMenuStateClasses, getIconSize } from '@/hooks/layout/useMenuVisuals'
import AdminMenuPopup, {
  isAdminMenuPopupExpose,
  type AdminMenuPopupExpose,
} from '@/layouts/components/admin/AdminMenuPopup'
import { useLayoutStore } from '@/stores/modules/system'
import { useUserStore } from '@/stores/modules/session'
import { useAppElementSize } from '@/hooks/modules/useAppElementSize'
import type { SidebarAnimationPhase } from '@/layouts/runtime/layoutRuntime'

/** Map/Record → Record，供 store 持久化 */
function toRecord(
  val: Map<string, boolean> | Record<string, boolean> | null | undefined
): Record<string, boolean> {
  if (!val) return {}
  if (val instanceof Map) return Object.fromEntries(val) as Record<string, boolean>
  return val
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

function resolveElementRef(el: Element | ComponentPublicInstance | null): HTMLElement | null {
  return el instanceof HTMLElement ? el : null
}

function resolveMenuLabel(label: PrimeMenuModelItem['label']): string {
  if (typeof label === 'string') return label
  if (typeof label === 'function') {
    const resolved = label()
    return typeof resolved === 'string' ? resolved : ''
  }
  return ''
}

export interface AdminSidebarMenuProps {
  sidebarCollapse: boolean
  sidebarVisualCollapse: boolean
  sidebarAnimating: boolean
  sidebarAnimationPhase: SidebarAnimationPhase
  density: 'regular' | 'compact'
}

export default defineComponent({
  name: 'AdminSidebarMenu',
  props: {
    sidebarCollapse: {
      type: Boolean,
      required: true,
    },
    sidebarVisualCollapse: {
      type: Boolean,
      default: false,
    },
    sidebarAnimating: {
      type: Boolean,
      default: false,
    },
    sidebarAnimationPhase: {
      type: String as PropType<SidebarAnimationPhase>,
      default: 'idle',
    },
    density: {
      type: String as PropType<'regular' | 'compact'>,
      default: 'regular',
    },
  },
  setup(props) {
    const { t } = useI18n()
    const route = useRoute()
    const layoutStore = useLayoutStore()
    const userStore = useUserStore()
    const userRoles = computed(() => userStore.getUserRoles || [])
    const userPermissions = computed(() => userStore.getUserPermissions || [])

    const panelMenuModel = computed(() => {
      const tree = getAdminMenuTree()
      const authorizedTree = getAuthorizedMenuTree(userRoles.value, userPermissions.value, tree)
      return authorizedTree.map(item => menuItemToPrimeModel(item, t))
    })

    const allowMultiple = computed(() => !layoutStore.sidebarUniqueOpened)
    const rootKeys = computed(() => panelMenuModel.value.map(item => item.key))
    const isCollapsedInteraction = computed(() => props.sidebarCollapse)
    const isMenuTextHidden = computed(
      () =>
        props.sidebarAnimationPhase === 'collapsing' ||
        (props.sidebarAnimationPhase === 'idle' && props.sidebarVisualCollapse)
    )
    const isInlineSubmenuSuppressed = computed(() => isCollapsedInteraction.value)
    const menuPhaseClass = computed(() => {
      if (props.sidebarAnimationPhase === 'collapsing') {
        return 'admin-sidebar-menu--collapsing'
      }
      if (props.sidebarAnimationPhase === 'expanding') {
        return 'admin-sidebar-menu--expanding'
      }
      return props.sidebarVisualCollapse
        ? 'admin-sidebar-menu--collapsed'
        : 'admin-sidebar-menu--expanded'
    })
    const panelExpandedKeys = computed<Record<string, boolean>>(() =>
      isInlineSubmenuSuppressed.value ? {} : layoutStore.getExpandedMenuKeys
    )
    const isCompactDensity = computed(() => props.density === 'compact')

    const onUpdateExpandedKeys = (val: Map<string, boolean> | Record<string, boolean>) => {
      if (isInlineSubmenuSuppressed.value) return

      let nextKeys = toRecord(val)

      if (!allowMultiple.value) {
        const roots = rootKeys.value.filter(
          (key): key is string => typeof key === 'string' && key.length > 0
        )
        const prevKeys = layoutStore.getExpandedMenuKeys
        const newlyExpandedRoot = roots.find(k => nextKeys[k] && !prevKeys[k])
        if (newlyExpandedRoot) {
          nextKeys = applyUniqueRoot(nextKeys, roots, newlyExpandedRoot)
        }
      }

      layoutStore.setExpandedMenuKeys(nextKeys)

      if (!isMenuTextHidden.value) {
        nextTick(() => {
          // 延迟到展开动画完成后再测量（动画 250ms + 缓冲），
          // 避免在 grid-template-rows 动画期间读取 scrollWidth/clientWidth 导致 layout thrashing
          scheduleMeasureTruncation(300)
        })
      }
    }

    const handleParentItemClick = (e: Event, _item: PrimeMenuModelItem) => {
      e.preventDefault()
    }

    const getActiveDistanceForItem = (item: PrimeMenuModelItem) => getActiveDistance(route, item)

    watch(
      () => route.fullPath,
      () => {
        const parentPaths = Array.isArray(route.meta?.parentPaths) ? route.meta.parentPaths : []
        if (!parentPaths.length) return
        let current = { ...(layoutStore.getExpandedMenuKeys || {}) }
        const roots = rootKeys.value.filter(
          (key): key is string => typeof key === 'string' && key.length > 0
        )
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

    const menuContainerRef = ref<HTMLElement | null>(null)
    const { width: menuContainerWidth } = useAppElementSize(menuContainerRef, undefined, {
      mode: 'throttle',
      delay: 100,
    })

    const truncatedKeys = shallowRef<Set<string>>(new Set())
    const menuLabelRefs = shallowRef<Map<string, HTMLElement>>(new Map())
    const isSidebarWidthAnimating = ref(false)

    const setMenuLabelRef = (key: string, el: HTMLElement | null) => {
      const map = menuLabelRefs.value
      if (el) {
        map.set(key, el)
      } else {
        map.delete(key)
      }
    }

    let measureTimeoutId: number | null = null
    let sidebarAnimationTimeoutId: number | null = null
    let fontsReadyHooked = false

    function scheduleMeasureTruncation(delayMs: number): void {
      if (isMenuTextHidden.value) return
      if (isSidebarWidthAnimating.value) return
      if (measureTimeoutId !== null) {
        window.clearTimeout(measureTimeoutId)
        measureTimeoutId = null
      }

      measureTimeoutId = window.setTimeout(() => {
        if (isMenuTextHidden.value) {
          measureTimeoutId = null
          return
        }
        measureTruncation()
        measureTimeoutId = null
      }, delayMs)
    }

    function measureTruncation(): void {
      if (isMenuTextHidden.value) return
      if (isSidebarWidthAnimating.value) return
      const next: Set<string> = new Set<string>()
      menuLabelRefs.value.forEach((node, key) => {
        if (!node.isConnected) return
        const isTruncated = node.scrollWidth > node.clientWidth + 1
        if (isTruncated) next.add(key)
      })

      const prev = truncatedKeys.value
      let changed = prev.size !== next.size
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

    watch(
      () => [panelMenuModel.value, menuContainerWidth.value],
      () => {
        if (isMenuTextHidden.value) return
        nextTick(() => {
          measureTruncation()
        })
        scheduleMeasureTruncation(350)
        if (!fontsReadyHooked) {
          fontsReadyHooked = true
          type DocWithFonts = Document & { fonts?: { ready?: Promise<unknown> } }
          const fontsReady = (document as DocWithFonts).fonts?.ready
          if (fontsReady) {
            fontsReady.then(() => {
              scheduleMeasureTruncation(0)
            })
          }
        }
      },
      { immediate: true }
    )

    watch(
      () => [
        props.sidebarCollapse,
        props.sidebarVisualCollapse,
        props.sidebarAnimating,
        props.sidebarAnimationPhase,
      ],
      ([collapsed]) => {
        isSidebarWidthAnimating.value = true
        if (sidebarAnimationTimeoutId !== null) {
          window.clearTimeout(sidebarAnimationTimeoutId)
          sidebarAnimationTimeoutId = null
        }
        sidebarAnimationTimeoutId = window.setTimeout(() => {
          isSidebarWidthAnimating.value = false
          sidebarAnimationTimeoutId = null
          if (!isMenuTextHidden.value) {
            scheduleMeasureTruncation(0)
          }
        }, 280)

        if (collapsed || isMenuTextHidden.value) {
          if (measureTimeoutId !== null) {
            window.clearTimeout(measureTimeoutId)
            measureTimeoutId = null
          }
          truncatedKeys.value = new Set<string>()
          return
        }
      }
    )

    onBeforeUnmount(() => {
      if (measureTimeoutId !== null) {
        window.clearTimeout(measureTimeoutId)
        measureTimeoutId = null
      }
      if (sidebarAnimationTimeoutId !== null) {
        window.clearTimeout(sidebarAnimationTimeoutId)
        sidebarAnimationTimeoutId = null
      }
    })

    const renderPanelMenuItem = ({ item }: { item: PrimeMenuModelItem }) => {
      const distance = getActiveDistanceForItem(item)
      const level = item.level ?? 0
      const indentClass = level <= 0 ? MENU_PANEL_INDENT_ROOT : MENU_PANEL_INDENT_CHILD
      const key = item.key
      if (typeof key !== 'string' || !key.length) {
        return null
      }
      const hasChildren = Array.isArray(item.items) && item.items.length > 0
      const isSubmenuOpen = hasChildren && layoutStore.getExpandedMenuKeys[key] === true
      const isRootItem = level <= 0
      const shouldUseCollapsedPopup = isCollapsedInteraction.value && isRootItem && hasChildren
      const baseClasses = [
        getMenuItemBase('sidebar'),
        'admin-sidebar-menu__item',
        isRootItem ? 'admin-sidebar-menu__item--root' : 'admin-sidebar-menu__item--child',
        'group w-full no-underline box-border overflow-hidden',
        MENU_TEXT_WEIGHT,
        isCompactDensity.value ? '' : indentClass,
      ]
        .filter(Boolean)
        .join(' ')
      const stateClasses = getMenuStateClasses({
        distance,
        isSubmenuOpen: shouldUseCollapsedPopup ? openDropdownKey.value === key : isSubmenuOpen,
        level,
      })
      const bindAnchorRef: VNodeRef | undefined =
        isRootItem && hasChildren
          ? el => setCollapsedAnchorRef(key, resolveElementRef(el))
          : undefined

      const labelNode = (
        <span
          ref={el => setMenuLabelRef(key, el instanceof HTMLElement ? el : null)}
          data-menu-label-key={key}
          class={`admin-sidebar-menu__label text-ellipsis-1 text-left! min-w-0 flex-1 text-current! ${MENU_TEXT_CLASS}`}
        >
          {item.label}
        </span>
      )

      const isTruncated = truncatedKeys.value.has(key)
      const tooltipLabel = resolveMenuLabel(item.label)
      const shouldShowCollapsedTooltip =
        isRootItem && props.sidebarVisualCollapse && props.sidebarAnimationPhase === 'idle'
      const shouldShowExpandedTruncatedTooltip = !isMenuTextHidden.value && isTruncated
      const withMenuTooltip = (node: VNode): VNode => {
        if (!tooltipLabel) return node
        if (!shouldShowCollapsedTooltip && !shouldShowExpandedTruncatedTooltip) return node
        return withDirectives(node, [[Tooltip, tooltipLabel, '', { right: true }]])
      }

      const content = (
        <span
          class={`admin-sidebar-menu__item-content flex items-center ${MENU_ITEM_GAP} w-full min-w-0 overflow-hidden text-current! ${MENU_TEXT_CLASS}`}
        >
          {item.icon ? (
            <Icons
              name={item.icon}
              size={getIconSize('sidebar')}
              class={`admin-sidebar-menu__icon text-current! shrink-0 ${MENU_ICON_COMMON_CLASS}`}
            />
          ) : (
            <Icons
              name={MENU_FALLBACK_ICON}
              size={getIconSize('sidebar')}
              class={`admin-sidebar-menu__icon admin-sidebar-menu__icon--fallback text-current! shrink-0 ${MENU_ICON_COMMON_CLASS}`}
              aria-hidden="true"
            />
          )}
          {labelNode}
          {hasChildren ? (
            <Icons
              name="i-lucide-chevron-down"
              size={getIconSize('sidebar')}
              class={`admin-sidebar-menu__arrow text-current! shrink-0 text-center flex-shrink-0 center ml-auto w-5 ${isSubmenuOpen ? 'rotate-180' : 'rotate-0'}`}
            />
          ) : null}
        </span>
      )

      const linkClass = `${baseClasses} ${stateClasses}`
      const onCollapsedRootClick = (e: MouseEvent): boolean => {
        if (!shouldUseCollapsedPopup) return false
        e.preventDefault()
        e.stopPropagation()
        onCollapsedItemClick(e, item)
        return true
      }

      if (item.route?.name) {
        const isExtLink = item.route.meta?.isLink === true
        const linkUrlRaw = item.route.meta?.linkUrl
        const extUrl = (typeof linkUrlRaw === 'string' ? linkUrlRaw : undefined) || item.route.path
        const routeName =
          typeof item.route.name === 'string' ? item.route.name : (item.route.path ?? '')

        return (
          <RouterLink
            to={{ name: item.route.name }}
            custom
            v-slots={{
              default: ({ href }: { href: string }) =>
                withMenuTooltip(
                  <a
                    href={isExtLink ? extUrl : href}
                    role="link"
                    ref={bindAnchorRef}
                    class={linkClass}
                    onClick={(e: MouseEvent) => {
                      if (onCollapsedRootClick(e)) return
                      e.preventDefault()
                      e.stopPropagation()
                      goToRoute(routeName, undefined, undefined, false)
                    }}
                  >
                    {content}
                  </a>
                ),
            }}
          />
        )
      }
      return withMenuTooltip(
        <div
          ref={bindAnchorRef}
          class={linkClass}
          onClick={(e: MouseEvent) => {
            if (onCollapsedRootClick(e)) return
            handleParentItemClick(e, item)
          }}
        >
          {content}
        </div>
      )
    }

    const tieredMenuRefs = ref<Map<string, AdminMenuPopupExpose>>(new Map())
    const collapsedAnchorRefs = ref<Map<string, HTMLElement>>(new Map())
    const openDropdownKey = ref<string | null>(null)

    const setMenuRef = (key: string, el: unknown) => {
      if (isAdminMenuPopupExpose(el)) {
        tieredMenuRefs.value.set(key, el)
      } else {
        tieredMenuRefs.value.delete(key)
      }
    }

    const setCollapsedAnchorRef = (key: string, el: HTMLElement | null) => {
      if (el) {
        collapsedAnchorRefs.value.set(key, el)
      } else {
        collapsedAnchorRefs.value.delete(key)
      }
    }

    const onCollapsedItemClick = (_e: MouseEvent, item: PrimeMenuModelItem) => {
      const key = item.key
      if (typeof key !== 'string' || !key.length) {
        return
      }
      const hasChildren = Array.isArray(item.items) && item.items.length > 0

      if (hasChildren) {
        const menuRef = tieredMenuRefs.value.get(key)
        const anchorEl = collapsedAnchorRefs.value.get(key)
        if (menuRef && anchorEl) {
          tieredMenuRefs.value.forEach((ref, key) => {
            if (key !== item.key && ref) ref.hide()
          })

          const wasOpen = openDropdownKey.value === key
          const rect = anchorEl.getBoundingClientRect()
          const syntheticEvent: Event = new MouseEvent('click', {
            clientX: rect.left,
            clientY: rect.top,
            button: 0,
          })
          Object.defineProperty(syntheticEvent, 'currentTarget', {
            value: anchorEl,
            writable: false,
          })
          Object.defineProperty(syntheticEvent, 'target', { value: anchorEl, writable: false })
          menuRef.toggle(syntheticEvent, anchorEl)
          openDropdownKey.value = wasOpen ? null : key
        }
      } else if (item.route?.path) {
        goToRoute(item.route.name || item.route.path, undefined, undefined, false)
      }
    }

    const renderCollapsedPopup = (item: PrimeMenuModelItem) => {
      const key = item.key
      if (typeof key !== 'string' || !key.length) {
        return null
      }
      const hasChildren = Array.isArray(item.items) && item.items.length > 0
      if (!hasChildren) return null

      return (
        <AdminMenuPopup
          key={key}
          ref={(el: unknown) => setMenuRef(key, el)}
          model={item.items}
          placement="right-start"
          getDistance={(child: PrimeMenuModelItem): number => getActiveDistanceForItem(child)}
          inactiveClasses={{
            root: MENU_INACTIVE_TEXT,
            child: MENU_INACTIVE_TEXT,
          }}
          {...{
            onHide: () => {
              openDropdownKey.value = null
            },
          }}
        />
      )
    }

    watch(
      () => [props.sidebarCollapse, props.sidebarVisualCollapse] as const,
      ([actualCollapsed, visualCollapsed]) => {
        if (actualCollapsed && visualCollapsed) return
        tieredMenuRefs.value.forEach(ref => {
          ref?.hide()
        })
        openDropdownKey.value = null
      }
    )

    watch(isCollapsedInteraction, collapsed => {
      if (collapsed) {
        return
      }
      tieredMenuRefs.value.forEach(ref => {
        ref?.hide()
      })
      openDropdownKey.value = null
    })

    return () => {
      const panelMenuBind: Record<string, unknown> = {
        expandedKeys: panelExpandedKeys.value,
        ['onUpdate:expandedKeys']: onUpdateExpandedKeys,
      }
      return (
        <div
          ref={menuContainerRef}
          class={[
            'admin-sidebar-menu w-full overflow-hidden',
            isCompactDensity.value ? 'admin-sidebar-menu--compact pt-0' : 'pt-xs',
            menuPhaseClass.value,
          ]}
        >
          <PanelMenu
            model={panelMenuModel.value}
            multiple={allowMultiple.value}
            {...panelMenuBind}
            class={`admin-sidebar-panelmenu w-full ${MENU_TEXT_CLASS}`}
            pt={{
              item: {
                class: 'mb-xs last:mb-0',
              },
              headerContent: {
                class: 'bg-transparent!',
              },
              submenu: {
                class: 'mt-xs',
              },
            }}
            v-slots={{
              item: renderPanelMenuItem,
            }}
          />
          {panelMenuModel.value.map(item => renderCollapsedPopup(item))}
        </div>
      )
    }
  },
})
