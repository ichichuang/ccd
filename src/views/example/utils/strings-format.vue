<script setup lang="ts">
defineOptions({ name: 'UtilsStringsFormat' })

import { toKebabCase } from '@/utils/strings'

const strInput = ref<string | undefined>('HelloWorld')
const startInput = ref<string | undefined>('')
const endInput = ref<string | undefined>('')

const kebabOutputOutput = ref<string>('—')

watchEffect(() => {
  kebabOutputOutput.value = toKebabCase(
    strInput.value ?? '',
    startInput.value ?? '',
    endInput.value ?? ''
  )
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
            <h1 class="text-lg font-semibold text-foreground m-0">Strings Format Live Tester</h1>
            <p class="text-sm text-muted-foreground m-0">实时演示 `toKebabCase(str, start, end)`</p>
          </div>
        </div>

        <Divider />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
          <section class="col-stretch gap-md">
            <div class="col-stretch gap-xs">
              <label class="text-xs text-muted-foreground">str</label>
              <InputText
                v-model="strInput"
                placeholder="例如 HelloWorld"
              />
            </div>

            <div class="col-stretch gap-xs">
              <label class="text-xs text-muted-foreground">start (可选)</label>
              <InputText
                v-model="startInput"
                placeholder="例如 prefix-"
              />
            </div>

            <div class="col-stretch gap-xs">
              <label class="text-xs text-muted-foreground">end (可选)</label>
              <InputText
                v-model="endInput"
                placeholder="例如 -suffix"
              />
            </div>
          </section>

          <section class="col-stretch gap-md">
            <div class="col-stretch gap-xs">
              <label class="text-xs text-muted-foreground">Output</label>
              <Textarea
                :model-value="kebabOutputOutput"
                auto-resize
                rows="3"
                disabled
              />
            </div>

            <Message severity="info">
              注意：此工具只做字符串格式转换，不涉及任何日期/时区逻辑。
            </Message>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
