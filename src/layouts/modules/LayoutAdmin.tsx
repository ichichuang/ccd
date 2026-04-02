import { defineComponent, Transition } from 'vue'
import { useI18n } from 'vue-i18n'
import Drawer from 'primevue/drawer'
import { useRoute } from 'vue-router'
import AppContainer from '@&/AppContainer.vue'
import { useLayoutStore } from '@/stores/modules/layout'
import { useDeviceStore } from '@/stores/modules/device'
import { useDateUtils } from '@/hooks/modules/useDateUtils'
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'
import ContextMenuProvider from '@/layouts/components/ContextMenuProvider.vue'
import SettingsContent from '@/layouts/components/GlobalSetting/SettingsContent.vue'
import { useDialog } from '@/hooks/modules/useDialog'
import { refreshCurrentRoute } from '@/router/utils/helper'
import AdminHeader from '@&/admin/AdminHeader.vue'
import AdminSidebar from '@&/admin/AdminSidebar.tsx'
import AdminBreadcrumbBar from '@&/admin/AdminBreadcrumbBar.vue'
import AdminTabsBar from '@&/admin/AdminTabsBar.tsx'
import AdminFooterBar from '@&/admin/AdminFooterBar.tsx'
import AdminSidebarLogo from '@/layouts/components/admin/AdminSidebarLogo'
import AdminSidebarMenu from '@/layouts/components/admin/AdminSidebarMenu'
import { Icons } from '@/components/Icons'
import { CScrollbar } from '@/components/CScrollbar'
import { BREAKPOINTS } from '@/constants/breakpoints'

/**
 * LayoutAdmin（Admin 壳）- TSX 版本
 *
 * 双层布局概念：
 * - LayoutMode：由 route.meta.parent 决定是否使用该壳（layouts/index.vue 负责切换）
 * - AdminLayoutMode：仅在 admin 壳内生效（layoutStore.mode：vertical/horizontal/mix）
 *
 * 注意：侧边栏、顶部菜单、面包屑、Tabs、Footer 等业务模块尚未实现，
 * 这里使用占位元素；仅保留「主题切换 + 全局设置入口」的现有实现。
 */
export default defineComponent({
  name: 'LayoutAdmin',
  setup() {
    const { t } = useI18n()
    const layoutStore = useLayoutStore()
    const deviceStore = useDeviceStore()
    const route = useRoute()

    const { getAvailableTimezones, isInitialized } = useDateUtils()
    const { isDark, isAnimating, toggleThemeWithAnimation } = useThemeSwitch()
    const { openDialog } = useDialog()

    // ===== 管理布局右键菜单逻辑 =====
    const contextThemeToggleLabel = computed(() =>
      isDark.value ? t('layout.switchToLight') : t('layout.switchToDark')
    )

    const onContextReload = () => {
      refreshCurrentRoute()
    }

    const openGlobalSettings = () => {
      openDialog({
        header: t('layout.globalSettingsTitle'),
        position: 'right',
        class: 'w-[82vw]! sm:w-[60vw]! md:w-[40vw]! lg:w-[36vw]!',
        contentRenderer: () => <SettingsContent />,
      })
    }

    const onContextToggleTheme = (event: MouseEvent) => {
      if (isAnimating.value) return
      void toggleThemeWithAnimation(event)
    }

    // 时区选项：DateUtils 初始化后从 getAvailableTimezones 加载（暂留，后续由设置面板消费）
    type TimezoneOptionItem = {
      name: string
      countryCode: string
      currentTimeOffsetInMinutes: number
    }
    const timezoneOptions = ref<TimezoneOptionItem[]>([])
    watch(
      isInitialized,
      v => {
        if (v) {
          const nextList: TimezoneOptionItem[] = getAvailableTimezones(
            false
          ) as TimezoneOptionItem[]
          timezoneOptions.value = nextList
        }
      },
      { immediate: true }
    )

    onMounted(() => {
      layoutStore.migrateLegacyVisibilityIfNeeded()
    })

    watch(
      () => route.path,
      () => {
        if (layoutStore.mobileDrawerOpen) {
          layoutStore.mobileDrawerOpen = false
        }
      }
    )

    // 1. The Strict Drawer Matrix
    const isDrawerMode = computed<boolean>(() => {
      if (deviceStore.type === 'Mobile') return true
      if (deviceStore.type === 'Tablet') return deviceStore.width < BREAKPOINTS.md
      return false // PC never uses Drawer
    })

    // 2. Effective Mode：Drawer 时强制 horizontal
    const effectiveMode = computed<AdminLayoutMode>(() => {
      if (isDrawerMode.value) return 'horizontal'
      return layoutStore.preferredMode
    })

    // --- Resize-safe key: 防止断点跨越时 key 变化导致整棵 VDOM 子树被销毁重建 ---
    // 时序问题：isResizing 在 150ms 空闲后清除，但 detectViewportInfo 在 300ms 后才执行
    // 需要额外 settle 窗口确保 width 已更新后再解冻 key
    const isResizeSettled = ref(true)
    let settleTimer: ReturnType<typeof setTimeout> | undefined

    watch(
      () => deviceStore.isResizing,
      resizing => {
        if (resizing) {
          isResizeSettled.value = false
          if (settleTimer !== undefined) {
            clearTimeout(settleTimer)
            settleTimer = undefined
          }
        } else {
          // 150ms(idle) + 200ms(settle) = 350ms > 300ms(debounce)
          settleTimer = setTimeout(() => {
            isResizeSettled.value = true
            settleTimer = undefined
          }, 200)
        }
      }
    )
    onUnmounted(() => {
      if (settleTimer !== undefined) clearTimeout(settleTimer)
    })

    // stableKey: resize 期间冻结旧值，防止 Transition key 变化触发 unmount
    // 严禁在 computed 中产生副作用，使用 watch 监听状态变化
    const stableKey = ref<AdminLayoutMode>(effectiveMode.value)

    watch([effectiveMode, isResizeSettled], ([newMode, settled]) => {
      // 只有在 resize 彻底平息后，才允许更新 key
      if (settled) {
        stableKey.value = newMode
      }
    })

    const isHorizontal = computed(() => effectiveMode.value === 'horizontal')
    const showDrawerTrigger = computed(() => isDrawerMode.value)

    // --- 展示开关（store 仅由配置面板控制）---
    const showHeader = computed(() => layoutStore.showHeader)
    const showLogo = computed(() => layoutStore.showLogo)
    const showMenu = computed(() => layoutStore.showMenu)
    // 4. The Strict Logo Text Visibility
    const showLogoText = computed<boolean>(() => {
      // Show text ONLY on PC when width is large enough (>= lg).
      // If PC is squeezed below lg, or if it's Tablet/Mobile, show ICON ONLY.
      return deviceStore.type === 'PC' && deviceStore.width >= BREAKPOINTS.lg
    })

    // 5. 面包屑：仅物理 PC 且视口宽度 ≥ lg
    const showBreadcrumbEffective = computed<boolean>(() => {
      return (
        layoutStore.showBreadcrumb &&
        deviceStore.type === 'PC' &&
        deviceStore.width >= BREAKPOINTS.lg
      )
    })

    // 2. The Strict Top Menu Visibility
    const showTopMenuEffective = computed<boolean>(() => {
      return layoutStore.showMenu && !isDrawerMode.value
    })

    // 3. The Strict Sidebar Visibility
    const showSidebarEffective = computed<boolean>(() => {
      return layoutStore.showSidebar && !isDrawerMode.value
    })
    const showTabsEffective = computed(() => layoutStore.showTabs)
    const showFooterEffective = computed(() => layoutStore.showFooter)

    const showSidebarToggle = computed(
      () =>
        showSidebarEffective.value &&
        (effectiveMode.value === 'vertical' || effectiveMode.value === 'mix')
    )

    // --- 固定行为（当前仅输出 class 占位，sticky/calc 由后续样式完善） ---
    const headerFixed = computed(() => layoutStore.headerFixed)
    const sidebarFixed = computed(() => layoutStore.sidebarFixed)

    // --- 侧边栏宽度：只用尺寸系统变量类名 ---
    const sidebarWidthClass = computed(() =>
      layoutStore.sidebarCollapse ? 'w-sidebarCollapsedWidth' : 'w-sidebarWidth'
    )

    // --- 布局模式切换过渡：与 AnimateRouterView / AnimateWrapper 一致使用 animate.css ---
    // Resize 拖拽期间必须保持 Transition 子树不被卸载重建（Transition Trap）
    const transitionName = computed(() =>
      layoutStore.enableTransition && isResizeSettled.value ? 'animate__animated' : 'no-transition'
    )
    const bodyTransitionDuration = 'var(--transition-md)'

    const renderContent = () => (
      <main class="flex-1 layout-full flex flex-col min-w-0 min-h-0 overflow-hidden transition-all duration-md ease-spring bg-transparent">
        <div class="glass-base bg-sidebar/32! dark:bg-sidebar/40! ">
          <AdminBreadcrumbBar show={showBreadcrumbEffective.value} />
        </div>
        <div class="relative overflow-hidden glass-base bg-sidebar/32! dark:bg-sidebar/40! ">
          <AdminTabsBar show={showTabsEffective.value} />
        </div>
        <section class={['col-fill', 'min-w-0', 'relative', 'overflow-hidden']}>
          {/* Layer 3: 业务内容（透明以承接光晕与点阵） */}
          <AppContainer class="relative z-content min-w-0 overflow-hidden bg-transparent" />
        </section>
        <div class="glass-base bg-sidebar/32! dark:bg-sidebar/40! ">
          <AdminFooterBar show={showFooterEffective.value} />
        </div>
      </main>
    )

    const renderBody = () => {
      // horizontal：header 下方直接 content
      if (isHorizontal.value) {
        return <div class="col-fill">{renderContent()}</div>
      }

      // vertical/mix：sidebar + content
      return (
        <div class="flex-1 min-h-0 row-start overflow-hidden transition-all duration-md ease-out">
          <div class="shrink-0 self-stretch overflow-hidden transition-all duration-md ease-out glass-base bg-sidebar/32! dark:bg-sidebar/40! ">
            {showSidebarEffective.value && (
              <AdminSidebar
                mode={effectiveMode.value}
                showSidebar={showSidebarEffective.value}
                sidebarCollapse={layoutStore.sidebarCollapse}
                sidebarFixed={sidebarFixed.value}
                sidebarWidthClass={sidebarWidthClass.value}
              />
            )}
          </div>
          {renderContent()}
        </div>
      )
    }

    const renderLayout = () => {
      const bodyTransitionStyle: Record<string, string> = {
        '--animate-duration': bodyTransitionDuration,
      }
      // vertical / horizontal / mix 三种模式都渲染 Header，Body 按 mode 切换并做过渡
      // 禁止通过 v-if/三元动态拆除 Transition：否则会导致内部路由组件 Unmount/Remount
      const bodyContent = (
        <Transition
          mode="out-in"
          enterActiveClass={
            transitionName.value === 'animate__animated' ? 'animate__animated animate__fadeIn' : ''
          }
          leaveActiveClass={
            transitionName.value === 'animate__animated' ? 'animate__animated animate__fadeOut' : ''
          }
        >
          <div
            key={stableKey.value}
            class="col-fill"
            style={bodyTransitionStyle}
          >
            {renderBody()}
          </div>
        </Transition>
      )
      const drawerUpdateVisibleProps: Record<string, unknown> = {
        ['onUpdate:visible']: (val: boolean) => {
          layoutStore.mobileDrawerOpen = val
        },
      }
      return (
        <div class="layout-screen flex flex-col relative overflow-hidden">
          {showHeader.value && (
            <div class="shrink-0 row-between h-headerHeight px-xs sm:px-sm md:px-md border-b-solid border-sidebar border-1px glass-base bg-sidebar/32! dark:bg-sidebar/40!">
              <AdminHeader
                mode={stableKey.value}
                showHeader={showHeader.value}
                showLogo={showLogo.value}
                showLogoText={showLogoText.value}
                showMenu={showMenu.value}
                showTopMenuEffective={showTopMenuEffective.value}
                showDrawerTrigger={showDrawerTrigger.value}
                headerFixed={headerFixed.value}
                isDark={isDark.value}
                isAnimating={isAnimating.value}
                onToggleTheme={(event: MouseEvent) => toggleThemeWithAnimation(event)}
                showSidebarToggle={showSidebarToggle.value}
                sidebarCollapse={layoutStore.sidebarCollapse}
                onToggleCollapse={(_e: MouseEvent) => layoutStore.toggleCollapse()}
              />
            </div>
          )}
          {bodyContent}
          {/* 移动端抽屉导航：仅在 Drawer 模式下挂载，避免桌面端无意义的 VNode 开销 */}
          {isDrawerMode.value && !layoutStore.isLoading && (
            <Drawer
              visible={layoutStore.mobileDrawerOpen}
              {...drawerUpdateVisibleProps}
              position="left"
              modal
              blockScroll
              dismissable
              showCloseIcon={false}
              class="w-sidebarWidth max-w-[80vw]"
              v-slots={{
                container: () => (
                  <div class="admin-sidebar--fixed py-md layout-full flex flex-col select-none">
                    <AdminSidebarLogo />
                    <CScrollbar class="col-fill px-md">
                      <AdminSidebarMenu sidebarCollapse={false} />
                    </CScrollbar>
                  </div>
                ),
              }}
            />
          )}
        </div>
      )
    }
    return () => (
      <ContextMenuProvider
        scope="global"
        beforeOpen={({ target }) => {
          if (!(target instanceof HTMLElement)) return true
          if (target.closest('[data-admin-tabs-bar="true"]') != null) return false
          if (target.closest('[data-admin-tabs-context-menu="true"]') != null) return false
          return true
        }}
        v-slots={{
          menu: ({ close, event }: { close: () => void; event: MouseEvent }) => (
            <div class="min-w-[var(--spacing-4xl)] rounded-md p-xs flex flex-col gap-xs select-none">
              {/* 重新载入 */}
              <div
                class="flex items-center gap-sm px-sm py-xs rounded-md text-sm hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors duration-md"
                onClick={() => {
                  onContextReload()
                  close()
                }}
              >
                <Icons
                  name="i-lucide-rotate-cw"
                  size="sm"
                />
                <span>{t('layout.reload')}</span>
              </div>

              {/* 设置 */}
              <div
                class="flex items-center gap-sm px-sm py-xs rounded-md text-sm hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors duration-md"
                onClick={() => {
                  openGlobalSettings()
                  close()
                }}
              >
                <Icons
                  name="i-lucide-settings-2"
                  size="sm"
                />
                <span>{t('layout.globalSettings')}</span>
              </div>

              {/* 动态切换深/浅色模式 */}
              <div
                class="flex items-center gap-sm px-sm py-xs rounded-md text-sm hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors duration-md"
                onClick={() => {
                  onContextToggleTheme(event)
                  close()
                }}
              >
                <Icons
                  name={isDark.value ? 'i-lucide-sun' : 'i-lucide-moon'}
                  size="sm"
                />
                <span>{contextThemeToggleLabel.value}</span>
              </div>
            </div>
          ),
        }}
      >
        {renderLayout()}
      </ContextMenuProvider>
    )
  },
})
