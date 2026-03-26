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
</script>

<template>
  <div
    class="col-stretch gap-md"
    data-archetype="A1-toolbar-content"
  >
    <div class="layout-narrow col-stretch gap-md">
      <div class="material-elevated rounded-xl p-md md:p-xl col-stretch gap-md">
        <div class="row-between items-center">
          <div class="col-stretch gap-xs">
            <h1 class="text-lg font-semibold text-foreground m-0">Device Sync Live Tester</h1>
            <p class="text-sm text-muted-foreground m-0">
              根据 UA + 屏幕短边计算设备类型；再根据 width 计算断点 key
            </p>
          </div>
        </div>

        <Divider />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
          <section class="col-stretch gap-md">
            <div class="col-stretch gap-xs">
              <span class="text-xs text-muted-foreground">Current Device Type</span>
              <InputText
                :model-value="deviceType"
                disabled
              />
            </div>

            <div class="col-stretch gap-xs">
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
          </section>

          <section class="col-stretch gap-md">
            <div class="col-stretch gap-xs">
              <span class="text-xs text-muted-foreground">Computed Breakpoint Key</span>
              <InputText
                :model-value="breakpointKeyOutput"
                disabled
              />
            </div>

            <Message severity="info">
              说明：`deviceType` 与 `breakpointKey` 是两个独立的维度（设备 vs 断点）。
            </Message>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
