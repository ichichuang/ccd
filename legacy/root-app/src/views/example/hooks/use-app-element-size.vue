<script setup lang="tsx">
import type { UseElementSizeOptions } from '@/hooks/modules/useAppElementSize'
import Tag from 'primevue/tag'

defineOptions({ name: 'UseAppElementSize' })

type Mode = NonNullable<UseElementSizeOptions['mode']>

const mode = ref<Mode>('none')
const delay = ref<number>(200)

const sizePresets = computed(() => {
  const presets = [
    { label: 'Compact', w: 'var(--spacing-2xl)', h: 'var(--spacing-2xl)' },
    { label: 'Medium', w: 'var(--spacing-3xl)', h: 'var(--spacing-2xl)' },
    { label: 'Large', w: 'var(--spacing-4xl)', h: 'var(--spacing-3xl)' },
  ]
  return presets
})

const presetIndex = ref<number>(1)
const activeSize = computed(() => sizePresets.value[presetIndex.value] ?? sizePresets.value[0])

const SizeProbe = defineComponent({
  name: 'SizeProbe',
  props: {
    boxMode: { type: String, required: true },
    boxDelay: { type: Number, required: true },
    boxWidth: { type: String, required: true },
    boxHeight: { type: String, required: true },
  },
  setup(props) {
    const boxRef = ref<HTMLElement | null>(null)
    const callbackCount = ref<number>(0)
    const lastEntry = ref<{ width: number; height: number } | null>(null)

    const { width, height } = useAppElementSize(
      boxRef,
      (entry: DOMRectReadOnly) => {
        callbackCount.value += 1
        lastEntry.value = { width: entry.width, height: entry.height }
      },
      {
        mode: props.boxMode as UseElementSizeOptions['mode'],
        delay: props.boxDelay,
      }
    )

    return () => (
      <div class="col-stretch gap-md min-w-0">
        <div
          ref={boxRef}
          class="material-elevated col-center gap-sm rounded-md p-md border border-border min-w-0"
          style={{ width: props.boxWidth, height: props.boxHeight }}
        >
          <div class="text-sm text-muted-foreground">Target</div>
          <div class="text-xs text-foreground text-no-wrap">
            {width.value.toFixed(0)} x {height.value.toFixed(0)}
          </div>
        </div>

        <div class="col-stretch gap-sm min-w-0">
          <div class="row-start flex-wrap gap-sm min-w-0">
            <Tag
              value={`width=${width.value}`}
              severity="secondary"
            />
            <Tag
              value={`height=${height.value}`}
              severity="secondary"
            />
            <Tag
              value={`callbackCount=${callbackCount.value}`}
              severity="info"
            />
          </div>
          <div class="text-xs text-muted-foreground">
            {lastEntry.value
              ? `lastEntry: ${lastEntry.value.width} x ${lastEntry.value.height}`
              : 'lastEntry: —'}
          </div>
        </div>
      </div>
    )
  },
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
                  name="i-lucide-maximize"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">
                    useAppElementSize
                  </span>
                  <span
                    class="surface-success rounded-md px-sm py-xs text-xs font-semibold uppercase"
                  >
                    HOOK
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  实时监听宽高变化，并展示 callback 触发情况
                </span>
              </div>
            </div>
            <div class="row-center gap-sm min-w-0">
              <Tag
                :value="`mode=${mode}`"
                severity="secondary"
              />
              <Tag
                :value="`delay=${delay}ms`"
                severity="secondary"
              />
            </div>
          </div>
        </header>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <div class="row-between min-w-0">
            <span class="text-sm text-muted-foreground">Action Triggers</span>
          </div>

          <div class="col-stretch gap-sm min-w-0">
            <div class="text-sm text-muted-foreground">切换 mode</div>
            <div class="row-start flex-wrap gap-sm min-w-0">
              <Button
                size="small"
                severity="primary"
                label="none"
                @click="mode = 'none'"
              />
              <Button
                size="small"
                severity="secondary"
                label="throttle"
                @click="mode = 'throttle'"
              />
              <Button
                size="small"
                severity="secondary"
                label="debounce"
                @click="mode = 'debounce'"
              />
            </div>
          </div>

          <div class="col-stretch gap-sm min-w-0">
            <div class="text-sm text-muted-foreground">delay（ms）</div>
            <InputNumber
              v-model="delay"
              :min="0"
              :step="50"
              :max="2000"
            />
          </div>

          <div class="col-stretch gap-sm min-w-0">
            <div class="text-sm text-muted-foreground">改变容器尺寸（触发 ResizeObserver）</div>
            <div class="row-start flex-wrap gap-sm min-w-0">
              <Button
                v-for="(p, i) in sizePresets"
                :key="p.label"
                size="small"
                :severity="presetIndex === i ? 'primary' : 'secondary'"
                :label="p.label"
                @click="presetIndex = i"
              />
            </div>
          </div>
        </section>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <div class="row-between min-w-0">
            <h3 class="text-md font-semibold text-foreground m-0">Current State</h3>
            <span class="text-sm text-muted-foreground">
              {{ activeSize.label }}
            </span>
          </div>

          <SizeProbe
            :key="`${mode}-${delay}`"
            :box-mode="mode"
            :box-delay="delay"
            :box-width="activeSize.w"
            :box-height="activeSize.h"
          />
        </section>
      </div>
    </div>
  </div>
</template>
