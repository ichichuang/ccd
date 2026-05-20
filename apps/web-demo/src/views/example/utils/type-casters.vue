<script setup lang="ts">
defineOptions({ name: 'UtilsTypeCasters' })

import { castValue } from '@ccd/shared-utils'

const casterInput = ref<string | undefined>('type-narrowing-demo')
const casterOutput = ref<string>('—')

watchEffect(() => {
  casterOutput.value = castValue<string>(casterInput.value ?? '')
})
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
                  name="i-lucide-binary"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">Type Casters</span>
                  <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                    UTIL
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  边界类型转换的运行时恒等映射（不改变 payload）
                </span>
              </div>
            </div>
          </div>
        </header>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <Message severity="info">
            These utilities act as identity functions at runtime. They are designed exclusively for
            TypeScript boundary type-narrowing and do not mutate the payload.
          </Message>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-md min-w-0">
            <div class="col-stretch gap-xs min-w-0">
              <label class="text-xs text-muted-foreground">Input</label>
              <InputText v-model="casterInput" />
            </div>

            <div class="col-stretch gap-xs min-w-0">
              <label class="text-xs text-muted-foreground">Output</label>
              <InputText
                :model-value="casterOutput"
                disabled
              />
            </div>
          </div>

          <div class="text-xs text-muted-foreground">
            你在输入框里输入什么，输出框就会显示什么。任何"类型"效果仅发生在 TypeScript 编译期。
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
