import { defineComponent, Teleport, Transition } from 'vue'
import { CScrollbar } from '@ccd/vue-ui'
import { Icons } from '@ccd/vue-ui'
import {
  MENU_ADMIN_CONTEXT_ICON_UNIFIED,
  MENU_ADMIN_CONTEXT_ITEM_UNIFIED,
  MENU_ADMIN_TAB_ACTIVE_UNIFIED,
  MENU_ADMIN_TAB_CLOSE_UNIFIED,
  MENU_ADMIN_TAB_INACTIVE_UNIFIED,
  TAB_ICON_SIZE,
} from '@/constants/layout-menu'
import { useAdminTabs } from '@/hooks/layout/useAdminTabs'
import type { ContextMenuAction } from '@/hooks/layout/useAdminTabs'

export default defineComponent({
  name: 'AdminTabsBar',
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const {
      tabs,
      scrollContainer,
      tabsContainerRef,
      activeTabStyle,
      contextMenu,
      getTabLabel,
      isActive,
      updateActiveTabPosition,
      setTabRef,
      onTabClick,
      onCloseTab,
      onContextMenu,
      handleContextAction,
      t,
    } = useAdminTabs()

    const contextMenuPanelRef = ref<HTMLElement | null>(null)

    const clampContextMenuToViewport = async () => {
      if (!contextMenu.value.visible) return
      await nextTick()

      const el = contextMenuPanelRef.value
      if (!el) return

      const rect = el.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight

      const nextX = Math.min(Math.max(0, contextMenu.value.x), Math.max(0, vw - rect.width))
      const nextY = Math.min(Math.max(0, contextMenu.value.y), Math.max(0, vh - rect.height))

      contextMenu.value.x = Math.round(nextX)
      contextMenu.value.y = Math.round(nextY)
    }

    // 监听显示状态，从隐藏变为显示时重新计算位置
    watch(
      () => props.show,
      show => {
        if (show) {
          nextTick(() => {
            updateActiveTabPosition('auto')
          })
        }
      }
    )

    watch(
      () => contextMenu.value.visible,
      visible => {
        if (visible) void clampContextMenuToViewport()
      }
    )

    return () => {
      if (!props.show) return null

      const tabList = tabs.value
      if (tabList.length === 0) return null

      const contextMenuOptions: { label: ContextMenuAction; icon: string; text: string }[] = [
        { label: 'reload', icon: 'i-lucide-refresh-cw', text: t('common.reload') || 'Reload' },
        { label: 'close', icon: 'i-lucide-x', text: t('common.close') || 'Close' },
        {
          label: 'closeOthers',
          icon: 'i-lucide-copy-x',
          text: t('common.closeOthers') || 'Close Others',
        },
        {
          label: 'closeAll',
          icon: 'i-lucide-trash-2',
          text: t('common.closeAll') || 'Close All',
        },
      ]

      return (
        <div
          class="w-full h-tabsHeight select-none"
          data-admin-tabs-bar="true"
        >
          <div class="relative center gap-1 layout-full flex-1">
            <CScrollbar
              ref={scrollContainer}
              options={{
                scrollbars: {
                  visibility: 'hidden',
                },
                overflow: {
                  y: 'hidden',
                },
              }}
            >
              <div
                ref={tabsContainerRef}
                class="flex items-end px-md gap-1 h-full"
              >
                {/* Smart sliding indicator */}
                <div
                  class="absolute bottom-0 bg-sidebar-primary pointer-events-none rounded-b-sm z-content"
                  style={{
                    height: 'var(--spacing-xs)',
                    left: activeTabStyle.value.left,
                    width: activeTabStyle.value.width,
                    opacity: activeTabStyle.value.opacity,
                    transition: 'all var(--transition-lg) cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
                {tabList.map(tab => {
                  const active = isActive(tab)
                  const label = getTabLabel(tab)

                  return (
                    <div
                      key={tab.path}
                      ref={el => setTabRef(el instanceof HTMLElement ? el : null, tab.path)}
                      data-path={tab.path}
                      class={[
                        'h-full flex items-center px-sm rounded-t-lg cursor-pointer gap-sm shrink-0 duration-md',
                        active ? MENU_ADMIN_TAB_ACTIVE_UNIFIED : MENU_ADMIN_TAB_INACTIVE_UNIFIED,
                      ]}
                      onClick={() => onTabClick(tab)}
                      onContextmenu={(e: MouseEvent) => onContextMenu(e, tab)}
                    >
                      {/* Icon */}
                      {tab.icon && (
                        <Icons
                          name={tab.icon}
                          size={TAB_ICON_SIZE}
                          class={[
                            active ? 'scale-120' : 'scale-100',
                            'text-current transition-transform duration-md',
                          ]}
                        />
                      )}

                      {/* Label */}
                      <span class="truncate text-sm flex-1">{label}</span>

                      {/* Close Button */}
                      {!tab.fixed && tab.deletable && (
                        <div
                          class={MENU_ADMIN_TAB_CLOSE_UNIFIED}
                          onClick={e => onCloseTab(e, tab)}
                        >
                          <Icons
                            name="i-lucide-x"
                            size={TAB_ICON_SIZE}
                            class="text-current"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CScrollbar>
          </div>

          {/* Context Menu Portal/Overlay with Transition */}
          <Teleport to="body">
            <Transition
              enter-active-class="transition duration-md ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition duration-md ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              {contextMenu.value.visible && (
                <div
                  class="fixed inset-0 z-overlay"
                  data-admin-tabs-context-menu="true"
                  onContextmenu={(e: MouseEvent) => e.preventDefault()}
                >
                  <div
                    ref={contextMenuPanelRef}
                    class="fixed z-popover min-w-[var(--spacing-3xl)] bg-popover/95 backdrop-blur-md shadow-xl rounded-md p-xs flex flex-col gap-xs origin-top-left outline-none!"
                    style={{ top: `${contextMenu.value.y}px`, left: `${contextMenu.value.x}px` }}
                    onMousedown={(e: MouseEvent) => e.stopPropagation()}
                    onClick={(e: MouseEvent) => e.stopPropagation()}
                  >
                    {contextMenuOptions.map(option => (
                      <div
                        key={option.label}
                        class={MENU_ADMIN_CONTEXT_ITEM_UNIFIED}
                        role="button"
                        tabindex="0"
                        onClick={e => {
                          e.stopPropagation()
                          handleContextAction(option.label)
                        }}
                        onKeyup={(e: KeyboardEvent) => {
                          if (e.key === 'Enter') {
                            e.stopPropagation()
                            handleContextAction(option.label)
                          }
                        }}
                      >
                        <Icons
                          name={option.icon}
                          class={MENU_ADMIN_CONTEXT_ICON_UNIFIED}
                          size={TAB_ICON_SIZE}
                        />
                        <span>{option.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Transition>
          </Teleport>
        </div>
      )
    }
  },
})
