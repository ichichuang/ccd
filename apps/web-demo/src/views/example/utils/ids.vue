<script setup lang="ts">
import { generateIdFromKey, generateUniqueId } from '@ccd/shared-utils'
import ExampleSection from '../shared/ExampleSection.vue'

defineOptions({ name: 'UtilsIds' })

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
    class="col-stretch"
    data-archetype="A1-toolbar-content"
  >
    <div class="col-stretch gap-md min-h-0 min-w-0">
      <div class="layout-narrow col-stretch gap-md min-w-0">
        <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
          <div class="row-between gap-md min-w-0">
            <div class="row-start gap-sm min-w-0 flex-wrap">
              <div class="glass-icon-box shrink-0">
                <Icons
                  name="i-lucide-hash"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">ID Generators</span>
                  <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                    UTIL
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  `generateUniqueId()`：不稳定随机 UUID；`generateIdFromKey()`：稳定映射
                </span>
              </div>
            </div>
            <Button
              severity="primary"
              label="Generate Unique ID"
              @click="regenerateUniqueId"
            />
          </div>
        </header>

        <ExampleSection>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-md min-w-0">
            <div class="col-stretch gap-md min-w-0">
              <div class="col-stretch gap-xs min-w-0">
                <label class="text-xs text-muted-foreground">Key (for stable UUID)</label>
                <InputText
                  v-model="stableKey"
                  placeholder="输入任意字符串/数字标识"
                />
              </div>

              <div class="col-stretch gap-xs min-w-0">
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
            </div>

            <div class="col-stretch gap-md min-w-0">
              <div class="col-stretch gap-xs min-w-0">
                <label class="text-xs text-muted-foreground">Unique ID</label>
                <Textarea
                  :model-value="uniqueId"
                  auto-resize
                  rows="4"
                  disabled
                />
              </div>

              <div class="text-xs text-muted-foreground">点击右上角按钮可重新生成随机 UUID。</div>
            </div>
          </div>
        </ExampleSection>
      </div>
    </div>
  </div>
</template>
