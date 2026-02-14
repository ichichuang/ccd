import { computed, defineComponent, ref, Transition, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppContainer from '@&/AppContainer.vue'
import { useLayoutStore } from '@/stores/modules/layout'
import { useDeviceStore } from '@/stores/modules/device'
import { useDateUtils } from '@/hooks/modules/useDateUtils'
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'
import ContextMenuProvider from '@/layouts/components/ContextMenuProvider.vue'
import SettingsContent from '@/layouts/components/GlobalSetting/SettingsContent.vue'
import { useDialog } from '@/hooks/modules/useDialog'
import { refreshCurrentRoute } from '@/router/utils/helper'
import AdminHeader from '@&/admin/AdminHeader'
import AdminSidebar from '@&/admin/AdminSidebar'
import AdminBreadcrumbBar from '@&/admin/AdminBreadcrumbBar'
import AdminTabsBar from '@&/admin/AdminTabsBar'
import AdminFooterBar from '@&/admin/AdminFooterBar'
import { Icons } from '@/components/Icons'

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
    const timezoneOptions = ref<
      { name: string; countryCode: string; currentTimeOffsetInMinutes: number }[]
    >([])
    watch(
      isInitialized,
      v => {
        if (v) timezoneOptions.value = getAvailableTimezones(false) as typeof timezoneOptions.value
      },
      { immediate: true }
    )

    // --- 响应式适配：PC 横竖屏+断点（尊重 userAdjusted）；Tablet 分支接入 adaptToTablet；Mobile 大视口恢复侧栏 ---
    function runAdaptive() {
      const forceByUserPreference = !layoutStore.userAdjusted

      if (deviceStore.type === 'PC') {
        layoutStore.adaptPcByOrientation(deviceStore.orientation)
        if (layoutStore.showSidebar) {
          layoutStore.adaptPcByBreakpoint(deviceStore.currentBreakpoint, forceByUserPreference)
        }
        return
      }

      if (deviceStore.type === 'Tablet') {
        if (deviceStore.isMobileLayout) {
          layoutStore.adaptToTablet(true, true)
        } else {
          layoutStore.adaptToTablet(false, true)
          if (layoutStore.showSidebar) {
            layoutStore.adaptPcByBreakpoint(deviceStore.currentBreakpoint, forceByUserPreference)
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
        layoutStore.adaptPcByBreakpoint(deviceStore.currentBreakpoint, forceByUserPreference)
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

    // --- AdminLayoutMode：结构模式 ---
    const mode = computed(() => layoutStore.mode)
    const isHorizontal = computed(() => mode.value === 'horizontal')

    // --- 展示开关（store 仅由配置面板控制）---
    const showHeader = computed(() => layoutStore.showHeader)
    const showLogo = computed(() => layoutStore.showLogo)
    const showMenu = computed(() => layoutStore.showMenu)

    // --- 有效显隐：仅非 PC 且小视口时强制隐藏侧栏等；PC 端完全由配置面板控制，仅按断点收展 ---
    const showSidebarEffective = computed(() =>
      deviceStore.type === 'PC'
        ? layoutStore.showSidebar
        : deviceStore.isMobileLayout
          ? false
          : layoutStore.showSidebar
    )
    const showTabsEffective = computed(() =>
      deviceStore.type === 'PC'
        ? layoutStore.showTabs
        : deviceStore.isMobileLayout
          ? false
          : layoutStore.showTabs
    )
    const showBreadcrumbEffective = computed(() =>
      deviceStore.type === 'PC'
        ? layoutStore.showBreadcrumb
        : deviceStore.isMobileLayout
          ? false
          : layoutStore.showBreadcrumb
    )
    const showFooterEffective = computed(() =>
      deviceStore.type === 'PC'
        ? layoutStore.showFooter
        : deviceStore.isMobileLayout
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
    const bodyTransitionDuration = 'var(--transition-lg)'

    const renderContent = () => (
      <main class="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-background">
        <AdminBreadcrumbBar show={showBreadcrumbEffective.value} />
        <AdminTabsBar show={showTabsEffective.value} />
        <section class="flex-1 min-h-0 overflow-hidden">
          <AppContainer />
        </section>
        <AdminFooterBar show={showFooterEffective.value} />
      </main>
    )

    const renderBody = () => {
      // horizontal：header 下方直接 content
      if (isHorizontal.value) {
        return <div class="flex-1 min-h-0 overflow-hidden flex flex-col">{renderContent()}</div>
      }

      // vertical/mix：sidebar + content
      return (
        <div class="flex-1 min-h-0 overflow-hidden flex">
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
      // vertical / horizontal / mix 三种模式都渲染 Header，Body 按 mode 切换并做过渡
      const bodyContent = enableTransition.value ? (
        <Transition
          mode="out-in"
          enterActiveClass="animate__animated animate__fadeIn"
          leaveActiveClass="animate__animated animate__fadeOut"
        >
          <div
            key={mode.value}
            class="flex-1 min-h-0 overflow-hidden flex flex-col"
            style={{ '--animate-duration': bodyTransitionDuration } as Record<string, string>}
          >
            {renderBody()}
          </div>
        </Transition>
      ) : (
        <div class="flex-1 min-h-0 overflow-hidden flex flex-col">{renderBody()}</div>
      )
      return (
        <div class="flex flex-col overflow-hidden h-full">
          <AdminHeader
            mode={mode.value}
            showHeader={showHeader.value}
            showLogo={showLogo.value}
            showMenu={showMenu.value}
            headerFixed={headerFixed.value}
            isDark={isDark.value}
            isAnimating={isAnimating.value}
            onToggleTheme={(event: MouseEvent) => toggleThemeWithAnimation(event)}
            showSidebarToggle={showSidebarToggle.value}
            sidebarCollapse={layoutStore.sidebarCollapse}
            onToggleCollapse={(_e: MouseEvent) => layoutStore.toggleCollapse()}
          />
          {bodyContent}
        </div>
      )
    }
    return () => (
      <ContextMenuProvider
        scope="global"
        v-slots={{
          menu: ({ close, event }: { close: () => void; event: MouseEvent }) => (
            <div class="min-w-[var(--spacing-4xl)] bg-card border border-border/50 shadow-xl rounded-scale-md p-padding-xs flex flex-col gap-xs select-none">
              {/* 重新载入 */}
              <div
                class="flex items-center gap-sm px-padding-sm py-padding-xs rounded-scale-md fs-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors duration-scale-md"
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
                class="flex items-center gap-sm px-padding-sm py-padding-xs rounded-scale-md fs-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors duration-scale-md"
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
                class="flex items-center gap-sm px-padding-sm py-padding-xs rounded-scale-md fs-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors duration-scale-md"
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
