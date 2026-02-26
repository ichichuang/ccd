import { defineComponent, Transition } from 'vue'
import { CScrollbar } from '@/components/CScrollbar'
import { Icons } from '@/components/Icons'
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
        <div class="relative w-full h-tabsHeight z-10 select-none">
          <CScrollbar
            ref={scrollContainer}
            options={{
              scrollbars: {
                visibility: 'hidden',
              },
            }}
          >
            <div
              ref={tabsContainerRef}
              class="flex items-end gap-xs px-padding-md h-full relative min-w-max"
            >
              {/* Sliding Highlight Indicator */}
              <div
                class="absolute bottom-0 h-[var(--spacing-xs)] bg-primary transition-all duration-scale-lg ease-out z-20 rounded-full"
                style={activeTabStyle.value}
              />

              {tabList.map((tab, index) => {
                const active = isActive(tab)
                const label = getTabLabel(tab)
                const isNextActive = index < tabList.length - 1 && isActive(tabList[index + 1])

                return (
                  <div
                    key={tab.path}
                    ref={el => setTabRef(el as HTMLElement | null, tab.path)}
                    data-path={tab.path}
                    class={[
                      'group relative flex items-center gap-scale-sm px-scale-md py-scale-xs h-full',
                      'rounded-scale-md cursor-pointer transition-all duration-scale-md border-t border-x mb-[-1px]',
                      active
                        ? 'bg-primary/20 text-primary font-semibold border-primary/30'
                        : 'bg-transparent border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                    ]}
                    onClick={() => onTabClick(tab)}
                    onContextmenu={e => onContextMenu(e as MouseEvent, tab)}
                  >
                    {/* Icon */}
                    {tab.icon && (
                      <Icons
                        name={tab.icon}
                        size="xs"
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
                          'size-1-1 h-[66%] rounded-scale-md center transition-all duration-scale-md hover:bg-danger-light/50',
                          active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                        ]}
                        onClick={e => onCloseTab(e, tab)}
                      >
                        <Icons
                          name="i-lucide-x"
                          size="xs"
                        />
                      </div>
                    )}

                    {/* Divider */}
                    {!active && !isNextActive && index !== tabList.length - 1 && (
                      <div class="absolute top-1/4 h-1/2 w-px -right-[calc(var(--spacing-xs)/2)] bg-border pointer-events-none" />
                    )}
                  </div>
                )
              })}
            </div>
          </CScrollbar>

          {/* Context Menu Portal/Overlay with Transition */}
          <Transition
            enter-active-class="transition duration-scale-md ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-scale-sm ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            {contextMenu.value.visible && (
              <div
                class="fixed z-50 min-w-[var(--spacing-3xl)] bg-popover/95 backdrop-blur-md border border-border shadow-lg rounded-scale-md p-padding-xs flex flex-col gap-xs origin-top-left outline-none!"
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
                      size="xs"
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
