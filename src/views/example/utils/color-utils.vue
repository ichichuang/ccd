<script setup lang="ts">
import {
  hexToRgb,
  rgbToHex,
  adjustBrightness,
  mixHex,
  shiftHue,
  isDarkColor,
  applyOpacityToColor,
} from '@/utils/theme/colors'
import { generateChartPalette } from '@/utils/theme/chartUtils'

defineOptions({ name: 'ExampleUtilColorUtils' })

// ── hexToRgb / rgbToHex ─────────────────────────────────────────
const hexInput = ref<string>('#3b82f6')
const rgbOutput = computed<string>(() => hexToRgb(hexInput.value))
const roundTrip = computed<string>(() => rgbToHex(rgbOutput.value))

// ── adjustBrightness ────────────────────────────────────────────
const brightnessHex = ref<string>('#3b82f6')
const brightnessPercent = ref<number>(0)
const brightnessOutput = computed<string>(() =>
  adjustBrightness(brightnessHex.value, brightnessPercent.value)
)
const brightnessSteps = computed<string[]>(() => {
  const steps: string[] = []
  for (let p = -60; p <= 60; p += 15) {
    steps.push(adjustBrightness(brightnessHex.value, p))
  }
  return steps
})

// ── mixHex ──────────────────────────────────────────────────────
const mixColor1 = ref<string>('#3b82f6')
const mixColor2 = ref<string>('#ef4444')
const mixWeight = ref<number>(50)
const mixOutput = computed<string>(() =>
  mixHex(mixColor1.value, mixColor2.value, mixWeight.value / 100)
)
const mixSteps = computed<string[]>(() => {
  const steps: string[] = []
  for (let w = 0; w <= 100; w += 10) {
    steps.push(mixHex(mixColor1.value, mixColor2.value, w / 100))
  }
  return steps
})

// ── shiftHue ────────────────────────────────────────────────────
const hueHex = ref<string>('#3b82f6')
const hueDegree = ref<number>(0)
const hueOutput = computed<string>(() => shiftHue(hueHex.value, hueDegree.value))
const hueWheel = computed<string[]>(() => {
  const steps: string[] = []
  for (let d = 0; d < 360; d += 30) {
    steps.push(shiftHue(hueHex.value, d))
  }
  return steps
})

// ── isDarkColor ─────────────────────────────────────────────────
const darkCheckHex = ref<string>('#3b82f6')
const darkResult = computed<boolean>(() => isDarkColor(darkCheckHex.value))

// ── applyOpacityToColor ─────────────────────────────────────────
const opacityHex = ref<string>('#3b82f6')
const opacityValue = ref<number>(50)
const opacityOutput = computed<string>(() =>
  applyOpacityToColor(opacityHex.value, opacityValue.value)
)

// ── generateChartPalette ────────────────────────────────────────
const paletteBase = ref<string>('#3b82f6')
const paletteCount = ref<number>(8)
const paletteOutput = computed<string[]>(() =>
  generateChartPalette(paletteBase.value, paletteCount.value)
)
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="col-stretch gap-md"
  >
    <div class="layout-narrow col-stretch gap-md">
      <!-- Hero -->
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <div class="col-stretch gap-xs">
            <h1 class="text-lg font-semibold text-foreground m-0">Color Utilities Playground</h1>
            <p class="text-sm text-muted-foreground m-0">
              交互式演示
              <code>src/utils/theme/colors.ts</code>
              全部导出函数与
              <code>generateChartPalette</code>
              。
            </p>
          </div>
        </div>
      </section>

      <!-- 1. hexToRgb / rgbToHex -->
      <section class="material-elevated col-stretch gap-md">
        <h2 class="text-md font-semibold text-foreground m-0">hexToRgb / rgbToHex</h2>
        <Divider />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div class="col-stretch gap-xs">
            <label class="text-xs text-muted-foreground">HEX 输入</label>
            <InputText
              v-model="hexInput"
              placeholder="#3b82f6"
              size="small"
            />
          </div>
          <div class="col-stretch gap-sm">
            <div class="row-start gap-sm items-center">
              <Tag
                :value="`RGB: ${rgbOutput}`"
                severity="info"
              />
              <Tag
                :value="`Round-trip: ${roundTrip}`"
                severity="secondary"
              />
            </div>
            <div
              class="h-8 rounded-md border-default"
              :style="{ backgroundColor: hexInput }"
            />
          </div>
        </div>
      </section>

      <!-- 2. adjustBrightness -->
      <section class="material-elevated col-stretch gap-md">
        <h2 class="text-md font-semibold text-foreground m-0">adjustBrightness</h2>
        <Divider />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div class="col-stretch gap-xs">
            <label class="text-xs text-muted-foreground">基础色</label>
            <InputText
              v-model="brightnessHex"
              placeholder="#3b82f6"
              size="small"
            />
            <label class="text-xs text-muted-foreground">亮度偏移 ({{ brightnessPercent }}%)</label>
            <Slider
              v-model="brightnessPercent"
              :min="-100"
              :max="100"
              :step="5"
            />
          </div>
          <div class="col-stretch gap-sm">
            <div class="row-start gap-sm items-center">
              <div
                class="w-8 h-8 rounded-md border-default shrink-0"
                :style="{ backgroundColor: brightnessOutput }"
              />
              <Tag
                :value="brightnessOutput"
                severity="info"
              />
            </div>
            <div class="row-start gap-xs flex-wrap">
              <div
                v-for="(c, i) in brightnessSteps"
                :key="i"
                class="w-6 h-6 rounded-sm border-default"
                :style="{ backgroundColor: c }"
                :title="`${-60 + i * 15}%: ${c}`"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- 3. mixHex -->
      <section class="material-elevated col-stretch gap-md">
        <h2 class="text-md font-semibold text-foreground m-0">mixHex</h2>
        <Divider />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div class="col-stretch gap-xs">
            <label class="text-xs text-muted-foreground">颜色 1</label>
            <InputText
              v-model="mixColor1"
              placeholder="#3b82f6"
              size="small"
            />
            <label class="text-xs text-muted-foreground">颜色 2</label>
            <InputText
              v-model="mixColor2"
              placeholder="#ef4444"
              size="small"
            />
            <label class="text-xs text-muted-foreground">权重 color1 ({{ mixWeight }}%)</label>
            <Slider
              v-model="mixWeight"
              :min="0"
              :max="100"
              :step="5"
            />
          </div>
          <div class="col-stretch gap-sm">
            <div class="row-start gap-sm items-center">
              <div
                class="w-8 h-8 rounded-md border-default shrink-0"
                :style="{ backgroundColor: mixOutput }"
              />
              <Tag
                :value="mixOutput"
                severity="info"
              />
            </div>
            <div class="row-start gap-xs flex-wrap">
              <div
                v-for="(c, i) in mixSteps"
                :key="i"
                class="w-6 h-6 rounded-sm border-default"
                :style="{ backgroundColor: c }"
                :title="`${i * 10}%: ${c}`"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- 4. shiftHue -->
      <section class="material-elevated col-stretch gap-md">
        <h2 class="text-md font-semibold text-foreground m-0">shiftHue</h2>
        <Divider />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div class="col-stretch gap-xs">
            <label class="text-xs text-muted-foreground">基础色</label>
            <InputText
              v-model="hueHex"
              placeholder="#3b82f6"
              size="small"
            />
            <label class="text-xs text-muted-foreground">色相偏移 ({{ hueDegree }}°)</label>
            <Slider
              v-model="hueDegree"
              :min="0"
              :max="360"
              :step="15"
            />
          </div>
          <div class="col-stretch gap-sm">
            <div class="row-start gap-sm items-center">
              <div
                class="w-8 h-8 rounded-md border-default shrink-0"
                :style="{ backgroundColor: hueOutput }"
              />
              <Tag
                :value="hueOutput"
                severity="info"
              />
            </div>
            <div class="row-start gap-xs flex-wrap">
              <div
                v-for="(c, i) in hueWheel"
                :key="i"
                class="w-6 h-6 rounded-sm border-default"
                :style="{ backgroundColor: c }"
                :title="`${i * 30}°: ${c}`"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- 5. isDarkColor -->
      <section class="material-elevated col-stretch gap-md">
        <h2 class="text-md font-semibold text-foreground m-0">isDarkColor</h2>
        <Divider />
        <div class="row-start gap-md items-center flex-wrap">
          <div class="col-stretch gap-xs">
            <label class="text-xs text-muted-foreground">检测颜色</label>
            <InputText
              v-model="darkCheckHex"
              placeholder="#3b82f6"
              size="small"
            />
          </div>
          <div
            class="w-12 h-12 rounded-lg border-default col-center"
            :style="{ backgroundColor: darkCheckHex }"
          >
            <span
              class="text-xs font-bold"
              :style="{ color: darkResult ? '#ffffff' : '#000000' }"
            >
              {{ darkResult ? 'Dark' : 'Light' }}
            </span>
          </div>
          <Tag
            :value="darkResult ? 'isDark = true' : 'isDark = false'"
            :severity="darkResult ? 'warn' : 'info'"
          />
        </div>
      </section>

      <!-- 6. applyOpacityToColor -->
      <section class="material-elevated col-stretch gap-md">
        <h2 class="text-md font-semibold text-foreground m-0">applyOpacityToColor</h2>
        <Divider />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div class="col-stretch gap-xs">
            <label class="text-xs text-muted-foreground">颜色</label>
            <InputText
              v-model="opacityHex"
              placeholder="#3b82f6"
              size="small"
            />
            <label class="text-xs text-muted-foreground">透明度 ({{ opacityValue }}%)</label>
            <Slider
              v-model="opacityValue"
              :min="0"
              :max="100"
              :step="5"
            />
          </div>
          <div class="col-stretch gap-sm">
            <div
              class="h-10 rounded-md border-default"
              :style="{ backgroundColor: opacityOutput }"
            />
            <Tag
              :value="opacityOutput"
              severity="secondary"
            />
          </div>
        </div>
      </section>

      <!-- 7. generateChartPalette -->
      <section class="material-elevated col-stretch gap-md">
        <h2 class="text-md font-semibold text-foreground m-0">generateChartPalette</h2>
        <Divider />
        <div class="col-stretch gap-md">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div class="col-stretch gap-xs">
              <label class="text-xs text-muted-foreground">基础色</label>
              <InputText
                v-model="paletteBase"
                placeholder="#3b82f6"
                size="small"
              />
            </div>
            <div class="col-stretch gap-xs">
              <label class="text-xs text-muted-foreground">数量 ({{ paletteCount }})</label>
              <Slider
                v-model="paletteCount"
                :min="2"
                :max="16"
                :step="1"
              />
            </div>
          </div>
          <div class="row-start gap-sm flex-wrap">
            <div
              v-for="(c, i) in paletteOutput"
              :key="i"
              class="col-center gap-xs"
            >
              <div
                class="w-10 h-10 rounded-md border-default"
                :style="{ backgroundColor: c }"
              />
              <span class="text-[10px] text-muted-foreground">{{ c }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
