<script setup lang="ts">
import { computed, watch } from 'vue'
import { useDeviceStore } from '@/stores/modules/device'
import { useLayoutStore } from '@/stores/modules/layout'
import AppContainer from '@&/AppContainer.vue'

defineOptions({ name: 'LayoutAdmin' })

const deviceStore = useDeviceStore()
const layoutStore = useLayoutStore()

// --- 响应式联动逻辑 (The Bridge) ---
// 1. 移动端适配
// 移动端：强制适配
// PC端：不做任何修改，完全信任持久化数据 (adaptToMobile(false) 内部为空逻辑)
watch(
  () => deviceStore.isMobileLayout,
  isMobile => {
    layoutStore.adaptToMobile(isMobile)
  },
  { immediate: true } // 初始化时立即执行一次
)

// 2. 平板适配
// 注意：平板适配只在进入平板模式时执行，退出平板模式时由 adaptToMobile(false) 处理恢复逻辑
watch(
  () => deviceStore.isTabletLayout,
  isTablet => {
    if (isTablet) {
      layoutStore.adaptToTablet(true)
    }
    // 当从平板切换到PC时，isTablet 变为 false，此时 adaptToMobile(false) 已经处理了恢复逻辑
  },
  { immediate: true }
)

// --- 动态样式类 ---
const layoutClasses = computed(() => ({
  'layout-mobile': deviceStore.isMobileLayout,
  'layout-sidebar-collapse': layoutStore.sidebarCollapse,
  [`layout-mode-${layoutStore.mode}`]: true,
}))
</script>

<template>
  <div
    class="app-wrapper"
    :class="layoutClasses"
  >
    <!-- Sidebar 区域 -->
    <aside
      v-if="layoutStore.showSidebar"
      class="sidebar-container"
    >
      <!-- TODO: 替换为实际的 Sidebar 组件 -->
      <!-- <LayoutSidebar /> -->
      <div class="sidebar-placeholder">
        <div class="text-sm text-muted-foreground p-padding">Sidebar Placeholder</div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <div class="main-container">
      <!-- Header 区域 -->
      <header
        v-if="layoutStore.showHeader"
        class="header-container"
      >
        <!-- TODO: 替换为实际的 Header 组件 -->
        <!-- <LayoutHeader /> -->
        <div class="header-placeholder">
          <div class="text-sm text-muted-foreground p-padding">Header Placeholder</div>
        </div>

        <!-- Tabs 区域 -->
        <div
          v-if="layoutStore.showTabs"
          class="tabs-container"
        >
          <!-- TODO: 替换为实际的 Tabs 组件 -->
          <!-- <LayoutTabs /> -->
          <div class="tabs-placeholder">
            <div class="text-xs text-muted-foreground p-paddings">Tabs Placeholder</div>
          </div>
        </div>
      </header>

      <!-- Content 区域 -->
      <main class="content-container">
        <AppContainer />
      </main>
    </div>

    <!-- 移动端遮罩层 -->
    <div
      v-if="deviceStore.isMobileLayout && !layoutStore.sidebarCollapse"
      class="mobile-mask"
      @click="layoutStore.closeSidebarWithUserMark()"
    />
  </div>
</template>

<style scoped>
/* 使用 CSS 变量 (来自 SizeStore) 来控制布局 */
.app-wrapper {
  @apply relative w-full h-full flex;
}

.sidebar-container {
  /* 宽度由 var(--sidebar-width) 控制，SizeStore 会自动注入 */
  width: var(--sidebar-width, 240px);
  @apply h-full transition-all duration-300 bg-card border-r border-border flex-shrink-0;

  /* 移动端固定定位 */
  .layout-mobile & {
    @apply fixed left-0 top-0 z-50;
    transform: translateX(0);
  }

  /* 侧边栏折叠时隐藏（移动端） */
  .layout-mobile.layout-sidebar-collapse & {
    transform: translateX(-100%);
  }

  .sidebar-placeholder {
    @apply h-full flex items-center justify-center;
  }
}

.main-container {
  @apply flex-1 flex flex-col min-w-0 transition-all duration-300;
}

.header-container {
  @apply flex flex-col bg-card border-b border-border flex-shrink-0;

  .header-placeholder {
    @apply flex items-center justify-between p-padding;
    min-height: var(--header-height, 60px);
  }

  .tabs-container {
    @apply border-t border-border;

    .tabs-placeholder {
      @apply flex items-center p-paddings;
      min-height: var(--tabs-height, 40px);
    }
  }
}

.content-container {
  @apply flex-1 overflow-hidden;
}

/* 移动端遮罩层 */
.mobile-mask {
  @apply fixed inset-0 bg-black/50 z-40 backdrop-blur-sm;
  display: block;
}
</style>
