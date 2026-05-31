import { primeVueTooltipDirective } from '@ccd/vue-primevue-adapter'
import type { PropType, VNodeRef } from 'vue'
import { withDirectives } from 'vue'
import { useRoute } from 'vue-router'
import { Icons } from '@ccd/vue-ui'
import { getActiveDistance, goToRoute, type PrimeMenuModelItem } from '@/router/utils/helper'
import {
  MENU_FALLBACK_ICON,
  MENU_ICON_COMMON_CLASS,
  MENU_ITEM_GAP,
  MENU_TEXT_CLASS,
  MENU_TEXT_WEIGHT,
} from '@/constants/layout-menu'
import { getIconSize, getMenuItemBase, getMenuStateClasses } from '@/hooks/layout/useMenuVisuals'
import AdminMenuPopup, {
  isAdminMenuPopupExpose,
  type AdminMenuPopupExpose,
} from '@/layouts/components/admin/AdminMenuPopup'
import {
  resolveElementRef,
  resolveMenuLabel,
  type SidebarMenuDensity,
} from '@/layouts/components/admin/adminSidebarMenu.shared'

export default defineComponent({
  name: 'AdminSidebarMenuCollapsed',
  props: {
    model: {
      type: Array as PropType<PrimeMenuModelItem[]>,
      default: () => [],
    },
    density: {
      type: String as PropType<SidebarMenuDensity>,
      default: 'regular',
    },
  },
  setup(props) {
    const route = useRoute()
    const isCompactDensity = computed(() => props.density === 'compact')
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

    const closeAllPopups = (): void => {
      tieredMenuRefs.value.forEach(ref => {
        ref?.hide()
      })
      openDropdownKey.value = null
    }

    const onCollapsedItemClick = (item: PrimeMenuModelItem): void => {
      const key = item.key
      if (typeof key !== 'string' || !key.length) return

      const hasChildren = Array.isArray(item.items) && item.items.length > 0
      if (hasChildren) {
        const menuRef = tieredMenuRefs.value.get(key)
        const anchorEl = collapsedAnchorRefs.value.get(key)
        if (!menuRef || !anchorEl) return

        tieredMenuRefs.value.forEach((ref, refKey) => {
          if (refKey !== key) ref?.hide()
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
        Object.defineProperty(syntheticEvent, 'target', {
          value: anchorEl,
          writable: false,
        })
        menuRef.toggle(syntheticEvent, anchorEl)
        openDropdownKey.value = wasOpen ? null : key
        return
      }

      if (item.route?.path) {
        goToRoute(item.route.name || item.route.path, undefined, undefined, false)
      }
    }

    watch(
      () => route.fullPath,
      () => {
        closeAllPopups()
      }
    )

    onBeforeUnmount(() => {
      closeAllPopups()
    })

    const renderCollapsedPopup = (item: PrimeMenuModelItem) => {
      const key = item.key
      if (typeof key !== 'string' || !key.length) return null
      if (!Array.isArray(item.items) || item.items.length === 0) return null

      return (
        <AdminMenuPopup
          key={key}
          ref={(el: unknown) => setMenuRef(key, el)}
          model={item.items}
          context="sidebar"
          placement="right-start"
          getDistance={(child: PrimeMenuModelItem): number => getActiveDistance(route, child)}
          {...{
            onHide: () => {
              openDropdownKey.value = null
            },
          }}
        />
      )
    }

    const renderCollapsedMenuItem = (item: PrimeMenuModelItem) => {
      const key = item.key
      if (typeof key !== 'string' || !key.length) return null

      const hasChildren = Array.isArray(item.items) && item.items.length > 0
      const distance = getActiveDistance(route, item)
      const tooltipLabel = resolveMenuLabel(item.label)
      const stateClasses = getMenuStateClasses({
        context: 'sidebar',
        distance,
        isSubmenuOpen: hasChildren && openDropdownKey.value === key,
        level: 0,
      })
      const anchorRef: VNodeRef | undefined = hasChildren
        ? el => setCollapsedAnchorRef(key, resolveElementRef(el))
        : undefined
      const stateData = {
        'data-menu-state':
          distance === 0
            ? 'active'
            : distance > 0
              ? 'ancestor'
              : hasChildren && openDropdownKey.value === key
                ? 'open'
                : 'idle',
      }
      const itemNode = (
        <button
          type="button"
          ref={anchorRef}
          aria-label={tooltipLabel || undefined}
          {...stateData}
          class={[
            getMenuItemBase('sidebar'),
            'admin-sidebar-menu__item admin-sidebar-menu__item--root group w-full no-underline box-border overflow-hidden appearance-none border-none bg-transparent p-0 cursor-pointer',
            MENU_TEXT_WEIGHT,
            stateClasses,
          ]}
          onClick={(event: MouseEvent) => {
            event.preventDefault()
            event.stopPropagation()
            onCollapsedItemClick(item)
          }}
        >
          <span
            class={`admin-sidebar-menu__item-content flex items-center justify-center ${MENU_ITEM_GAP} w-full min-w-0 overflow-hidden text-current! ${MENU_TEXT_CLASS}`}
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
          </span>
        </button>
      )

      if (!tooltipLabel) return <li key={key}>{itemNode}</li>
      return (
        <li key={key}>
          {withDirectives(itemNode, [
            [primeVueTooltipDirective, tooltipLabel, '', { right: true }],
          ])}
        </li>
      )
    }

    return () => (
      <div
        class={[
          'admin-sidebar-menu w-full overflow-hidden',
          isCompactDensity.value ? 'admin-sidebar-menu--compact pt-0' : 'pt-xs',
          'admin-sidebar-menu--collapsed',
        ]}
      >
        <ul class="admin-sidebar-collapsed-menu w-full">
          {props.model.map(item => renderCollapsedMenuItem(item))}
        </ul>
        {props.model.map(item => renderCollapsedPopup(item))}
      </div>
    )
  },
})
