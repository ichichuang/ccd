<script setup lang="ts">
import { BREAKPOINTS } from '@/constants/breakpoints'
import type { BreakpointKey } from '@/constants/breakpoints'
import { computed, ref } from 'vue'

const RULER_MAX = 3840
const SLIDER_MIN = 320
const SLIDER_MAX = RULER_MAX

const currentWidth = ref(1200)

/** 断点条目（按数值升序），用于标尺与计算 */
const breakpointEntries = computed(() =>
  (Object.entries(BREAKPOINTS) as [BreakpointKey, number][]).sort((a, b) => a[1] - b[1])
)

/** 当前命中的最大断点 */
const activeBreakpoint = computed<BreakpointKey | null>(() => {
  let matched: BreakpointKey | null = null
  for (const [key, value] of breakpointEntries.value) {
    if (currentWidth.value >= value) matched = key
  }
  return matched
})

/** Grid 列数：width < sm → 1，>= sm → 2，>= md → 3，>= lg → 4，>= 2xl → 6，>= 4xl → 8，>= 5xl → 12 */
const gridCols = computed(() => {
  const w = currentWidth.value
  if (w >= BREAKPOINTS['5xl']) return 12
  if (w >= BREAKPOINTS['4xl']) return 8
  if (w >= BREAKPOINTS['2xl']) return 6
  if (w >= BREAKPOINTS.lg) return 4
  if (w >= BREAKPOINTS.md) return 3
  if (w >= BREAKPOINTS.sm) return 2
  return 1
})

/** 标尺上某断点是否已被 currentWidth 超过（高亮） */
function isBreakpointActive(value: number) {
  return currentWidth.value >= value
}

/** 断点数值在标尺上的百分比位置 (0–100) */
function breakpointPercent(value: number) {
  return (value / RULER_MAX) * 100
}
</script>

<template>
  <CScrollbar
    class="flex min-h-0 flex-1 flex-col text-foreground"
    :options="{ scrollbars: { autoHide: 'leave' } }"
  >
    <div class="flex flex-col gap-6 p-6">
      <!-- 控制面板 -->
      <section class="flex flex-col gap-4 rounded-xl border border-border bg-card/50 p-6 shadow-sm">
        <h1 class="text-2xl font-semibold tracking-tight">CCD Breakpoint Simulator v2.0</h1>
        <div class="flex flex-col gap-3">
          <input
            v-model.number="currentWidth"
            type="range"
            :min="SLIDER_MIN"
            :max="SLIDER_MAX"
            step="1"
            class="h-3 w-full max-w-2xl cursor-pointer appearance-none rounded-full bg-border accent-primary"
          />
          <div class="flex flex-wrap items-center gap-4 text-sm">
            <span class="font-mono text-muted-foreground"> {{ currentWidth }}px </span>
            <span class="rounded-md bg-primary/15 px-2 py-1 font-medium">
              Current: {{ activeBreakpoint ?? '< xs' }}
            </span>
          </div>
        </div>
      </section>

      <!-- 可视化标尺 -->
      <section class="flex flex-col gap-2">
        <div
          class="relative h-16 w-full overflow-hidden rounded-lg border border-border bg-muted/30"
          role="img"
          aria-label="Breakpoint ruler"
        >
          <div
            v-for="[key, value] in breakpointEntries"
            :key="key"
            class="absolute top-0 flex h-full flex-col items-center transition-colors"
            :style="{ left: `${breakpointPercent(value)}%` }"
          >
            <div
              class="h-8 w-px shrink-0 transition-colors"
              :class="isBreakpointActive(value) ? 'bg-primary' : 'bg-border'"
            />
            <span
              class="mt-1 shrink-0 rounded px-1 text-xs font-medium"
              :class="
                isBreakpointActive(value)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              "
            >
              {{ key }}: {{ value }}
            </span>
          </div>
        </div>
      </section>

      <!-- 模拟视窗 + Grid 演示 -->
      <section class="flex min-h-0 flex-1 justify-center overflow-x-auto">
        <div
          class="flex shrink-0 flex-col rounded-xl border-2 border-border bg-card shadow-lg transition-all duration-300"
          :style="{ width: `${currentWidth}px` }"
        >
          <div class="border-b border-border px-4 py-2 text-center text-sm text-muted-foreground">
            Viewport {{ currentWidth }}px · Grid {{ gridCols }} col
          </div>
          <div
            class="grid gap-2 p-4"
            :style="{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }"
          >
            <div
              v-for="n in 12"
              :key="n"
              class="flex aspect-video items-center justify-center rounded-lg border border-border bg-muted/50 font-mono text-lg font-medium text-foreground"
            >
              {{ n }}
            </div>
          </div>
        </div>
      </section>
    </div>
  </CScrollbar>
</template>

<style scoped>
/* 滑块轨道兼容 */
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
}
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: rgb(var(--primary));
  cursor: pointer;
  border: 2px solid rgb(var(--background));
}
input[type='range']::-moz-range-thumb {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: rgb(var(--primary));
  cursor: pointer;
  border: none;
  border: 2px solid rgb(var(--background));
}
</style>
