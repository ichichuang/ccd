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
    class="col-stretch"
    data-archetype="A3-stats-grid"
  >
    <div class="col-stretch gap-md min-h-0 min-w-0">
      <div class="layout-narrow col-stretch gap-md min-w-0">
        <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
          <div class="row-between gap-md min-w-0">
            <div class="row-start gap-sm min-w-0 flex-wrap">
              <div class="glass-icon-box shrink-0">
                <Icons
                  name="i-lucide-layout-dashboard"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">Layout Store</span>
                  <span
                    class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase"
                  >
                    STORE
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  布局模块显隐控制 — setModuleVisible() 实时影响当前页面
                </span>
              </div>
            </div>
            <div class="row-center gap-sm shrink-0">
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

          <div class="grid grid-cols-2 md:grid-cols-3 gap-md min-w-0">
            <div
              v-for="mod in modules"
              :key="mod.key"
              v-tap="() => toggle(mod.key)"
              class="interactive-card motion-lift rounded-xl p-md col-stretch gap-sm cursor-pointer min-w-0"
            >
              <div class="row-between min-w-0">
                <div class="row-start gap-sm items-center min-w-0">
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
        </header>

        <section class="glass-card col-stretch gap-md min-w-0">
          <div class="row-between gap-sm min-w-0 shrink-0">
            <div class="row-start gap-xs min-w-0">
              <Icons
                name="i-lucide-columns-3"
                size="sm"
                class="text-muted-foreground"
              />
              <span class="text-sm font-semibold text-foreground text-no-wrap">
                Preferred Layout Mode
              </span>
            </div>
            <span class="text-xs text-muted-foreground">setPreferredMode()</span>
          </div>
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
  </div>
</template>
