<script setup lang="ts">
defineOptions({ name: 'UtilsLodash' })

import { debounceFn, deepClone, deepEqual } from '@ccd/shared-utils'

function parseJsonOrString(input: string): unknown {
  const raw = input.trim()
  if (!raw) return ''
  try {
    const parsed: unknown = JSON.parse(raw)
    return parsed
  } catch {
    return input
  }
}

function formatUnknownForDisplay(value: unknown): string {
  if (value === null) return '—'
  if (typeof value === 'string') return value || '—'
  try {
    const json = JSON.stringify(value, null, 2)
    return json || '—'
  } catch {
    return String(value)
  }
}

// ===== deepClone =====
const deepCloneInput = ref<string>('{"count":1,"nested":{"a":2}}')
const deepCloneOutput = ref<string>('—')

watchEffect(() => {
  const parsed = parseJsonOrString(deepCloneInput.value)
  const cloned = deepClone(parsed)
  deepCloneOutput.value = formatUnknownForDisplay(cloned)
})

// ===== deepEqual =====
const deepEqualInputA = ref<string>('{"x":1,"y":[2,3]}')
const deepEqualInputB = ref<string>('{"x":1,"y":[2,3]}')

const isDeepEqual = computed(() => {
  const a = parseJsonOrString(deepEqualInputA.value)
  const b = parseJsonOrString(deepEqualInputB.value)
  return deepEqual(a, b)
})

// ===== debounceFn =====
const debouncePayload = ref<string | undefined>('bounce-demo')
const debounceCount = ref<number>(0)
const debounceLast = ref<string>('—')

const debouncedRun = debounceFn((val: string) => {
  debounceCount.value += 1
  debounceLast.value = val
}, 500)

function triggerDebounce(): void {
  debouncedRun(debouncePayload.value ?? '')
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
                  name="i-lucide-package"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">
                    Lodash Utilities
                  </span>
                  <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                    UTIL
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  deepClone / deepEqual / debounceFn 交互演示
                </span>
              </div>
            </div>
          </div>
        </header>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <h2 class="text-base font-semibold text-foreground m-0">deepClone</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-md min-w-0">
            <div class="col-stretch gap-xs min-w-0">
              <label class="text-xs text-muted-foreground">Input</label>
              <Textarea
                v-model="deepCloneInput"
                auto-resize
                rows="6"
                placeholder="输入 JSON 或普通字符串"
              />
            </div>

            <div class="col-stretch gap-xs min-w-0">
              <label class="text-xs text-muted-foreground">Cloned Output</label>
              <Textarea
                :model-value="deepCloneOutput"
                auto-resize
                rows="6"
                disabled
              />
            </div>
          </div>
        </section>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <h2 class="text-base font-semibold text-foreground m-0">deepEqual</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-md min-w-0">
            <div class="col-stretch gap-xs min-w-0">
              <label class="text-xs text-muted-foreground">A</label>
              <Textarea
                v-model="deepEqualInputA"
                auto-resize
                rows="5"
                placeholder="JSON A"
              />
            </div>
            <div class="col-stretch gap-xs min-w-0">
              <label class="text-xs text-muted-foreground">B</label>
              <Textarea
                v-model="deepEqualInputB"
                auto-resize
                rows="5"
                placeholder="JSON B"
              />
            </div>
          </div>

          <Message :severity="isDeepEqual ? 'success' : 'warn'">
            deepEqual 结果：{{ isDeepEqual ? 'true' : 'false' }}
          </Message>
        </section>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <h2 class="text-base font-semibold text-foreground m-0">debounceFn</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-md min-w-0">
            <div class="col-stretch gap-xs min-w-0">
              <label class="text-xs text-muted-foreground">Payload</label>
              <InputText
                v-model="debouncePayload"
                placeholder="改变 payload 后，连续点击触发 debounce"
              />
            </div>

            <div class="col-stretch gap-xs min-w-0">
              <label class="text-xs text-muted-foreground">Result</label>
              <div class="row-start gap-sm flex-wrap min-w-0">
                <Tag
                  :value="`count=${debounceCount}`"
                  severity="info"
                />
                <Tag
                  :value="`last=${debounceLast}`"
                  severity="secondary"
                />
              </div>
            </div>
          </div>

          <Button
            severity="primary"
            label="Trigger debounceFn"
            @click="triggerDebounce"
          />
          <p class="text-xs text-muted-foreground m-0">
            连续点击会被"抖动合并"：只有最后一次在等待 500ms 后才会真正更新 count。
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
