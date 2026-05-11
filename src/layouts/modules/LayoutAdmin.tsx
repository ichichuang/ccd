import { defineComponent, Transition } from 'vue'
import { useI18n } from 'vue-i18n'
import Drawer from 'primevue/drawer'
import { useRoute } from 'vue-router'
import AppContainer from '@&/AppContainer.vue'
import { useLayoutStore } from '@/stores/modules/system'
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
import { useLayoutRuntime } from '@/hooks/layout/useLayoutRuntime'
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
    const runtime = useLayoutRuntime()
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
        runtime.closeTransientNavigation()
      }
    )

    const renderContent = () => (
      <main
        data-layout-content="true"
        class={[
          'flex-1 layout-full col-between min-w-0 min-h-0 overflow-hidden transform-gpu',
          runtime.isSidebarAnimating.value ? 'will-change-transform' : '',
        ]}
      >
        <div class="bg-sidebar/36! dark:bg-sidebar/40!">
          <AdminBreadcrumbBar
            show={runtime.showBreadcrumb.value}
            showIcon={runtime.showBreadcrumbIcon.value}
          />
          <AdminTabsBar show={runtime.showTabs.value} />
        </div>
        <section class={['col-fill', 'min-w-0', 'relative', 'overflow-hidden']}>
          {/* Layer 3: 业务内容（透明以承接光晕与点阵） */}
          <AppContainer class="relative z-content min-w-0 overflow-hidden" />
        </section>
        <div class="bg-sidebar/36! dark:bg-sidebar/40!">
          <AdminFooterBar show={runtime.showFooter.value} />
        </div>
      </main>
    )

    const renderBody = () => {
      // horizontal：header 下方直接 content
      if (runtime.effectiveMode.value === 'horizontal') {
        return <div class="col-fill">{renderContent()}</div>
      }

      // vertical/mix：sidebar + content
      return (
        <div class="flex-1 min-h-0 row-start overflow-hidden relative">
          {runtime.sidebarVisible.value && (
            <div
              data-layout-sidebar="true"
              ref={runtime.sidebarShellRef}
              class={[
                runtime.visualSidebarCollapsed.value ? 'w-sidebarCollapsedWidth' : 'w-sidebarWidth',
                'shrink-0 self-stretch overflow-hidden bg-sidebar/36! dark:bg-sidebar/40!',
                runtime.enableTransition.value ? 'transition-[width] duration-md ease-smooth' : '',
              ]}
              onTransitionend={runtime.onSidebarTransitionEnd}
            >
              <AdminSidebar
                showSidebar={runtime.showSidebar.value}
                sidebarCollapse={runtime.actualSidebarCollapsed.value}
                sidebarVisualCollapse={runtime.visualSidebarCollapsed.value}
                sidebarFixed={runtime.sidebarFixed.value}
                sidebarWidthClass="w-full"
                enableTransition={runtime.enableTransition.value}
                isAnimating={runtime.isSidebarAnimating.value}
                sidebarAnimationPhase={runtime.sidebarAnimationPhase.value}
              />
            </div>
          )}
          {renderContent()}
        </div>
      )
    }

    const renderLayout = () => {
      // vertical / horizontal / mix 三种模式都渲染 Header，Body 按 mode 切换并做过渡
      // 禁止通过 v-if/三元动态拆除 Transition：否则会导致内部路由组件 Unmount/Remount
      const bodyContent = (
        <Transition
          mode="out-in"
          enterActiveClass={
            runtime.bodyTransitionName.value === 'animate__animated'
              ? 'animate__animated animate__fadeIn'
              : ''
          }
          leaveActiveClass={
            runtime.bodyTransitionName.value === 'animate__animated'
              ? 'animate__animated animate__fadeOut'
              : ''
          }
        >
          <div
            key={runtime.stableModeKey.value}
            class="col-fill"
            style={runtime.bodyTransitionStyle.value}
          >
            {renderBody()}
          </div>
        </Transition>
      )
      const drawerUpdateVisibleProps: Record<string, unknown> = {
        ['onUpdate:visible']: (val: boolean) => {
          runtime.setDrawerOpen(val)
        },
      }
      return (
        <div
          data-layout-shell="admin"
          data-layout-mode={runtime.effectiveMode.value}
          data-sidebar-mode={runtime.sidebarMode.value}
          data-drawer-mode={runtime.useDrawer.value ? 'true' : 'false'}
          class="layout-screen flex flex-col relative overflow-hidden"
          style={runtime.shellSafeAreaStyle.value}
        >
          {runtime.showHeader.value && (
            <div
              data-layout-header="true"
              class="shrink-0 row-between h-headerHeight px-sm md:px-md border-b-solid border-sidebar border-px bg-sidebar/36! dark:bg-sidebar/40!"
            >
              <AdminHeader
                mode={runtime.stableModeKey.value}
                showHeader={runtime.showHeader.value}
                showLogo={runtime.showLogo.value}
                showLogoText={runtime.showLogoText.value}
                showMenu={runtime.showMenu.value}
                showTopMenuEffective={runtime.showTopMenu.value}
                showDrawerTrigger={runtime.useDrawer.value}
                showFullscreenAction={runtime.showFullscreenAction.value}
                showHeaderThemeAction={runtime.showHeaderThemeAction.value}
                showCompactThemeAction={runtime.showCompactThemeAction.value}
                headerFixed={runtime.headerFixed.value}
                isDark={isDark.value}
                isAnimating={isAnimating.value}
                onToggleDrawer={runtime.toggleDrawer}
                onToggleTheme={(event: MouseEvent) => toggleThemeWithAnimation(event)}
                showSidebarToggle={runtime.showSidebarToggle.value}
                sidebarCollapse={runtime.sidebarCollapsed.value}
                onToggleCollapse={runtime.toggleSidebarCollapse}
              />
            </div>
          )}
          {bodyContent}
          {/* 移动端抽屉导航：仅在 Drawer 模式下挂载，避免桌面端无意义的 VNode 开销 */}
          {runtime.useDrawer.value && !runtime.isLoading.value && (
            <Drawer
              visible={runtime.drawerOpen.value}
              {...drawerUpdateVisibleProps}
              position="left"
              modal
              blockScroll
              dismissable
              showCloseIcon={false}
              class="w-sidebarWidth max-w-[80vw] p-0!"
              style={runtime.drawerRootStyle.value}
              v-slots={{
                container: () => (
                  <div
                    data-layout-drawer="true"
                    class="admin-sidebar--fixed layout-full min-h-0 flex flex-col select-none"
                    style={runtime.drawerSafeAreaStyle.value}
                  >
                    <AdminSidebarLogo />
                    <CScrollbar
                      class="col-fill min-h-0 px-sm"
                      options={{
                        overflow: {
                          x: 'hidden',
                        },
                      }}
                    >
                      <AdminSidebarMenu
                        sidebarCollapse={false}
                        density="compact"
                      />
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
