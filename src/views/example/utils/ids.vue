<script setup lang="ts">
defineOptions({ name: 'UtilsIds' })

import { generateIdFromKey, generateUniqueId } from '@/utils/ids'

const stableKey = ref<string | undefined>('demo-key')
const stableIdOutput = ref<string>('')

watchEffect(() => {
  stableIdOutput.value = generateIdFromKey(stableKey.value ?? '')
})

const uniqueId = ref<string>(generateUniqueId())

function regenerateUniqueId(): void {
  uniqueId.value = generateUniqueId()
}
</script>

<template>
  <div
    class="col-stretch gap-md"
    data-archetype="A1-toolbar-content"
  >
    <div class="layout-narrow col-stretch gap-md">
      <div class="material-elevated rounded-xl p-md md:p-xl col-stretch gap-md">
        <div class="row-between">
          <div class="col-stretch gap-xs">
            <h1 class="text-lg font-semibold text-foreground m-0">IDs Live Tester</h1>
            <p class="text-sm text-muted-foreground m-0">
              `generateUniqueId()`：不稳定随机 UUID；`generateIdFromKey()`：稳定映射
            </p>
          </div>
          <Button
            severity="primary"
            label="Generate Unique ID"
            @click="regenerateUniqueId"
          />
        </div>

        <Divider />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
          <section class="col-stretch gap-md">
            <div class="col-stretch gap-xs">
              <label class="text-xs text-muted-foreground">Key (for stable UUID)</label>
              <InputText
                v-model="stableKey"
                placeholder="输入任意字符串/数字标识"
              />
            </div>

            <div class="col-stretch gap-xs">
              <label class="text-xs text-muted-foreground">Stable ID</label>
              <Textarea
                :model-value="stableIdOutput"
                auto-resize
                rows="4"
                disabled
              />
            </div>

            <div class="text-xs text-muted-foreground">
              同一个 key 会产生同一个 UUID（由 UUIDv5 + 命名空间决定）。
            </div>
          </section>

          <section class="col-stretch gap-md">
            <div class="col-stretch gap-xs">
              <label class="text-xs text-muted-foreground">Unique ID</label>
              <Textarea
                :model-value="uniqueId"
                auto-resize
                rows="4"
                disabled
              />
            </div>

            <div class="text-xs text-muted-foreground">点击右上角按钮可重新生成随机 UUID。</div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
