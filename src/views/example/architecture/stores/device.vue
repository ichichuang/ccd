<script setup lang="ts">
defineOptions({ name: 'ArchitectureStoreDevice' })

const deviceStore = useDeviceStore()
</script>

<template>
  <div
    class="animate__animated animate__fadeIn col-stretch gap-md"
    data-archetype="A3-stats-grid"
  >
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between items-center">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">Device Store</h2>
            <p class="text-sm text-muted-foreground m-0">
              实时视口与设备状态 — 调整浏览器窗口大小，数值自动响应
            </p>
          </div>
          <Tag
            :value="`${deviceStore.type} · ${deviceStore.os}`"
            severity="secondary"
          />
        </div>
        <Divider />

        <div class="grid grid-cols-2 md:grid-cols-3 gap-md">
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">width</span>
            <span class="text-2xl font-mono font-bold text-primary">{{ deviceStore.width }}</span>
            <span class="text-xs text-muted-foreground">px — viewport</span>
          </div>
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">height</span>
            <span class="text-2xl font-mono font-bold text-primary">{{ deviceStore.height }}</span>
            <span class="text-xs text-muted-foreground">px — viewport</span>
          </div>
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">currentBreakpoint</span>
            <span class="text-2xl font-mono font-bold text-primary">
              {{ deviceStore.currentBreakpoint }}
            </span>
            <span class="text-xs text-muted-foreground">breakpoint key</span>
          </div>
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">type</span>
            <span class="text-xl font-semibold text-foreground">{{ deviceStore.type }}</span>
            <Tag
              :value="deviceStore.isMobileLayout ? 'Mobile Layout' : 'Desktop Layout'"
              :severity="deviceStore.isMobileLayout ? 'warn' : 'success'"
            />
          </div>
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">os</span>
            <span class="text-xl font-semibold text-foreground">{{ deviceStore.os }}</span>
            <Tag
              value="Hardware Detection"
              severity="secondary"
            />
          </div>
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">orientation</span>
            <span class="text-xl font-semibold text-foreground">{{ deviceStore.orientation }}</span>
            <Tag
              :value="deviceStore.orientation === 'horizontal' ? '横屏' : '竖屏'"
              severity="info"
            />
          </div>
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">Derived Getters</h3>
        <Divider />
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
</template>
