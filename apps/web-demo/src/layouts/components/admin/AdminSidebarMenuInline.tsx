import { applyUniqueRoot, toRecord } from '@ccd/shared-utils'
import PanelMenu from 'primevue/panelmenu'
import Tooltip from 'primevue/tooltip'
import type { PropType, VNode } from 'vue'
import { withDirectives } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useTimeoutFn } from '@vueuse/core'
import { Icons } from '@ccd/vue-ui'
import { getActiveDistance, goToRoute, type PrimeMenuModelItem } from '@/router/utils/helper'
import {
  MENU_FALLBACK_ICON,
  MENU_ICON_COMMON_CLASS,
  MENU_ITEM_GAP,
  MENU_PANEL_INDENT_CHILD,
  MENU_PANEL_INDENT_ROOT,
  MENU_TEXT_CLASS,
  MENU_TEXT_WEIGHT,
} from '@/constants/layout-menu'
import { getIconSize, getMenuItemBase, getMenuStateClasses } from '@/hooks/layout/useMenuVisuals'
import { useLayoutStore } from '@/stores/modules/system'
import { useAppElementSize } from '@ccd/vue-hooks'
import {
  resolveMenuLabel,
  type SidebarMenuDensity,
} from '@/layouts/components/admin/adminSidebarMenu.shared'
import type { SidebarState } from '@/layouts/runtime/layoutRuntime'

const COLLAPSING_SUBMENU_VISUAL_HOLD_MS = 240

interface PanelMenuItemSlot {
  item: PrimeMenuModelItem
  active?: boolean
  props?: {
    action?: {
      class?: unknown
    }
  }
}

interface SidebarRouterLinkSlotProps {
  href: string
  navigate: (event?: MouseEvent) => Promise<void>
  isActive: boolean
  isExactActive: boolean
}

interface SidebarPanelVisualState {
  distance: number
  isSubmenuVisuallyOpen: boolean
  routeActive: boolean
  routeExactActive: boolean
  menuState: 'active' | 'ancestor' | 'open' | 'idle'
}

interface PanelMenuPtOptionsLike {
  context?: {
    item?: PrimeMenuModelItem
    active?: boolean
  }
  item?: PrimeMenuModelItem
  active?: boolean
}

export default defineComponent({
  name: 'AdminSidebarMenuInline',
  props: {
    model: {
      type: Array as PropType<PrimeMenuModelItem[]>,
      default: () => [],
    },
    allowMultiple: {
      type: Boolean,
      required: true,
    },
    rootKeys: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    density: {
      type: String as PropType<SidebarMenuDensity>,
      default: 'regular',
    },
    sidebarState: {
      type: String as PropType<SidebarState>,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute()
    const layoutStore = useLayoutStore()
    const isCompactDensity = computed(() => props.density === 'compact')
    const menuContainerRef = ref<HTMLElement | null>(null)
    const { width: menuContainerWidth } = useAppElementSize(menuContainerRef, undefined, {
      mode: 'throttle',
      delay: 100,
    })
    const truncatedKeys = shallowRef<Set<string>>(new Set())
    const collapsingVisualKeys = shallowRef<Set<string>>(new Set())
    const menuLabelRefs = shallowRef<Map<string, HTMLElement>>(new Map())
    let fontsReadyHooked = false
    const shouldMeasureTruncation = computed(() => !isCompactDensity.value)
    const measureDelayMs = ref(0)
    const { start: startMeasureTimer, stop: stopMeasureTimer } = useTimeoutFn(
      () => {
        measureTruncation()
      },
      measureDelayMs,
      { immediate: false }
    )
    const { start: startCollapseVisualTimer, stop: stopCollapseVisualTimer } = useTimeoutFn(
      () => {
        if (collapsingVisualKeys.value.size > 0) {
          collapsingVisualKeys.value = new Set()
        }
      },
      COLLAPSING_SUBMENU_VISUAL_HOLD_MS,
      { immediate: false }
    )
    const controlledExpandedKeys = computed<Record<string, boolean>>(() =>
      props.sidebarState === 'expanded' || props.sidebarState === 'expanded-shell'
        ? layoutStore.getExpandedMenuKeys
        : {}
    )

    const setMenuLabelRef = (key: string, el: HTMLElement | null) => {
      if (!shouldMeasureTruncation.value) return
      const map = menuLabelRefs.value
      if (el) {
        map.set(key, el)
      } else {
        map.delete(key)
      }
    }

    const measureTruncation = (): void => {
      if (!shouldMeasureTruncation.value) {
        if (truncatedKeys.value.size > 0) truncatedKeys.value = new Set()
        return
      }

      const next = new Set<string>()
      menuLabelRefs.value.forEach((node, key) => {
        if (!node.isConnected) return
        if (node.scrollWidth > node.clientWidth + 1) {
          next.add(key)
        }
      })

      if (next.size === truncatedKeys.value.size) {
        let changed = false
        next.forEach(key => {
          if (!truncatedKeys.value.has(key)) changed = true
        })
        if (!changed) return
      }

      truncatedKeys.value = next
    }

    const scheduleMeasureTruncation = (delayMs: number): void => {
      if (!shouldMeasureTruncation.value) return

      stopMeasureTimer()
      measureDelayMs.value = delayMs
      startMeasureTimer()
    }

    const retainCollapsingVisualKeys = (
      prevKeys: Record<string, boolean>,
      nextKeys: Record<string, boolean>
    ): void => {
      const nextVisualKeys = new Set(collapsingVisualKeys.value)
      let hasNewCollapsingKey = false

      Object.keys(nextKeys).forEach(key => {
        if (!nextKeys[key]) return
        nextVisualKeys.delete(key)
      })

      Object.keys(prevKeys).forEach(key => {
        if (!prevKeys[key] || nextKeys[key]) return
        nextVisualKeys.add(key)
        hasNewCollapsingKey = true
      })

      collapsingVisualKeys.value = nextVisualKeys
      if (nextVisualKeys.size === 0) {
        stopCollapseVisualTimer()
      } else if (hasNewCollapsingKey) {
        stopCollapseVisualTimer()
        startCollapseVisualTimer()
      }
    }

    watch(
      () => [props.model, menuContainerWidth.value],
      () => {
        if (!shouldMeasureTruncation.value) return

        nextTick(() => {
          measureTruncation()
        })
        scheduleMeasureTruncation(200)
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

    onBeforeUnmount(() => {
      stopMeasureTimer()
      stopCollapseVisualTimer()
    })

    const onUpdateExpandedKeys = (val: Map<string, boolean> | Record<string, boolean>) => {
      let nextKeys = toRecord(val)
      const prevKeys = layoutStore.getExpandedMenuKeys

      if (!props.allowMultiple) {
        const newlyExpandedRoot = props.rootKeys.find(key => nextKeys[key] && !prevKeys[key])
        if (newlyExpandedRoot) {
          nextKeys = applyUniqueRoot(nextKeys, props.rootKeys, newlyExpandedRoot)
        }
      }

      retainCollapsingVisualKeys(prevKeys, nextKeys)
      layoutStore.setExpandedMenuKeys(nextKeys)
      nextTick(() => {
        scheduleMeasureTruncation(220)
      })
    }

    const resolvePanelVisualState = (
      item: PrimeMenuModelItem,
      active?: boolean
    ): SidebarPanelVisualState => {
      const distance = getActiveDistance(route, item)
      const key = item.key
      const hasChildren = Array.isArray(item.items) && item.items.length > 0
      const isSubmenuOpen =
        typeof key === 'string' &&
        hasChildren &&
        (active === true || controlledExpandedKeys.value[key] === true)
      const isSubmenuVisuallyOpen =
        typeof key === 'string' && hasChildren
          ? isSubmenuOpen || collapsingVisualKeys.value.has(key)
          : false
      const routeActive = distance >= 0
      const routeExactActive = distance === 0
      const menuState =
        distance === 0
          ? 'active'
          : distance > 0
            ? 'ancestor'
            : isSubmenuVisuallyOpen
              ? 'open'
              : 'idle'

      return {
        distance,
        isSubmenuVisuallyOpen,
        routeActive,
        routeExactActive,
        menuState,
      }
    }

    const buildPanelRowAttrs = (
      options?: PanelMenuPtOptionsLike
    ): Record<string, string | undefined> => {
      const item = options?.context?.item ?? options?.item
      const active = options?.context?.active ?? options?.active
      if (!item) return {}
      const level = item.level ?? 0
      const visualState = resolvePanelVisualState(item, active)
      const wrapperStateClass =
        visualState.menuState === 'idle'
          ? ''
          : getMenuStateClasses({
              context: 'sidebar',
              distance: visualState.distance,
              isSubmenuOpen: visualState.isSubmenuVisuallyOpen,
              level,
            })

      return {
        class: [
          'admin-sidebar-menu__visual-row',
          level <= 0
            ? 'admin-sidebar-menu__visual-row--root'
            : 'admin-sidebar-menu__visual-row--child',
          wrapperStateClass,
        ]
          .filter(Boolean)
          .join(' '),
        'data-menu-row-state': visualState.menuState,
        'data-route-active': visualState.routeActive ? 'true' : undefined,
        'data-route-exact-active': visualState.routeExactActive ? 'true' : undefined,
      }
    }

    const renderPanelMenuItem = ({ item, active, props: slotProps }: PanelMenuItemSlot) => {
      const level = item.level ?? 0
      const indentClass = level <= 0 ? MENU_PANEL_INDENT_ROOT : MENU_PANEL_INDENT_CHILD
      const key = item.key
      if (typeof key !== 'string' || !key.length) return null

      const hasChildren = Array.isArray(item.items) && item.items.length > 0
      const actionClass = slotProps?.action?.class
      const actionClassStr = typeof actionClass === 'string' ? actionClass : ''
      const isFocused =
        actionClassStr.includes('p-focus') ||
        actionClassStr.includes('p-active') ||
        actionClassStr.includes('p-highlight')
      const visualState = resolvePanelVisualState(item, active)
      const { distance, isSubmenuVisuallyOpen, routeActive, routeExactActive, menuState } =
        visualState
      const baseClasses = [
        getMenuItemBase('sidebar'),
        'admin-sidebar-menu__item',
        level <= 0 ? 'admin-sidebar-menu__item--root' : 'admin-sidebar-menu__item--child',
        'group w-full no-underline box-border overflow-hidden',
        MENU_TEXT_WEIGHT,
        isCompactDensity.value ? '' : indentClass,
      ]
        .filter(Boolean)
        .join(' ')
      const stateClasses = getMenuStateClasses({
        context: 'sidebar',
        distance,
        isFocused,
        isSubmenuOpen: isSubmenuVisuallyOpen,
        level,
      })

      const labelNode = (
        <span
          ref={el => setMenuLabelRef(key, el instanceof HTMLElement ? el : null)}
          data-menu-label-key={key}
          class={`admin-sidebar-menu__label text-ellipsis-1 text-left! min-w-0 flex-1 text-current! ${MENU_TEXT_CLASS}`}
        >
          {item.label}
        </span>
      )

      const tooltipLabel = resolveMenuLabel(item.label)
      const shouldShowTooltip =
        shouldMeasureTruncation.value && truncatedKeys.value.has(key) && tooltipLabel.length > 0
      const withMenuTooltip = (node: VNode): VNode => {
        if (!shouldShowTooltip) return node
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
              class={`admin-sidebar-menu__arrow text-current! shrink-0 text-center flex-shrink-0 center ml-auto w-5 ${isSubmenuVisuallyOpen ? 'rotate-180' : 'rotate-0'}`}
            />
          ) : null}
        </span>
      )

      const stateData = {
        'data-menu-state': menuState,
      }
      const linkClass = `${baseClasses} ${stateClasses}`
      const routeTarget = item.route?.name || item.route?.path

      if (item.route?.name) {
        const isExtLink = item.route.meta?.isLink === true
        const linkUrlRaw = item.route.meta?.linkUrl
        const extUrl = (typeof linkUrlRaw === 'string' ? linkUrlRaw : undefined) || item.route.path

        return (
          <RouterLink
            to={{ name: item.route.name }}
            custom
            v-slots={{
              default: ({
                href,
                navigate,
                isActive,
                isExactActive,
              }: SidebarRouterLinkSlotProps) => {
                const routeLinkActive = isActive || routeActive
                const routeLinkExactActive = isExactActive || routeExactActive
                const routeStateClasses = [
                  routeLinkActive
                    ? 'router-link-active c-admin-sidebar-menu__link--route-active'
                    : '',
                  routeLinkExactActive
                    ? 'router-link-exact-active c-admin-sidebar-menu__link--route-exact-active'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')

                return withMenuTooltip(
                  <a
                    href={isExtLink ? extUrl : href}
                    role="link"
                    aria-current={routeLinkExactActive ? 'page' : undefined}
                    data-route-active={routeLinkActive ? 'true' : undefined}
                    data-route-exact-active={routeLinkExactActive ? 'true' : undefined}
                    {...stateData}
                    class={[linkClass, routeStateClasses].filter(Boolean).join(' ')}
                    onClick={(event: MouseEvent) => {
                      event.stopPropagation()
                      if (isExtLink) {
                        event.preventDefault()
                        goToRoute(routeTarget, undefined, undefined, false)
                        return
                      }
                      void navigate(event)
                    }}
                  >
                    {content}
                  </a>
                )
              },
            }}
          />
        )
      }

      return withMenuTooltip(
        <div
          {...stateData}
          class={linkClass}
          onClick={(event: MouseEvent) => {
            if (routeTarget) {
              event.preventDefault()
              event.stopPropagation()
              goToRoute(routeTarget, undefined, undefined, false)
              return
            }
            event.preventDefault()
          }}
        >
          {content}
        </div>
      )
    }

    return () => (
      <div
        ref={menuContainerRef}
        class={[
          'admin-sidebar-menu w-full overflow-hidden',
          isCompactDensity.value ? 'admin-sidebar-menu--compact pt-0' : 'pt-xs',
          props.sidebarState === 'expanded-shell'
            ? 'admin-sidebar-menu--expanded-shell'
            : 'admin-sidebar-menu--expanded',
        ]}
      >
        <PanelMenu
          model={props.model}
          multiple={props.allowMultiple}
          expandedKeys={controlledExpandedKeys.value}
          {...{
            ['onUpdate:expandedKeys']: onUpdateExpandedKeys,
          }}
          class={`admin-sidebar-panelmenu w-full ${MENU_TEXT_CLASS}`}
          pt={{
            item: {
              class: 'mb-xs last:mb-0',
            },
            headerContent: (options: PanelMenuPtOptionsLike) => ({
              class: 'bg-transparent!',
              ...buildPanelRowAttrs(options),
            }),
            itemContent: (options: PanelMenuPtOptionsLike) => buildPanelRowAttrs(options),
            submenu: {
              class: 'mt-xs',
            },
          }}
          v-slots={{
            item: renderPanelMenuItem,
          }}
        />
      </div>
    )
  },
})
