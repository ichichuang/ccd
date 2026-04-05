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
                    name="i-lucide-text"
                    size="xl"
                    class="text-primary"
                  />
                </div>
                <div class="col-stretch gap-xs min-w-0">
                  <div class="row-start gap-xs min-w-0 flex-wrap">
                    <span class="text-lg font-bold text-foreground text-no-wrap">
                      String Formatters
                    </span>
                    <span
                      class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      UTIL
                    </span>
                  </div>
                  <span class="text-sm text-muted-foreground text-ellipsis-1">
                    实时演示 `toKebabCase(str, start, end)`
                  </span>
                </div>
              </div>
            </div>
          </header>

          <section class="material-elevated col-stretch gap-md min-w-0">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-md min-w-0">
              <div class="col-stretch gap-md min-w-0">
                <div class="col-stretch gap-xs min-w-0">
                  <label class="text-xs text-muted-foreground">str</label>
                  <InputText
                    v-model="strInput"
                    placeholder="例如 HelloWorld"
                  />
                </div>

                <div class="col-stretch gap-xs min-w-0">
                  <label class="text-xs text-muted-foreground">start (可选)</label>
                  <InputText
                    v-model="startInput"
                    placeholder="例如 prefix-"
                  />
                </div>

                <div class="col-stretch gap-xs min-w-0">
                  <label class="text-xs text-muted-foreground">end (可选)</label>
                  <InputText
                    v-model="endInput"
                    placeholder="例如 -suffix"
                  />
                </div>
              </div>

              <div class="col-stretch gap-md min-w-0">
                <div class="col-stretch gap-xs min-w-0">
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
              </div>
            </div>
          </section>
        </div>
      </div>
    </AnimateWrapper>
  </div>
</template>
