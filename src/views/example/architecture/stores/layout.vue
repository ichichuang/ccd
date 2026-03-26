<script setup lang="ts">
defineOptions({ name: 'ArchitectureStoreLayout' })

const layoutStore = useLayoutStore()

type LayoutToggleKey = Parameters<typeof layoutStore.setModuleVisible>[0]

interface ModuleItem {
  key: LayoutToggleKey
  label: string
  icon: string
}

const modules: ModuleItem[] = [
  { key: 'showHeader', label: 'Header', icon: 'i-lucide-panel-top' },
  { key: 'showMenu', label: 'Menu', icon: 'i-lucide-menu' },
  { key: 'showSidebar', label: 'Sidebar', icon: 'i-lucide-panel-left' },
  { key: 'showBreadcrumb', label: 'Breadcrumb', icon: 'i-lucide-navigation' },
  { key: 'showTabs', label: 'Tabs', icon: 'i-lucide-panel-top-dashed' },
  { key: 'showFooter', label: 'Footer', icon: 'i-lucide-panel-bottom' },
]

const layoutModes: AdminLayoutMode[] = ['vertical', 'horizontal', 'mix']

function getModuleState(key: LayoutToggleKey): boolean {
  return layoutStore[key]
}

function toggle(key: LayoutToggleKey): void {
  layoutStore.setModuleVisible(key, !getModuleState(key))
}
</script>

<template>
  <div
    class="animate__animated animate__fadeIn col-stretch gap-md"
    data-archetype="A3-stats-grid"
  >
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">Layout Store</h2>
            <p class="text-sm text-muted-foreground m-0">
              布局模块显隐控制 — setModuleVisible() 实时影响当前页面
            </p>
          </div>
          <div class="row-center gap-sm">
            <Tag
              :value="`effectiveMode: ${layoutStore.effectiveMode}`"
              severity="secondary"
            />
            <Tag
              :value="layoutStore.sidebarCollapse ? 'sidebar: collapsed' : 'sidebar: expanded'"
              severity="info"
            />
          </div>
        </div>
        <Divider />

        <div class="grid grid-cols-2 md:grid-cols-3 gap-md">
          <div
            v-for="mod in modules"
            :key="mod.key"
            class="interactive-card rounded-xl p-md col-stretch gap-sm cursor-pointer"
            @click="toggle(mod.key)"
          >
            <div class="row-between">
              <div class="row-start gap-sm items-center">
                <Icons
                  :name="mod.icon"
                  size="sm"
                  :class="getModuleState(mod.key) ? 'text-primary' : 'text-muted-foreground'"
                />
                <span class="text-sm font-medium text-foreground">{{ mod.label }}</span>
              </div>
              <Tag
                :value="getModuleState(mod.key) ? 'ON' : 'OFF'"
                :severity="getModuleState(mod.key) ? 'success' : 'danger'"
              />
            </div>
            <span class="text-xs text-muted-foreground font-mono">{{ mod.key }}</span>
          </div>
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <h3 class="text-md font-semibold text-foreground m-0">Preferred Layout Mode</h3>
          <span class="text-xs text-muted-foreground">setPreferredMode()</span>
        </div>
        <Divider />
        <div class="row-start flex-wrap gap-sm">
          <Button
            v-for="m in layoutModes"
            :key="m"
            :label="m"
            size="small"
            :severity="layoutStore.preferredMode === m ? 'primary' : 'secondary'"
            @click="layoutStore.setPreferredMode(m)"
          />
        </div>
        <p class="text-sm text-muted-foreground m-0">
          点击模块卡片切换显隐状态。各模式（vertical / horizontal / mix）的显隐配置独立维护。
          effectiveMode 由设备断点与 preferredMode 共同推导，响应式自动更新。
        </p>
      </section>
    </div>
  </div>
</template>
