import { defineComponent, Transition } from 'vue'
import { CScrollbar } from '@/components/CScrollbar'
import { Icons } from '@/components/Icons'
import { TAB_ICON_SIZE } from '@/constants/layout-menu'
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

    return () => {
      if (!props.show) return null

      const tabList = tabs.value
      if (tabList.length === 0) return null

      return (
        <div class="w-full h-tabsHeight border-b-default px-padding-md overflow-hidden flex items-end select-none z-10">
          <div class="relative flex items-center gap-1 h-full flex-1 min-w-0">
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
                class="flex items-end gap-1 h-full relative min-w-max"
              >
                {/* Smart sliding indicator */}
                <div
                  class="absolute bottom-0 h-[2px] bg-primary pointer-events-none rounded-t-sm z-10"
                  style={{
                    left: activeTabStyle.value.left,
                    width: activeTabStyle.value.width,
                    opacity: activeTabStyle.value.opacity,
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
                {tabList.map(tab => {
                  const active = isActive(tab)
                  const label = getTabLabel(tab)

                  return (
                    <div
                      key={tab.path}
                      ref={el => setTabRef(el as HTMLElement | null, tab.path)}
                      data-path={tab.path}
                      class={[
                        'group relative h-[calc(100%-6px)] flex items-center px-3 rounded-t-md cursor-pointer gap-scale-sm shrink-0',
                        active
                          ? 'bg-primary/10 text-primary font-medium backdrop-blur-md transition-all'
                          : 'bg-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-all',
                      ]}
                      onClick={() => onTabClick(tab)}
                      onContextmenu={e => onContextMenu(e as MouseEvent, tab)}
                    >
                      {/* Icon */}
                      {tab.icon && (
                        <Icons
                          name={tab.icon}
                          size={TAB_ICON_SIZE}
                          class={[
                            'shrink-0 text-current!',
                            active
                              ? 'opacity-100'
                              : 'opacity-70 transition-all duration-scale-md group-hover:opacity-100',
                          ]}
                        />
                      )}

                      {/* Label */}
                      <span class="truncate fs-sm flex-1">{label}</span>

                      {/* Close Button */}
                      {!tab.fixed && tab.deletable && (
                        <div
                          class={[
                            'center rounded-full p-0.5 transition-colors duration-scale-sm text-muted-foreground hover:text-danger hover:bg-danger/10',
                            active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                          ]}
                          onClick={e => onCloseTab(e, tab)}
                        >
                          <Icons
                            name="i-lucide-x"
                            size={TAB_ICON_SIZE}
                            class="text-current!"
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
          <Transition
            enter-active-class="transition duration-scale-md ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-scale-md ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            {contextMenu.value.visible && (
              <div
                class="fixed z-50 min-w-[var(--spacing-3xl)] bg-popover/95 backdrop-blur-md shadow-xl rounded-scale-md p-padding-xs flex flex-col gap-xs origin-top-left outline-none!"
                style={{ top: `${contextMenu.value.y}px`, left: `${contextMenu.value.x}px` }}
              >
                {[
                  {
                    label: 'reload',
                    icon: 'i-lucide-refresh-cw',
                    text: t('common.reload') || 'Reload',
                  },
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
                ].map(option => (
                  <div
                    key={option.label}
                    class="menu-item-base px-padding-sm py-padding-xs rounded-scale-sm fs-sm text-popover-foreground hover:menu-item-hover group"
                    role="button"
                    tabindex="0"
                    onClick={e => {
                      e.stopPropagation()
                      handleContextAction(option.label as ContextMenuAction)
                    }}
                    onKeyup={(e: KeyboardEvent) => {
                      if (e.key === 'Enter') {
                        e.stopPropagation()
                        handleContextAction(option.label as ContextMenuAction)
                      }
                    }}
                  >
                    <Icons
                      name={option.icon}
                      class="text-muted-foreground! transition-colors duration-scale-md group-hover:text-primary!"
                      size={TAB_ICON_SIZE}
                    />
                    <span>{option.text}</span>
                  </div>
                ))}
              </div>
            )}
          </Transition>
        </div>
      )
    }
  },
})
