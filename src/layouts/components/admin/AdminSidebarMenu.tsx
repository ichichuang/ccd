import TieredMenu from 'primevue/tieredmenu'
import PanelMenu from 'primevue/panelmenu'
import Tooltip from 'primevue/tooltip'
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
  MENU_COLLAPSED_BUTTON_PADDING,
  MENU_COLLAPSED_BUTTON_SIZE,
  MENU_COLLAPSED_FALLBACK_SIZE,
  MENU_COLLAPSED_FALLBACK_TEXT,
  MENU_ICON_SIZE_COLLAPSED,
  MENU_INACTIVE_TEXT,
  MENU_ITEM_GAP,
  MENU_TEXT_WEIGHT,
  MENU_PANEL_INDENT_ROOT,
  MENU_PANEL_INDENT_CHILD,
  MENU_TEXT_CLASS,
  MENU_ICON_COMMON_CLASS,
  ROUNDED_NAV,
} from '@/constants/layout-menu'
import { getMenuItemBase, getMenuStateClasses, getIconSize } from '@/hooks/layout/useMenuVisuals'
import { createTieredMenuItemRenderer } from '@/hooks/layout/useMenuRenderer'
import { useLayoutStore } from '@/stores/modules/layout'
import { useUserStore } from '@/stores/modules/user'
import { useThemeStore } from '@/stores/modules/theme'
import { useAppElementSize } from '@/hooks/modules/useAppElementSize'

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

export interface AdminSidebarMenuProps {
  sidebarCollapse: boolean
}

export default defineComponent({
  name: 'AdminSidebarMenu',
  props: {
    sidebarCollapse: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n()
    const route = useRoute()
    const layoutStore = useLayoutStore()
    const userStore = useUserStore()
    const themeStore = useThemeStore()

    const isDark = computed<boolean>(() => themeStore.isDark)
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

      if (!props.sidebarCollapse) {
        nextTick(() => {
          scheduleMeasureTruncation(0)
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

    const setMenuLabelRef = (key: string, el: HTMLElement | null) => {
      const map = menuLabelRefs.value
      if (el) {
        map.set(key, el)
      } else {
        map.delete(key)
      }
    }

    let measureTimeoutId: number | null = null
    let fontsReadyHooked = false

    function scheduleMeasureTruncation(delayMs: number): void {
      if (props.sidebarCollapse) return
      if (measureTimeoutId !== null) {
        window.clearTimeout(measureTimeoutId)
        measureTimeoutId = null
      }

      measureTimeoutId = window.setTimeout(() => {
        if (props.sidebarCollapse) {
          measureTimeoutId = null
          return
        }
        measureTruncation()
        measureTimeoutId = null
      }, delayMs)
    }

    function measureTruncation(): void {
      if (props.sidebarCollapse) return
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
        if (props.sidebarCollapse) return
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
      () => props.sidebarCollapse,
      collapsed => {
        if (collapsed) {
          if (measureTimeoutId !== null) {
            window.clearTimeout(measureTimeoutId)
            measureTimeoutId = null
          }
          truncatedKeys.value = new Set<string>()
          return
        }
        if (!collapsed) {
          nextTick(() => {
            scheduleMeasureTruncation(200)
          })
        }
      }
    )

    onBeforeUnmount(() => {
      if (measureTimeoutId !== null) {
        window.clearTimeout(measureTimeoutId)
        measureTimeoutId = null
      }
    })

    const getExpandedSidebarStateClasses = (distance: number, level: number): string => {
      if (distance < 0) {
        return getMenuStateClasses({ distance, level })
      }
      if (distance === 0) {
        return getMenuStateClasses({ distance, level })
      }
      const bgByDistance: Record<number, string> = {
        1: 'bg-primary/8!',
        2: 'bg-primary/6!',
        3: 'bg-primary/4!',
      }
      const bgByDistanceDark: Record<number, string> = {
        1: 'bg-primary/30!',
        2: 'bg-primary/20!',
        3: 'bg-primary/10!',
      }
      const bgClass = bgByDistance[distance] ?? 'bg-primary/8!'
      const bgClassDark = bgByDistanceDark[distance] ?? 'dark:bg-primary/10!'
      const textClass = 'text-primary!'
      const textClassDark = 'text-primary!'
      return isDark.value ? `${bgClassDark} ${textClassDark}` : `${bgClass} ${textClass}`
    }

    const renderPanelMenuItem = ({ item }: { item: PrimeMenuModelItem }) => {
      const distance = getActiveDistanceForItem(item)
      const level = item.level ?? 0
      const indentClass = level <= 0 ? MENU_PANEL_INDENT_ROOT : MENU_PANEL_INDENT_CHILD
      const baseClasses = `${getMenuItemBase('sidebar')} group w-full no-underline box-border overflow-hidden ${MENU_TEXT_WEIGHT} ${indentClass}`
      const stateClasses = getExpandedSidebarStateClasses(distance, level)

      const key = item.key
      if (typeof key !== 'string' || !key.length) {
        return null
      }

      const labelNode = (
        <span
          ref={el => setMenuLabelRef(key, el instanceof HTMLElement ? el : null)}
          data-menu-label-key={key}
          class={`text-single-line-ellipsis text-left! flex-1 min-w-0 shrink text-current! ${MENU_TEXT_CLASS}`}
        >
          {item.label}
        </span>
      )

      const isTruncated = truncatedKeys.value.has(key)
      const labelContent = isTruncated
        ? withDirectives(labelNode, [[Tooltip, item.label, '', { right: true }]])
        : labelNode

      const content = (
        <span
          class={`row-y-center ${MENU_ITEM_GAP} w-full min-w-0 shrink overflow-hidden text-current! ${MENU_TEXT_CLASS}`}
        >
          {item.icon ? (
            <Icons
              name={item.icon}
              size={getIconSize('sidebar')}
              class={`text-current! shrink-0 ${MENU_ICON_COMMON_CLASS}`}
            />
          ) : null}
          {labelContent}
          {Array.isArray(item.items) && item.items.length > 0 ? (
            <Icons
              name="i-lucide-chevron-down"
              size={getIconSize('sidebar')}
              class={`ml-auto text-current! shrink-0 ${MENU_ICON_COMMON_CLASS} ${layoutStore.getExpandedMenuKeys[key] ? 'rotate-180' : 'rotate-0'}`}
            />
          ) : null}
        </span>
      )

      const linkClass = `${baseClasses} ${stateClasses}`

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
              default: ({ href }: { href: string }) => (
                <a
                  href={isExtLink ? extUrl : href}
                  role="link"
                  class={linkClass}
                  onClick={(e: MouseEvent) => {
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
      return (
        <button
          type="button"
          class={linkClass}
          onClick={(e: Event) => handleParentItemClick(e, item)}
        >
          {content}
        </button>
      )
    }

    const tieredMenuRefs = ref<Map<string, InstanceType<typeof TieredMenu>>>(new Map())
    const collapsedAnchorRefs = ref<Map<string, HTMLElement>>(new Map())
    const openDropdownKey = ref<string | null>(null)

    const setMenuRef = (key: string, el: InstanceType<typeof TieredMenu> | null) => {
      if (el) {
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
          menuRef.toggle(syntheticEvent)
          openDropdownKey.value = wasOpen ? null : key
        }
      } else if (item.route?.path) {
        goToRoute(item.route.name || item.route.path, undefined, undefined, false)
      }
    }

    const renderTieredMenuItem = createTieredMenuItemRenderer({
      context: 'sidebar',
      getDistance: (item: PrimeMenuModelItem) => getActiveDistanceForItem(item),
      inactiveClasses: {
        root: MENU_INACTIVE_TEXT,
        child: MENU_INACTIVE_TEXT,
      },
    })

    const renderCollapsedItem = (item: PrimeMenuModelItem) => {
      const key = item.key
      if (typeof key !== 'string' || !key.length) {
        return null
      }
      const rawLabel = item.label
      const label: string =
        typeof rawLabel === 'string' ? rawLabel : typeof rawLabel === 'function' ? rawLabel() : ''
      const distance = getActiveDistanceForItem(item)
      const isSubmenuOpen = openDropdownKey.value === key

      const stateClasses = getMenuStateClasses({
        distance,
        isSubmenuOpen,
        level: 0,
      })

      const hasChildren = Array.isArray(item.items) && item.items.length > 0

      const iconButton = (
        <button
          type="button"
          class={`center group ${MENU_COLLAPSED_BUTTON_PADDING} rounded-md ${ROUNDED_NAV} cursor-pointer transition-[background-color,color,opacity,transform] duration-scale-md aspect-square ${MENU_COLLAPSED_BUTTON_SIZE} border-none bg-transparent p-0 outline-none interactive-focus-ring ${stateClasses}`}
          onClick={e => onCollapsedItemClick(e, item)}
        >
          {item.icon ? (
            <Icons
              name={item.icon}
              size={MENU_ICON_SIZE_COLLAPSED}
              class={`text-current! shrink-0 ${MENU_ICON_COMMON_CLASS}`}
            />
          ) : (
            <div
              class={`${MENU_COLLAPSED_FALLBACK_SIZE} rounded-full bg-card text-card-foreground center ${MENU_COLLAPSED_FALLBACK_TEXT} font-bold`}
            >
              {label.substring(0, 1)}
            </div>
          )}
        </button>
      )

      const iconWithTooltip = withDirectives(iconButton, [[Tooltip, label, '', { right: true }]])

      return (
        <div
          key={key}
          class="relative"
        >
          {iconWithTooltip}
          {hasChildren && (
            <span
              ref={el => setCollapsedAnchorRef(key, el instanceof HTMLElement ? el : null)}
              class="absolute top-0 right-0 w-0 h-0"
            />
          )}
          {hasChildren && (
            <TieredMenu
              ref={el => setMenuRef(key, el as InstanceType<typeof TieredMenu> | null)}
              model={item.items}
              popup
              appendTo="body"
              {...{
                onHide: () => {
                  openDropdownKey.value = null
                },
              }}
              v-slots={{ item: renderTieredMenuItem }}
            />
          )}
        </div>
      )
    }

    return () => {
      const panelMenuBind: Record<string, unknown> = {
        expandedKeys: layoutStore.getExpandedMenuKeys,
        ['onUpdate:expandedKeys']: onUpdateExpandedKeys,
      }
      return (
        <div
          ref={menuContainerRef}
          class="w-full overflow-hidden pt-padding-xs"
        >
          {!props.sidebarCollapse ? (
            <PanelMenu
              model={panelMenuModel.value}
              multiple={allowMultiple.value}
              {...panelMenuBind}
              class={`w-full ${MENU_TEXT_CLASS}`}
              pt={{
                item: {
                  class: 'mb-padding-xs last:mb-0',
                },
                submenu: {
                  class: 'mt-padding-xs',
                },
              }}
              v-slots={{
                item: renderPanelMenuItem,
              }}
            />
          ) : (
            <div class="col-stack-sm items-center">
              {panelMenuModel.value.map(item => renderCollapsedItem(item))}
            </div>
          )}
        </div>
      )
    }
  },
})
