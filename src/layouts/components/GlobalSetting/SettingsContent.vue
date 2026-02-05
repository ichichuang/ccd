<script setup lang="ts">
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'
import { useThemeStore } from '@/stores/modules/theme'
import { useSizeStore } from '@/stores/modules/size'
import { useLayoutStore } from '@/stores/modules/layout'
import { useLocale } from '@/hooks/modules/useLocale'
import {
  THEME_PRESETS,
  TRANSITION_DURATION_OPTIONS,
  getPresetPrimaryColor,
} from '@/constants/theme'
import { SIZE_PRESETS } from '@/constants/size'
import type { SupportedLocale } from '@/locales'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import Select from 'primevue/select'
import Slider from 'primevue/slider'
import Icons from '@/components/Icons/Icons.vue'

defineEmits(['close'])

const { t } = useI18n()
const { mode, isAnimating, setThemeWithAnimation } = useThemeSwitch()
const themeStore = useThemeStore()
const sizeStore = useSizeStore()
const layoutStore = useLayoutStore()
const { locale, switchLocale, supportedLocales } = useLocale()

// 主题模式选项 (light | dark | auto)
const themeModeOptions: { value: ThemeMode; labelKey: string }[] = [
  { value: 'light', labelKey: 'settings.themeModeLight' },
  { value: 'dark', labelKey: 'settings.themeModeDark' },
  { value: 'auto', labelKey: 'settings.themeModeAuto' },
]

// 布局模式选项 (vertical | horizontal | mix)
const layoutModeOptions: { value: AdminLayoutMode; labelKey: string }[] = [
  { value: 'vertical', labelKey: 'settings.layoutVertical' },
  { value: 'horizontal', labelKey: 'settings.layoutHorizontal' },
  { value: 'mix', labelKey: 'settings.layoutMix' },
]

// 切换动画选项（图标 + i18n labelKey）
const transitionOptions: { value: ThemeTransitionMode; icon: string; labelKey: string }[] = [
  { value: 'circle', icon: 'i-lucide-circle-dot', labelKey: 'settings.transitionCircle' },
  { value: 'curtain', icon: 'i-lucide-panel-left', labelKey: 'settings.transitionCurtain' },
  { value: 'diamond', icon: 'i-lucide-diamond', labelKey: 'settings.transitionDiamond' },
  { value: 'fade', icon: 'i-lucide-sun-moon', labelKey: 'settings.transitionFade' },
  { value: 'glitch', icon: 'i-lucide-sparkles', labelKey: 'settings.transitionGlitch' },
  { value: 'implosion', icon: 'i-lucide-minimize-2', labelKey: 'settings.transitionImplosion' },
]

// 尺寸选项（来自 SIZE_PRESETS）
const sizeOptions = SIZE_PRESETS.map(p => ({ value: p.name, label: p.label }))

// 语言选项（来自 supportedLocales）
const localeOptions = supportedLocales.map(l => ({ value: l.key, label: `${l.flag} ${l.name}` }))

// 过渡时长 Slider：索引 0–4 映射到 400–1600ms
const DURATION_VALUES = TRANSITION_DURATION_OPTIONS.map(o => o.value)
const durationIndex = computed(() => DURATION_VALUES.indexOf(themeStore.transitionDuration))
function onDurationSliderChange(v: number | number[]) {
  const i = Array.isArray(v) ? (v[0] ?? 0) : v
  const val = DURATION_VALUES[i]
  if (val !== undefined) themeStore.setTransitionDuration(val)
}
const currentDurationLabel = computed(
  () =>
    TRANSITION_DURATION_OPTIONS.find(o => o.value === themeStore.transitionDuration)?.labelKey ??
    'settings.durationComfortable'
)

function onLayoutModeChange(value: AdminLayoutMode) {
  layoutStore.updateSetting('mode', value)
  layoutStore.markUserAdjusted()
}

function onThemeModeChange(value: ThemeMode) {
  setThemeWithAnimation(value)
}
</script>

<template>
  <div class="between-start flex-col px-padding-md gap-gap-xl">
    <!-- 深色 / 浅色 -->
    <div class="between-start flex-col gap-gap-sm">
      <label class="fs-sm font-medium text-muted-foreground">{{ t('settings.themeMode') }}</label>
      <div class="flex gap-gap-md">
        <template
          v-for="opt in themeModeOptions"
          :key="opt.value"
        >
          <Button
            :label="t(opt.labelKey)"
            :disabled="isAnimating"
            :severity="mode === opt.value ? 'primary' : 'secondary'"
            @click="onThemeModeChange(opt.value)"
          />
        </template>
      </div>
    </div>

    <!-- 系统配色 -->
    <div class="between-start flex-col gap-gap-sm">
      <label class="fs-sm font-medium text-muted-foreground">{{ t('settings.themePreset') }}</label>
      <div class="flex flex-wrap gap-gap-md">
        <Button
          v-for="preset in THEME_PRESETS"
          :key="preset.name"
          type="button"
          severity="secondary"
          rounded
          :aria-pressed="themeStore.themeName === preset.name"
          :aria-label="preset.name"
          :style="{
            '--theme-swatch': getPresetPrimaryColor(preset, themeStore.isDark),
            backgroundColor: getPresetPrimaryColor(preset, themeStore.isDark),
          }"
          class="c-theme-swatch p-0 min-w-0 border border-border transition-all duration-scale-lg ease-in-out focus:outline-none focus:ring focus:ring-primary ring-offset-[var(--spacing-xs)] ring-offset-background hover:border-muted-foreground"
          :class="[
            themeStore.themeName === preset.name &&
              'border-primary ring ring-primary/30 ring-offset-[var(--spacing-xs)] ring-offset-background',
          ]"
          @click="themeStore.setTheme(preset.name)"
        />
      </div>
    </div>

    <!-- 尺寸 -->
    <div class="between-start flex-col gap-gap-sm">
      <label class="fs-sm font-medium text-muted-foreground">{{ t('settings.size') }}</label>
      <SelectButton
        :model-value="sizeStore.sizeName"
        :options="sizeOptions"
        option-value="value"
        option-label="label"
        :allow-empty="false"
        class="w-full"
        @update:model-value="(v: SizeMode) => sizeStore.setSize(v)"
      />
    </div>

    <!-- 布局模式 -->
    <div class="between-start flex-col gap-gap-sm">
      <label class="fs-sm font-medium text-muted-foreground">{{ t('settings.layoutMode') }}</label>
      <SelectButton
        :model-value="layoutStore.mode"
        :options="layoutModeOptions"
        option-value="value"
        :option-label="(opt: { value: AdminLayoutMode; labelKey: string }) => t(opt.labelKey)"
        :allow-empty="false"
        class="w-full"
        @update:model-value="onLayoutModeChange"
      />
    </div>

    <!-- 语言 -->
    <div class="between-start flex-col gap-gap-sm">
      <label class="fs-sm font-medium text-muted-foreground">{{ t('settings.locale') }}</label>
      <Select
        :model-value="locale"
        :options="localeOptions"
        option-value="value"
        option-label="label"
        placeholder="-"
        class="w-full"
        @update:model-value="
          (v: SupportedLocale | null) => {
            if (v) void switchLocale(v)
          }
        "
      />
    </div>

    <!-- 切换动画 -->
    <div class="between-start flex-col gap-gap-sm">
      <label class="fs-sm font-medium text-muted-foreground">{{
        t('settings.transitionEffect')
      }}</label>
      <div class="flex flex-wrap gap-gap-md">
        <div
          v-for="opt in transitionOptions"
          :key="opt.value"
          v-tooltip.top="t(opt.labelKey)"
          :aria-pressed="themeStore.transitionMode === opt.value"
          :aria-label="t(opt.labelKey)"
          class="c-cp hover:scale-120 active:scale-80 duration-scale-xl"
          @click="themeStore.setTransitionMode(opt.value)"
        >
          <Icons
            class="text-muted-foreground"
            :class="[themeStore.transitionMode === opt.value && 'text-primary']"
            :name="opt.icon"
            size="3xl"
          />
        </div>
      </div>
    </div>

    <!-- 过渡时长 -->
    <div class="full between-start flex-col gap-gap-sm">
      <div class="flex items-center justify-between">
        <label class="fs-sm font-medium text-muted-foreground">{{
          t('settings.transitionDuration')
        }}</label>
        <span class="fs-sm font-medium text-primary">{{ t(currentDurationLabel) }}</span>
      </div>
      <Slider
        :model-value="durationIndex"
        :min="0"
        :max="DURATION_VALUES.length - 1"
        :step="1"
        class="w-full"
        @update:model-value="onDurationSliderChange"
      />
    </div>
  </div>
</template>
