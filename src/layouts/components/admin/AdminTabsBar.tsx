import { CScrollbar } from '@/components/CScrollbar'
import { Transition, defineComponent, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePermissionStore } from '@/stores/modules/permission'
import { Icons } from '@/components/Icons'
import { storeToRefs } from 'pinia'

export interface AdminTabsBarProps {
  show: boolean
}

type ContextMenuAction = 'reload' | 'close' | 'closeOthers' | 'closeAll'

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  targetPath: string
}

export default defineComponent({
  name: 'AdminTabsBar',
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const { t } = useI18n()
    const permissionStore = usePermissionStore()
    const { tabs } = storeToRefs(permissionStore)

    const scrollContainer = ref<InstanceType<typeof CScrollbar> | null>(null)
    const tabRefs = ref<Map<string, HTMLElement>>(new Map())

    const activeTabStyle = ref({
      left: '0px',
      width: '0px',
      opacity: '0',
    })

    const contextMenu = ref<ContextMenuState>({
      visible: false,
      x: 0,
      y: 0,
      targetPath: '',
    })

    function getTabLabel(tab: TabItem) {
      return tab.titleKey ? t(tab.titleKey) : (tab.title ?? tab.name)
    }

    function isActive(tab: TabItem) {
      return route.path === tab.path
    }

    function updateActiveTabPosition() {
      nextTick(() => {
        const currentPath = route.path
        const activeTabEl = tabRefs.value.get(currentPath)

        if (activeTabEl) {
          activeTabStyle.value = {
            left: `${activeTabEl.offsetLeft}px`,
            width: `${activeTabEl.offsetWidth}px`,
            opacity: '1',
          }

          activeTabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        } else {
          activeTabStyle.value.opacity = '0'
        }
      })
    }

    function setTabRef(el: HTMLElement | null, path: string) {
      if (el) {
        tabRefs.value.set(path, el)
      } else {
        tabRefs.value.delete(path)
      }
    }

    function onTabClick(tab: TabItem) {
      contextMenu.value.visible = false
      if (tab.path !== route.path) {
        router.push(tab.path)
      }
    }

    function onCloseTab(e: Event, tab: TabItem) {
      e.preventDefault()
      e.stopPropagation()
      if (tab.fixed || !tab.deletable) return

      const wasCurrent = isActive(tab)
      tabRefs.value.delete(tab.path)
      permissionStore.removeTab(tab.path)

      if (wasCurrent) {
        const remaining = tabs.value
        if (remaining.length > 0) {
          const nextTab = remaining[remaining.length - 1]
          router.push(nextTab.path)
        } else {
          router.push(import.meta.env.VITE_ROOT_REDIRECT || '/dashboard')
        }
      }
    }

    function onContextMenu(e: MouseEvent, tab: TabItem) {
      e.preventDefault()
      contextMenu.value = {
        visible: true,
        x: e.clientX,
        y: e.clientY,
        targetPath: tab.path,
      }
    }

    function closeContextMenu() {
      contextMenu.value.visible = false
    }

    function handleContextAction(action: ContextMenuAction) {
      const targetPath = contextMenu.value.targetPath
      const targetTab = tabs.value.find(t => t.path === targetPath)
      if (!targetTab) return

      switch (action) {
        case 'reload': {
          break
        }
        case 'close': {
          onCloseTab(new Event('click'), targetTab)
          break
        }
        case 'closeOthers': {
          const tabsToKeep = tabs.value
            .filter(tab => tab.fixed || tab.path === targetPath)
            .map(tab => tab.path)

          permissionStore.removeTabsExcept(tabsToKeep)
          if (!tabsToKeep.includes(route.path)) {
            router.push(targetPath)
          }
          break
        }
        case 'closeAll': {
          const fixedTabs = tabs.value.filter(tab => tab.fixed).map(t => t.path)
          permissionStore.removeTabsExcept(fixedTabs)

          if (fixedTabs.length > 0) {
            router.push(fixedTabs[fixedTabs.length - 1])
          } else {
            router.push('/')
          }
          break
        }
      }
      closeContextMenu()
    }

    watch(
      () => route.path,
      () => {
        updateActiveTabPosition()
        contextMenu.value.visible = false
      }
    )

    watch(
      () => tabs.value.length,
      () => {
        nextTick(() => {
          updateActiveTabPosition()
          // 重新设置 ResizeObserver 以监听新的标签元素
          setupResizeObserver()
        })
      }
    )

    // 从隐藏变为显示时重新计算激活项横条位置并重建 ResizeObserver
    watch(
      () => props.show,
      show => {
        if (show) {
          nextTick(() => {
            updateActiveTabPosition()
            setupResizeObserver()
          })
        }
      }
    )

    // 使用 ResizeObserver 监听标签元素尺寸变化
    // 当尺寸模式切换时，CSS 变量变化会导致标签尺寸变化，从而触发更新
    const resizeObserver = ref<ResizeObserver | null>(null)
    const tabsContainerRef = ref<HTMLElement | null>(null)

    function setupResizeObserver() {
      // 断开之前的观察者
      if (resizeObserver.value) {
        resizeObserver.value.disconnect()
      }

      resizeObserver.value = new ResizeObserver(() => {
        // 使用 requestAnimationFrame 确保在浏览器重排后执行
        requestAnimationFrame(() => {
          updateActiveTabPosition()
        })
      })

      // 监听容器
      if (tabsContainerRef.value) {
        resizeObserver.value.observe(tabsContainerRef.value)
      }

      // 监听所有标签元素
      tabRefs.value.forEach(el => {
        if (el && resizeObserver.value) {
          resizeObserver.value.observe(el)
        }
      })
    }

    onMounted(() => {
      document.addEventListener('click', closeContextMenu)
      setTimeout(() => {
        updateActiveTabPosition()
        setupResizeObserver()
      }, 100)
    })

    onUnmounted(() => {
      document.removeEventListener('click', closeContextMenu)
      if (resizeObserver.value) {
        resizeObserver.value.disconnect()
        resizeObserver.value = null
      }
    })

    return () => {
      if (!props.show) return null

      const tabList = tabs.value
      if (tabList.length === 0) return null

      return (
        <div class="relative w-full h-tabsHeight z-10 select-none">
          <CScrollbar
            ref={scrollContainer}
            class="w-full h-full bg-background/80 backdrop-blur-sm border-b border-border [&_.os-scrollbar-horizontal]:[--os-size:2px] [&_.os-scrollbar-horizontal]:[--os-padding-perpendicular:0] [&_.os-scrollbar-horizontal]:[--os-padding-axis:0]"
            options={{
              overflow: {
                x: 'scroll',
                y: 'hidden',
              },
            }}
          >
            <div
              ref={tabsContainerRef}
              class="flex items-end gap-gap-xs px-padding-md h-full relative min-w-max"
            >
              {/* Sliding Highlight Indicator */}
              <div
                class="absolute bottom-0 h-[var(--spacing-xs)] bg-primary transition-all duration-scale-lg ease-out z-20 rounded-full"
                style={activeTabStyle.value}
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
                      'group relative flex items-center gap-scale-sm px-scale-md py-scale-xs h-full',
                      'rounded-t-lg cursor-pointer transition-all duration-scale-md border-t border-x mb-[-1px]',
                      active
                        ? 'bg-primary/10 dark:bg-primary-light/50 border-primary/30 dark:border-primary/50 text-primary'
                        : 'bg-transparent border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                    ]}
                    onClick={() => onTabClick(tab)}
                    onContextmenu={e => onContextMenu(e, tab)}
                  >
                    {/* Icon */}
                    {tab.icon && (
                      <Icons
                        name={tab.icon}
                        size="xs"
                        class={active ? 'text-primary' : 'text-muted-foreground opacity-70'}
                      />
                    )}

                    {/* Label */}
                    <span class="truncate fs-sm flex-1">{label}</span>

                    {/* Close Button */}
                    {!tab.fixed && tab.deletable && (
                      <div
                        class={[
                          'size-1-1 rounded-full transition duration-scale-md h-66% center hover:bg-destructive-light/50',
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
                class="fixed z-50 min-w-[var(--spacing-3xl)] bg-popover/95 backdrop-blur-sm border border-border shadow-lg rounded-scale-md p-padding-xs py-padding-sm flex flex-col gap-gap-xs origin-top-left"
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
                    class="
                                flex items-center gap-gap-sm px-padding-sm py-padding-xs rounded-scale-sm
                                fs-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground
                                cursor-pointer duration-scale-md
                            "
                    onClick={e => {
                      e.stopPropagation()
                      handleContextAction(option.label as ContextMenuAction)
                    }}
                  >
                    <Icons
                      name={option.icon}
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
