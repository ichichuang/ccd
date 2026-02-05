<script setup lang="ts">
import AppContainer from '@&/AppContainer.vue'
import { useLayoutStore } from '@/stores/modules/layout'
import { useDeviceStore } from '@/stores/modules/device'
import { useDateUtils } from '@/hooks/modules/useDateUtils'
import GlobalSetting from '@/layouts/components/GlobalSetting/index.vue'

defineOptions({ name: 'LayoutAdmin' })

const layoutStore = useLayoutStore()
const deviceStore = useDeviceStore()
const { getAvailableTimezones, isInitialized } = useDateUtils()

// 时区选项：DateUtils 初始化后从 getAvailableTimezones 加载
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
  layoutStore.adaptToMobile(deviceStore.isMobileLayout, force)
  layoutStore.adaptToTablet(deviceStore.isTabletLayout, force)
}

onMounted(() => {
  runAdaptive(true)
})

watch(
  () => [deviceStore.isMobileLayout, deviceStore.isTabletLayout, deviceStore.isPCLayout],
  () => runAdaptive(false)
)

// --- AdminLayoutMode：结构模式 ---
const isHorizontal = computed(() => layoutStore.mode === 'horizontal')
const isMix = computed(() => layoutStore.mode === 'mix')

// --- 展示开关 ---
const showHeader = computed(() => layoutStore.showHeader)
const showSidebar = computed(() => layoutStore.showSidebar)
const showBreadcrumb = computed(() => layoutStore.showBreadcrumb)
const showTabs = computed(() => layoutStore.showTabs)
const showFooter = computed(() => layoutStore.showFooter)
const showLogo = computed(() => layoutStore.showLogo)
const showMenu = computed(() => layoutStore.showMenu)

// --- 固定行为 ---
const headerFixed = computed(() => layoutStore.headerFixed)
const sidebarFixed = computed(() => layoutStore.sidebarFixed)

// --- 侧边栏宽度：只用尺寸系统变量类名 ---
const sidebarWidthClass = computed(() =>
  layoutStore.sidebarCollapse ? 'w-sidebarCollapsedWidth' : 'w-sidebarWidth'
)
</script>
<template>
  <div class="container min-h-screen flex flex-col overflow-hidden">
    <!-- Header：高度来自 h-headerHeight -->
    <header
      v-if="showHeader"
      :class="[
        'w-full h-headerHeight flex items-center justify-between px-padding-lg py-padding-md border-b border-border bg-background/95 backdrop-blur',
        headerFixed ? 'admin-header--fixed' : '',
      ]"
    >
      <!-- 左侧：Logo/标题（占位） -->
      <div class="flex items-center gap-scale-md min-w-0">
        <div
          v-if="showLogo"
          class="flex items-center gap-scale-sm min-w-0"
        >
          <div class="rounded-scale bg-primary/10 text-primary px-scale-sm py-scale-xs">
            <span class="fs-sm font-semibold">CCD</span>
          </div>
          <div class="min-w-0 text-ellipsis">
            <span class="fs-sm font-medium">Admin</span>
          </div>
        </div>
        <div
          v-else
          class="fs-sm font-medium"
        >
          Admin
        </div>
      </div>

      <!-- 中间：Top Menu（horizontal/mix 更常用；占位容器） -->
      <nav
        v-if="showMenu && (isHorizontal || isMix)"
        class="flex-1 min-w-0 px-padding-lg"
      >
        <div class="h-full flex items-center gap-scale-md fs-sm text-muted-foreground">
          <span class="text-ellipsis">Top Menu Slot</span>
        </div>
      </nav>

      <!-- 右侧：语言 / 时区 / 主题 / 尺寸 / 布局 模式切换 + 侧栏收起 -->
      <div class="flex items-center gap-gap-sm">
        <!-- 全局设置悬浮入口 (Floating Settings Trigger) -->
        <GlobalSetting />
      </div>
    </header>

    <!-- Body：vertical/mix = sidebar + content；horizontal = content 为主 -->
    <div
      class="flex-1 min-h-0 overflow-hidden"
      :class="isHorizontal ? 'flex flex-col' : 'flex'"
    >
      <!-- Sidebar（仅 vertical/mix 逻辑展示；horizontal 通常不需要侧栏） -->
      <aside
        v-if="showSidebar && !isHorizontal"
        :class="[
          'shrink-0 h-full border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-scale-md overflow-hidden',
          sidebarWidthClass,
          sidebarFixed ? 'admin-sidebar--fixed' : '',
        ]"
      >
        <!-- Sidebar 内部占位：后续替换为真实菜单组件 -->
        <div class="full flex flex-col">
          <div
            class="h-breadcrumbHeight flex items-center px-padding-md border-b border-sidebar-border/60"
          >
            <span class="fs-sm text-ellipsis">
              {{ layoutStore.sidebarCollapse ? 'Menu' : 'Sidebar Menu Slot' }}
            </span>
          </div>
          <div class="flex-1 min-h-0 overflow-auto p-padding-md">
            <div class="stack fs-sm text-sidebar-foreground/80">
              <div class="rounded-scale bg-sidebar-accent/30 p-scale-md">Item 1</div>
              <div class="rounded-scale bg-sidebar-accent/20 p-scale-md">Item 2</div>
              <div class="rounded-scale bg-sidebar-accent/10 p-scale-md">Item 3</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Content：尺寸由 header/tabs/footer 的 CSS 变量计算，不写任何 px -->
      <main class="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-background">
        <!-- Breadcrumb（占位容器）：高度来自 h-breadcrumbHeight -->
        <div
          v-if="showBreadcrumb"
          class="w-full h-breadcrumbHeight flex items-center px-padding-lg border-b border-border"
        >
          <div class="flex items-center gap-scale-sm min-w-0 fs-sm text-muted-foreground">
            <span class="text-ellipsis">Breadcrumb Slot</span>
          </div>
        </div>

        <!-- Tabs（占位容器）：高度来自 h-tabsHeight -->
        <div
          v-if="showTabs"
          class="w-full h-tabsHeight flex items-center px-padding-lg border-b border-border"
        >
          <div class="flex items-center gap-scale-sm min-w-0 fs-sm text-muted-foreground">
            <span class="text-ellipsis">Tabs Slot</span>
          </div>
        </div>

        <!-- Router Content：滚动由 AppContainer 内部 CScrollbar 负责 -->
        <section class="flex-1 min-h-0 overflow-hidden">
          <AppContainer />
        </section>

        <!-- Footer：高度来自 h-footerHeight -->
        <footer
          v-if="showFooter"
          class="w-full h-footerHeight flex items-center justify-center px-padding-lg border-t border-border fs-sm text-muted-foreground"
        >
          <span class="text-ellipsis">Footer Slot</span>
        </footer>
      </main>
    </div>
  </div>
</template>
<style lang="scss" scoped>
/**
 * 只允许使用系统定义的 CSS 变量，不写任何固定像素值。
 * 这里仅补足 Uno 类名不方便表达的 sticky/top/height calc。
 */
.admin-header--fixed {
  position: sticky;
  top: 0;
  z-index: 10;
}

.admin-sidebar--fixed {
  position: sticky;
  top: var(--header-height);
  height: calc(100vh - var(--header-height));
}
</style>
