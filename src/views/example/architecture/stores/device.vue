<script setup lang="ts">
defineOptions({ name: 'ArchitectureStoreDevice' })

const deviceStore = useDeviceStore()
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
                  name="i-lucide-smartphone"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">Device Store</span>
                  <span
                    class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase"
                  >
                    STORE
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  实时视口与设备状态 — 调整浏览器窗口大小，数值自动响应
                </span>
              </div>
            </div>
            <Tag
              :value="`${deviceStore.type} · ${deviceStore.os}`"
              severity="secondary"
              class="shrink-0"
            />
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-md min-w-0">
            <div class="col-stretch gap-xs bg-muted rounded-lg p-md min-w-0">
              <span class="text-xs text-muted-foreground">width</span>
              <span class="text-2xl font-mono font-bold text-primary">
                {{ deviceStore.width }}
              </span>
              <span class="text-xs text-muted-foreground">px — viewport</span>
            </div>
            <div class="col-stretch gap-xs bg-muted rounded-lg p-md min-w-0">
              <span class="text-xs text-muted-foreground">height</span>
              <span class="text-2xl font-mono font-bold text-primary">
                {{ deviceStore.height }}
              </span>
              <span class="text-xs text-muted-foreground">px — viewport</span>
            </div>
            <div class="col-stretch gap-xs bg-muted rounded-lg p-md min-w-0">
              <span class="text-xs text-muted-foreground">currentBreakpoint</span>
              <span class="text-2xl font-mono font-bold text-primary">
                {{ deviceStore.currentBreakpoint }}
              </span>
              <span class="text-xs text-muted-foreground">breakpoint key</span>
            </div>
            <div class="col-stretch gap-xs bg-muted rounded-lg p-md min-w-0">
              <span class="text-xs text-muted-foreground">type</span>
              <span class="text-xl font-semibold text-foreground">{{ deviceStore.type }}</span>
              <Tag
                :value="deviceStore.isMobileLayout ? 'Mobile Layout' : 'Desktop Layout'"
                :severity="deviceStore.isMobileLayout ? 'warn' : 'success'"
              />
            </div>
            <div class="col-stretch gap-xs bg-muted rounded-lg p-md min-w-0">
              <span class="text-xs text-muted-foreground">os</span>
              <span class="text-xl font-semibold text-foreground">{{ deviceStore.os }}</span>
              <Tag
                value="Hardware Detection"
                severity="secondary"
              />
            </div>
            <div class="col-stretch gap-xs bg-muted rounded-lg p-md min-w-0">
              <span class="text-xs text-muted-foreground">orientation</span>
              <span class="text-xl font-semibold text-foreground">
                {{ deviceStore.orientation }}
              </span>
              <Tag
                :value="deviceStore.orientation === 'horizontal' ? '横屏' : '竖屏'"
                severity="info"
              />
            </div>
          </div>
        </header>

        <section class="glass-card col-stretch gap-md min-w-0">
          <div class="row-between gap-sm min-w-0 shrink-0">
            <div class="row-start gap-xs min-w-0">
              <Icons
                name="i-lucide-cpu"
                size="sm"
                class="text-muted-foreground"
              />
              <span class="text-sm font-semibold text-foreground text-no-wrap">
                Derived Getters
              </span>
            </div>
          </div>
          <div class="row-start flex-wrap gap-sm">
            <Tag
              :value="`isMobileLayout: ${deviceStore.isMobileLayout}`"
              :severity="deviceStore.isMobileLayout ? 'warn' : 'secondary'"
            />
            <Tag
              :value="`isTabletLayout: ${deviceStore.isTabletLayout}`"
              :severity="deviceStore.isTabletLayout ? 'info' : 'secondary'"
            />
            <Tag
              :value="`isPCLayout: ${deviceStore.isPCLayout}`"
              :severity="deviceStore.isPCLayout ? 'success' : 'secondary'"
            />
            <Tag
              :value="`isTouchDevice: ${deviceStore.isTouchDevice}`"
              severity="secondary"
            />
            <Tag
              :value="`pixelRatio: ${deviceStore.pixelRatio}`"
              severity="secondary"
            />
          </div>
          <p class="text-sm text-muted-foreground m-0">
            Device Store 在 init() 时绑定 resize / orientationchange 事件监听，所有值响应式更新。
            布局判定（isMobileLayout / isPCLayout）基于断点，物理判定（type / os）基于 User Agent。
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
