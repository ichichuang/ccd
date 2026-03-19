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

    // --- 响应式适配：仅协调侧栏/抽屉；布局模式由 layoutStore.effectiveMode 派生 ---
    function runAdaptive() {
      const force = !layoutStore.userAdjusted
      // runAdaptive 不再修改布局模式，mode 由 layoutStore.effectiveMode 响应式派生
      if (deviceStore.type === 'PC') {
        layoutStore.adaptPcByOrientation(deviceStore.orientation)
        if (layoutStore.showSidebar) {
          layoutStore.adaptPcByBreakpoint(deviceStore.currentBreakpoint, force)
        }
        return
      }

      if (deviceStore.type === 'Tablet') {
        if (deviceStore.isMobileLayout) {
          layoutStore.adaptToTablet(true, true)
        } else {
          layoutStore.adaptToTablet(false, true)
          if (layoutStore.showSidebar) {
            layoutStore.adaptPcByBreakpoint(deviceStore.currentBreakpoint, force)
          }
        }
        return
      }

      if (deviceStore.isMobileLayout) {
        layoutStore.adaptToMobile(true, true)
        return
      }

      // Mobile 大视口：恢复侧栏模式，再按断点收展
      layoutStore.adaptToMobile(false, true)
      if (layoutStore.showSidebar) {
        layoutStore.adaptPcByBreakpoint(deviceStore.currentBreakpoint, force)
      }
    }

    onMounted(() => {
      layoutStore.migrateLegacyVisibilityIfNeeded()
      runAdaptive()
    })

    watch(
      () => [
        deviceStore.isMobileLayout,
        deviceStore.isTabletLayout,
        deviceStore.isPCLayout,
        deviceStore.currentBreakpoint,
        deviceStore.type,
        deviceStore.orientation,
      ],
      () => runAdaptive()
    )

    watch(
      () => route.path,
      () => {
        if (layoutStore.mobileDrawerOpen) {
          layoutStore.mobileDrawerOpen = false
        }
      }
    )

    // --- AdminLayoutMode：结构模式（三态状态机）---
    const mode = computed(() => layoutStore.mode)
    const isHorizontal = computed(() => mode.value === 'horizontal')
    // Drawer Zone (< 768px): xs and sm MUST trigger Drawer to avoid Top Menu overflow
    const isDrawerMode = computed(
      () =>
        (deviceStore.type === 'Mobile' || ['xs', 'sm'].includes(deviceStore.currentBreakpoint)) &&
        mode.value === 'horizontal'
    )
    const showDrawerTrigger = computed(() => isDrawerMode.value)

    // --- 展示开关（store 仅由配置面板控制）---
    const showHeader = computed(() => layoutStore.showHeader)
    const showLogo = computed(() => layoutStore.showLogo)
    const showMenu = computed(() => layoutStore.showMenu)
    // Top menu in header: horizontal/mix and not Drawer mode
    const showTopMenuEffective = computed(
      () =>
        layoutStore.showMenu &&
        (mode.value === 'horizontal' || mode.value === 'mix') &&
        !isDrawerMode.value
    )
    // Logo text: Drawer Zone always show; Tablet always; PC narrow (md/lg) hide for Top Menu
    const showLogoText = computed(() => {
      const type = deviceStore.type
      const bp = deviceStore.currentBreakpoint

      // 1. Drawer Zone (< 768px or Mobile): ALWAYS show text
      if (type === 'Mobile' || ['xs', 'sm'].includes(bp)) return true

      // 2. Tablet: Always show text, even when falling back to Top Menu
      if (type === 'Tablet') return true

      // 3. PC Narrow (md, lg): HIDE text to save space for Top Menu
      if (type === 'PC' && ['md', 'lg'].includes(bp)) return false

      // 4. Wide screens: Show text
      return true
    })

    // --- 有效显隐：仅非 PC 且小视口时强制隐藏侧栏等；PC 端完全由配置面板控制，仅按断点收展 ---
    const showSidebarEffective = computed(() =>
      deviceStore.type === 'PC'
        ? layoutStore.showSidebar
        : isDrawerMode.value
          ? false
          : layoutStore.showSidebar
    )
    const showTabsEffective = computed(() =>
      deviceStore.type === 'PC'
        ? layoutStore.showTabs
        : isDrawerMode.value
          ? false
          : layoutStore.showTabs
    )
    const showBreadcrumbEffective = computed(() =>
      deviceStore.type === 'PC'
        ? layoutStore.showBreadcrumb
        : isDrawerMode.value
          ? false
          : layoutStore.showBreadcrumb
    )
    const showFooterEffective = computed(() =>
      deviceStore.type === 'PC'
        ? layoutStore.showFooter
        : isDrawerMode.value
          ? false
          : layoutStore.showFooter
    )

    const showSidebarToggle = computed(
      () => showSidebarEffective.value && (mode.value === 'vertical' || mode.value === 'mix')
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
      <main class="col-fill min-w-0 bg-sidebar">
        <AdminBreadcrumbBar show={showBreadcrumbEffective.value} />
        <AdminTabsBar show={showTabsEffective.value} />
        <section class="flex-1 min-h-0 overflow-hidden rounded-2xl bg-background">
          <AppContainer />
        </section>
        <div class="bg-sidebar shrink-0">
          <AdminFooterBar show={showFooterEffective.value} />
        </div>
      </main>
    )

    const renderBody = () => {
      // horizontal：header 下方直接 content
      if (isHorizontal.value) {
        return <div class="col-fill bg-background">{renderContent()}</div>
      }

      // vertical/mix：sidebar + content
      return (
        <div class="flex-1 min-h-0 flex overflow-hidden bg-sidebar">
          <AdminSidebar
            mode={mode.value}
            showSidebar={showSidebarEffective.value}
            sidebarCollapse={layoutStore.sidebarCollapse}
            sidebarFixed={sidebarFixed.value}
            sidebarWidthClass={sidebarWidthClass.value}
          />
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
            key={mode.value}
            class="col-fill bg-background"
            style={bodyTransitionStyle}
          >
            {renderBody()}
          </div>
        </Transition>
      ) : (
        <div class="col-fill bg-background">{renderBody()}</div>
      )
      const drawerUpdateVisibleProps: Record<string, unknown> = {
        ['onUpdate:visible']: (val: boolean) => {
          layoutStore.mobileDrawerOpen = val
        },
      }
      return (
        <div class="flex flex-col  h-full">
          <AdminHeader
            mode={mode.value}
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
          {bodyContent}
          {/* 移动端抽屉导航：仅在 Drawer 模式下挂载，避免桌面端无意义的 VNode 开销 */}
          {isDrawerMode.value && (
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
                  <div class="admin-sidebar--fixed py-padding-md col-fill select-none bg-background text-foreground">
                    <AdminSidebarLogo />
                    <div class="col-fill">
                      <CScrollbar class="col-fill px-padding-md">
                        <AdminSidebarMenu sidebarCollapse={false} />
                      </CScrollbar>
                    </div>
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
        v-slots={{
          menu: ({ close, event }: { close: () => void; event: MouseEvent }) => (
            <div class="min-w-[var(--spacing-4xl)] surface-elevated rounded-scale-md p-padding-xs col-stack-xs select-none">
              {/* 重新载入 */}
              <div
                class="row-y-center gap-sm px-padding-sm py-padding-xs rounded-scale-md fs-sm text-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors duration-scale-md"
                onClick={() => {
                  onContextReload()
                  close()
                }}
              >
                <Icons
                  name="i-lucide-rotate-cw"
                  size="sm"
                  class="text-inherit!"
                />
                <span>{t('layout.reload')}</span>
              </div>

              {/* 设置 */}
              <div
                class="row-y-center gap-sm px-padding-sm py-padding-xs rounded-scale-md fs-sm text-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors duration-scale-md"
                onClick={() => {
                  openGlobalSettings()
                  close()
                }}
              >
                <Icons
                  name="i-lucide-settings-2"
                  size="sm"
                  class="text-inherit!"
                />
                <span>{t('layout.globalSettings')}</span>
              </div>

              {/* 动态切换深/浅色模式 */}
              <div
                class="row-y-center gap-sm px-padding-sm py-padding-xs rounded-scale-md fs-sm text-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors duration-scale-md"
                onClick={() => {
                  onContextToggleTheme(event)
                  close()
                }}
              >
                <Icons
                  name={isDark.value ? 'i-lucide-sun' : 'i-lucide-moon'}
                  size="sm"
                  class="text-inherit!"
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
