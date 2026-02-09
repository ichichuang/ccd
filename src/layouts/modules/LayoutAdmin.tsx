import { computed, defineComponent, Transition } from 'vue'
import AppContainer from '@&/AppContainer.vue'
import { useLayoutStore } from '@/stores/modules/layout'
import { useDeviceStore } from '@/stores/modules/device'
import { useDateUtils } from '@/hooks/modules/useDateUtils'
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'
import AdminHeader from '@&/admin/AdminHeader'
import AdminSidebar from '@&/admin/AdminSidebar'
import AdminBreadcrumbBar from '@&/admin/AdminBreadcrumbBar'
import AdminTabsBar from '@&/admin/AdminTabsBar'
import AdminFooterBar from '@&/admin/AdminFooterBar'

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
    const layoutStore = useLayoutStore()
    const deviceStore = useDeviceStore()
    const { getAvailableTimezones, isInitialized } = useDateUtils()
    const { isDark, isAnimating, toggleThemeWithAnimation } = useThemeSwitch()

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

    // --- 响应式适配：逻辑下沉在 store，这里只负责触发 ---
    function runAdaptive(force = false) {
      // 先移动端再平板（两者互斥，但顺序固定更清晰）
      // [FIX] 使用 Layout 判定 (Width-based) 以响应视口变化 (含 DevTools 模拟)
      // DeviceStore 初始化已修复，不会导致首屏误判
      layoutStore.adaptToMobile(deviceStore.isMobileLayout, force)
      layoutStore.adaptToTablet(deviceStore.isTabletLayout, force)
    }

    onMounted(() => {
      // 旧版持久化数据迁移：showXxx(root) -> visibilitySettings[mode].showXxx
      layoutStore.migrateLegacyVisibilityIfNeeded()
      // 启动时尝试适配（不强制，尊重点持久化的 userAdjusted）
      runAdaptive(false)
    })

    watch(
      () => [deviceStore.isMobileLayout, deviceStore.isTabletLayout, deviceStore.isPCLayout],
      () => runAdaptive(false)
    )

    // --- AdminLayoutMode：结构模式 ---
    const mode = computed(() => layoutStore.mode)
    const isHorizontal = computed(() => mode.value === 'horizontal')

    // --- 展示开关 ---
    const showHeader = computed(() => layoutStore.showHeader)
    const showSidebar = computed(() => layoutStore.showSidebar)
    const showBreadcrumb = computed(() => layoutStore.showBreadcrumb)
    const showTabs = computed(() => layoutStore.showTabs)
    const showFooter = computed(() => layoutStore.showFooter)
    const showLogo = computed(() => layoutStore.showLogo)
    const showMenu = computed(() => layoutStore.showMenu)

    const showSidebarToggle = computed(
      () => showSidebar.value && (mode.value === 'vertical' || mode.value === 'mix')
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
        <AdminBreadcrumbBar show={showBreadcrumb.value} />
        <AdminTabsBar show={showTabs.value} />
        <section class="flex-1 min-h-0 overflow-hidden">
          <AppContainer />
        </section>
        <AdminFooterBar show={showFooter.value} />
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
            showSidebar={showSidebar.value}
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
        <div class="container min-h-screen flex flex-col overflow-hidden">
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

    return () => renderLayout()
  },
})
