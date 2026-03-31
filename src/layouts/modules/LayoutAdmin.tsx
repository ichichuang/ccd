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
        width: 'auto',
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
    const isHorizontal = computed(() => effectiveMode.value === 'horizontal')
    const showDrawerTrigger = computed(() => isDrawerMode.value)

    // --- 展示开关（store 仅由配置面板控制）---
    const showHeader = computed(() => layoutStore.showHeader)
    const showLogo = computed(() => layoutStore.showLogo)
    const showMenu = computed(() => layoutStore.showMenu)
    // 首屏 handoff 期间禁止渲染高饱和度环境光球，避免在遮罩切换时出现整屏色洗
    const showAmbientOrbs = computed<boolean>(() => !layoutStore.isLoading)
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
    const enableTransition = computed(() => layoutStore.enableTransition)
    const bodyTransitionDuration = 'var(--transition-md)'

    const renderContent = () => (
      <main class="flex-1 layout-full flex flex-col min-w-0 min-h-0 overflow-hidden transition-all duration-md ease-spring bg-transparent">
        <div class="backdrop-blur-md bg-sidebar">
          <AdminBreadcrumbBar show={showBreadcrumbEffective.value} />
        </div>
        <div class="backdrop-blur-md bg-sidebar">
          <AdminTabsBar show={showTabsEffective.value} />
        </div>
        <section class={['col-fill', 'min-w-0', 'bg-transparent']}>
          <AppContainer class="min-w-0 overflow-hidden" />
        </section>
        <div class="backdrop-blur-md bg-sidebar">
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
          <div class="shrink-0 self-stretch overflow-hidden transition-all duration-md ease-out bg-sidebar backdrop-blur">
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
      const bodyContent = enableTransition.value ? (
        <Transition
          mode="out-in"
          enterActiveClass="animate__animated animate__fadeIn"
          leaveActiveClass="animate__animated animate__fadeOut"
        >
          <div
            key={effectiveMode.value}
            class="col-fill"
            style={bodyTransitionStyle}
          >
            {renderBody()}
          </div>
        </Transition>
      ) : (
        <div class="col-fill">{renderBody()}</div>
      )
      const drawerUpdateVisibleProps: Record<string, unknown> = {
        ['onUpdate:visible']: (val: boolean) => {
          layoutStore.mobileDrawerOpen = val
        },
      }
      return (
        <div class="layout-screen flex flex-col relative overflow-hidden">
          {/* Z0: Canvas base + ambient orbs — behind all content */}
          <div
            class="absolute inset-0 z-base pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            <div class="absolute inset-0 bg-background" />
            <div
              class={[
                'absolute inset-0 transition-opacity duration-700 ease-out',
                showAmbientOrbs.value ? 'opacity-100' : 'opacity-0',
              ]}
            >
              <div class="absolute -top-1/4 -left-1/4 w-[65vw] h-[65vw] rounded-full bg-primary/[0.06] blur-[100px] animate-orb-drift" />
              <div class="absolute -bottom-1/4 -right-1/4 w-[55vw] h-[55vw] rounded-full bg-accent/[0.05] blur-[55px] animate-orb-drift-alt" />
              <div class="absolute top-[35%] left-[25%] w-[42vw] h-[42vw] rounded-full bg-info/[0.035] blur-[45px] animate-orb-pulse" />
            </div>
          </div>
          {showHeader.value && (
            <div class="shrink-0 row-between h-headerHeight px-xs sm:px-sm md:px-md border-b-solid border-border bg-sidebar backdrop-blur">
              <AdminHeader
                mode={effectiveMode.value}
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
          {isDrawerMode.value && showAmbientOrbs.value && (
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
