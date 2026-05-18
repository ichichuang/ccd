import TieredMenu from 'primevue/tieredmenu'
import type { PropType, VNodeRef } from 'vue'
import type { MenuVisualContext } from '@/hooks/layout/useMenuVisuals'
import {
  createTieredMenuItemRenderer,
  type TieredMenuInactiveClasses,
} from '@/hooks/layout/useMenuRenderer'
import type { PrimeMenuModelItem } from '@/router/utils/helper'

export type AdminMenuPopupPlacement = 'bottom-start' | 'right-start'

export interface AdminMenuPopupExpose {
  toggle: (event: Event, anchor?: HTMLElement | null) => void
  show: (event: Event, anchor?: HTMLElement | null) => void
  hide: () => void
}

interface TieredMenuContainerBridge {
  container?: unknown
  target?: unknown
}

interface TieredMenuRuntimeBridge extends AdminMenuPopupExpose, TieredMenuContainerBridge {}

export function isAdminMenuPopupExpose(value: unknown): value is AdminMenuPopupExpose {
  if (!value || typeof value !== 'object') return false
  return (
    'toggle' in value &&
    typeof value.toggle === 'function' &&
    'show' in value &&
    typeof value.show === 'function' &&
    'hide' in value &&
    typeof value.hide === 'function'
  )
}

function isTieredMenuRuntimeBridge(value: unknown): value is TieredMenuRuntimeBridge {
  return isAdminMenuPopupExpose(value)
}

export default defineComponent({
  name: 'AdminMenuPopup',
  props: {
    model: {
      type: Array as PropType<PrimeMenuModelItem[]>,
      default: () => [],
    },
    context: {
      type: String as PropType<MenuVisualContext>,
      default: 'header',
    },
    placement: {
      type: String as PropType<AdminMenuPopupPlacement>,
      default: 'bottom-start',
    },
    getDistance: {
      type: Function as PropType<(item: PrimeMenuModelItem) => number>,
      required: true,
    },
    inactiveClasses: {
      type: Object as PropType<TieredMenuInactiveClasses>,
      default: undefined,
    },
    emphasizeActiveLabel: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    show: null,
    hide: null,
  },
  setup(props, { emit, expose }) {
    const menuRef = ref<TieredMenuRuntimeBridge | null>(null)
    const activeAnchor = shallowRef<HTMLElement | null>(null)
    let alignmentFrameId: number | null = null

    const renderTieredMenuItem = createTieredMenuItemRenderer({
      context: props.context,
      getDistance: (item: PrimeMenuModelItem): number => props.getDistance(item),
      inactiveClasses: props.inactiveClasses,
      emphasizeActiveLabel: props.emphasizeActiveLabel,
    })

    const getPopupContainer = (): HTMLElement | null => {
      const menu = menuRef.value
      if (!menu) return null
      return menu.container instanceof HTMLElement ? menu.container : null
    }

    const syncPrimeTarget = (anchor: HTMLElement | null): void => {
      const menu = menuRef.value
      if (!menu) return
      menu.target = anchor
    }

    const rememberAnchor = (event: Event, anchor?: HTMLElement | null): void => {
      if (anchor) {
        activeAnchor.value = anchor
        syncPrimeTarget(anchor)
        return
      }

      activeAnchor.value = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
      syncPrimeTarget(activeAnchor.value)
    }

    const alignRightStart = (): void => {
      const anchor = activeAnchor.value
      const container = getPopupContainer()
      if (!anchor || !container) return

      const anchorRect = anchor.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const computedStyle = window.getComputedStyle(container)
      const gutter = Number.parseFloat(computedStyle.getPropertyValue('--admin-menu-popup-gutter'))
      const safeGutter = Number.isFinite(gutter) ? gutter : 0
      const viewportWidth = document.documentElement.clientWidth
      const viewportHeight = document.documentElement.clientHeight
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft
      const scrollTop = window.scrollY || document.documentElement.scrollTop

      let left = anchorRect.right + scrollLeft + safeGutter
      if (left + containerRect.width > scrollLeft + viewportWidth) {
        left = anchorRect.left + scrollLeft - containerRect.width - safeGutter
      }
      left = Math.max(scrollLeft + safeGutter, left)

      let top = anchorRect.top + scrollTop
      if (top + containerRect.height > scrollTop + viewportHeight) {
        top = scrollTop + viewportHeight - containerRect.height - safeGutter
      }
      top = Math.max(scrollTop + safeGutter, top)

      container.style.insetInlineStart = `${left}px`
      container.style.top = `${top}px`
      container.style.marginTop = '0'
      container.style.transformOrigin = 'left top'
    }

    const scheduleAlignment = (): void => {
      if (props.placement !== 'right-start') return
      if (alignmentFrameId !== null) {
        window.cancelAnimationFrame(alignmentFrameId)
        alignmentFrameId = null
      }

      nextTick(() => {
        alignmentFrameId = window.requestAnimationFrame(() => {
          alignmentFrameId = null
          alignRightStart()
        })
      })
    }

    const show = (event: Event, anchor?: HTMLElement | null): void => {
      rememberAnchor(event, anchor)
      menuRef.value?.show(event)
      scheduleAlignment()
    }

    const toggle = (event: Event, anchor?: HTMLElement | null): void => {
      rememberAnchor(event, anchor)
      menuRef.value?.toggle(event)
      scheduleAlignment()
    }

    const hide = (): void => {
      menuRef.value?.hide()
      activeAnchor.value = null
    }

    const handleShow = (): void => {
      scheduleAlignment()
      emit('show')
    }

    const handleHide = (): void => {
      activeAnchor.value = null
      syncPrimeTarget(null)
      emit('hide')
    }

    onBeforeUnmount(() => {
      if (alignmentFrameId !== null) {
        window.cancelAnimationFrame(alignmentFrameId)
        alignmentFrameId = null
      }
    })

    const exposed: AdminMenuPopupExpose = {
      toggle,
      show,
      hide,
    }
    expose(exposed)

    const bindMenuRef: VNodeRef = el => {
      menuRef.value = isTieredMenuRuntimeBridge(el) ? el : null
    }

    return () => (
      <TieredMenu
        ref={bindMenuRef}
        model={props.model}
        popup
        appendTo="body"
        class={`admin-menu-popup admin-menu-popup--${props.placement}`}
        {...{
          onShow: handleShow,
          onHide: handleHide,
        }}
        v-slots={{ item: renderTieredMenuItem }}
      />
    )
  },
})
