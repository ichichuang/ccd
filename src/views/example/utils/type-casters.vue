<script setup lang="ts">
defineOptions({ name: 'UtilsTypeCasters' })

import { castValue } from '@/utils/typeCasters'

const casterInput = ref<string | undefined>('type-narrowing-demo')
const casterOutput = ref<string>('—')

watchEffect(() => {
  casterOutput.value = castValue<string>(casterInput.value ?? '')
})
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
            <h1 class="text-lg font-semibold text-foreground m-0">Type Casters Live Tester</h1>
            <p class="text-sm text-muted-foreground m-0">
              边界类型转换的运行时恒等映射（不改变 payload）
            </p>
          </div>
        </div>

        <Divider />

        <Message severity="info">
          These utilities act as identity functions at runtime. They are designed exclusively for
          TypeScript boundary type-narrowing and do not mutate the payload.
        </Message>

        <section class="col-stretch gap-md">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div class="col-stretch gap-xs">
              <label class="text-xs text-muted-foreground">Input</label>
              <InputText v-model="casterInput" />
            </div>

            <div class="col-stretch gap-xs">
              <label class="text-xs text-muted-foreground">Output</label>
              <InputText
                :model-value="casterOutput"
                disabled
              />
            </div>
          </div>

          <div class="text-xs text-muted-foreground">
            你在输入框里输入什么，输出框就会显示什么。任何“类型”效果仅发生在 TypeScript 编译期。
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
