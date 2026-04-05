<script setup lang="ts">
defineOptions({ name: 'UtilsDeviceSync' })

import { getBreakpointSync, getDeviceTypeSync } from '@/utils/deviceSync'
import type { DeviceType } from '@/types/systems/device'

const deviceType = ref<DeviceType>(getDeviceTypeSync())

const widthValue = ref<number>(typeof window !== 'undefined' ? Math.max(0, window.innerWidth) : 0)

const breakpointKeyOutput = ref<string>('—')

watchEffect(() => {
  breakpointKeyOutput.value = getBreakpointSync(widthValue.value)
})

const pageReady = ref<boolean>(true)
</script>

<template>
  <div
    class="col-stretch"
    data-archetype="A1-toolbar-content"
  >
    <AnimateWrapper
      :show="pageReady"
      enter="fadeInUp"
      leave="fadeOut"
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
                    <span class="text-lg font-bold text-foreground text-no-wrap">Device Sync</span>
                    <span
                      class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      UTIL
                    </span>
                  </div>
                  <span class="text-sm text-muted-foreground text-ellipsis-1">
                    根据 UA + 屏幕短边计算设备类型；再根据 width 计算断点 key
                  </span>
                </div>
              </div>
            </div>
          </header>

          <section class="material-elevated col-stretch gap-md min-w-0">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-md min-w-0">
              <div class="col-stretch gap-md min-w-0">
                <div class="col-stretch gap-xs min-w-0">
                  <span class="text-xs text-muted-foreground">Current Device Type</span>
                  <InputText
                    :model-value="deviceType"
                    disabled
                  />
                </div>

                <div class="col-stretch gap-xs min-w-0">
                  <span class="text-xs text-muted-foreground">Simulated width</span>
                  <InputNumber
                    v-model="widthValue"
                    :min="0"
                    :step="1"
                    show-buttons
                  />
                </div>

                <div class="text-xs text-muted-foreground">
                  断点计算使用 `getBreakpointSync(width)`；当 width 变化时实时刷新。
                </div>
              </div>

              <div class="col-stretch gap-md min-w-0">
                <div class="col-stretch gap-xs min-w-0">
                  <span class="text-xs text-muted-foreground">Computed Breakpoint Key</span>
                  <InputText
                    :model-value="breakpointKeyOutput"
                    disabled
                  />
                </div>

                <Message severity="info">
                  说明：`deviceType` 与 `breakpointKey` 是两个独立的维度（设备 vs 断点）。
                </Message>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AnimateWrapper>
  </div>
</template>
