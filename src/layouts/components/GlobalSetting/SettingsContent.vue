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
import ToggleSwitch from 'primevue/toggleswitch'
import Icons from '@/components/Icons/Icons.vue'

defineEmits(['close'])

const { t } = useI18n()
const { mode, isAnimating, setThemeWithAnimation } = useThemeSwitch()
const themeStore = useThemeStore()
const sizeStore = useSizeStore()
const layoutStore = useLayoutStore()
const { locale, switchLocale, supportedLocales } = useLocale()

// PrimeVue ToggleSwitch 的 emits/props 类型在模板类型检查下不够友好，这里用 any
// 避免阻塞 update:model-value 的常规用法。
const ToggleSwitchAny = ToggleSwitch as any

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
  { value: 'curtain', icon: 'i-lucide-panel-left', labelKey: 'settings.transitionCurtain' },
  { value: 'diamond', icon: 'i-lucide-diamond', labelKey: 'settings.transitionDiamond' },
  { value: 'fade', icon: 'i-lucide-sun-moon', labelKey: 'settings.transitionFade' },
  { value: 'glitch', icon: 'i-lucide-sparkles', labelKey: 'settings.transitionGlitch' },
  { value: 'implosion', icon: 'i-lucide-minimize-2', labelKey: 'settings.transitionImplosion' },
  { value: 'circle', icon: 'i-lucide-circle-dot', labelKey: 'settings.transitionCircle' },
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

type LayoutModuleVisibilityKey =
  | 'showHeader'
  | 'showMenu'
  | 'showLogo'
  | 'showSidebar'
  | 'showBreadcrumb'
  | 'showBreadcrumbIcon'
  | 'showTabs'
  | 'showFooter'

const layoutModuleSwitches: { key: LayoutModuleVisibilityKey; labelKey: string }[] = [
  { key: 'showHeader', labelKey: 'settings.showHeader' },
  { key: 'showMenu', labelKey: 'settings.showMenu' },
  { key: 'showLogo', labelKey: 'settings.showLogo' },
  { key: 'showSidebar', labelKey: 'settings.showSidebar' },
  { key: 'showBreadcrumb', labelKey: 'settings.showBreadcrumb' },
  { key: 'showBreadcrumbIcon', labelKey: 'settings.showBreadcrumbIcon' },
  { key: 'showTabs', labelKey: 'settings.showTabs' },
  { key: 'showFooter', labelKey: 'settings.showFooter' },
]

function isLayoutModuleSwitchDisabled(key: LayoutModuleVisibilityKey): boolean {
  // Header 关闭时，Menu/Logo 即使打开也不会渲染；UI 上禁用以避免困惑
  if (!layoutStore.showHeader && (key === 'showMenu' || key === 'showLogo')) return true
  // Breadcrumb 关闭时，Icon 没有意义；UI 上禁用
  if (!layoutStore.showBreadcrumb && key === 'showBreadcrumbIcon') return true
  return false
}

const allowedLayoutModuleKeys = computed<LayoutModuleVisibilityKey[]>(() => {
  const mode = layoutStore.mode
  if (mode === 'vertical') {
    return [
      'showHeader',
      'showLogo',
      'showSidebar',
      'showBreadcrumb',
      'showBreadcrumbIcon',
      'showTabs',
      'showFooter',
    ]
  }
  if (mode === 'horizontal') {
    return [
      'showHeader',
      'showLogo',
      'showMenu',
      'showBreadcrumb',
      'showBreadcrumbIcon',
      'showTabs',
      'showFooter',
    ]
  }
  // mix
  return [
    'showHeader',
    'showLogo',
    'showMenu',
    'showSidebar',
    'showBreadcrumb',
    'showBreadcrumbIcon',
    'showTabs',
    'showFooter',
  ]
})

const visibleLayoutModuleSwitches = computed(() =>
  layoutModuleSwitches.filter(item => allowedLayoutModuleKeys.value.includes(item.key))
)

function onLayoutModeChange(value: AdminLayoutMode) {
  layoutStore.setLayoutMode(value)
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
      <div class="full flex gap-gap-md px-padding-sm">
        <template
          v-for="opt in themeModeOptions"
          :key="opt.value"
        >
          <Button
            :label="t(opt.labelKey)"
            :disabled="isAnimating"
            raised
            :variant="mode === opt.value ? '' : 'outlined'"
            @click="onThemeModeChange(opt.value)"
          />
        </template>
      </div>
    </div>

    <!-- 系统配色 -->
    <div class="between-start flex-col gap-gap-sm">
      <label class="fs-sm font-medium text-muted-foreground">{{ t('settings.themePreset') }}</label>
      <div class="full flex flex-wrap gap-gap-md px-padding-sm">
        <Button
          v-for="preset in THEME_PRESETS"
          :key="preset.name"
          type="button"
          severity="secondary"
          rounded
          :aria-pressed="themeStore.themeName === preset.name"
          :aria-label="preset.name"
          :style="{
            backgroundColor: getPresetPrimaryColor(preset, themeStore.isDark),
          }"
          class="c-theme-swatch p-0 transition-all! duration-scale-lg! hover:scale-120! active:scale-80!"
          :class="[themeStore.themeName === preset.name && 'border-primary  ']"
          @click="themeStore.setTheme(preset.name)"
        />
      </div>
    </div>

    <!-- 尺寸 -->
    <div class="between-start flex-col gap-gap-sm">
      <label class="fs-sm font-medium text-muted-foreground">{{ t('settings.size') }}</label>
      <div class="px-padding-sm">
        <SelectButton
          :model-value="sizeStore.sizeName"
          :options="sizeOptions"
          option-value="value"
          option-label="label"
          :allow-empty="false"
          class="w-full"
          size="small"
          @update:model-value="(v: SizeMode) => sizeStore.setSize(v)"
        />
      </div>
    </div>

    <!-- 语言 -->
    <div class="between-start flex-col gap-gap-sm">
      <label class="fs-sm font-medium text-muted-foreground">{{ t('settings.locale') }}</label>
      <div class="px-padding-sm">
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
        size="small"
        class="w-full"
        @update:model-value="onLayoutModeChange"
      />
    </div>

    <!-- 布局模块显示 -->
    <div class="between-start flex-col gap-gap-sm">
      <label class="fs-sm font-medium text-muted-foreground">
        {{ t('settings.layoutModules') }}
      </label>
      <div class="full stack gap-gap-sm px-padding-sm">
        <div
          v-for="item in visibleLayoutModuleSwitches"
          :key="item.key"
          class="between-start gap-gap-md"
        >
          <span class="fs-sm text-foreground">{{ t(item.labelKey) }}</span>
          <ToggleSwitchAny
            :model-value="layoutStore[item.key]"
            :disabled="isLayoutModuleSwitchDisabled(item.key)"
            @update:model-value="(v: boolean) => layoutStore.setModuleVisible(item.key, v)"
          />
        </div>
        <!-- 侧边栏手风琴模式 -->
        <div class="between-start gap-gap-md">
          <span class="fs-sm text-foreground">{{ t('settings.sidebarAccordion') }}</span>
          <ToggleSwitchAny
            :model-value="layoutStore.sidebarUniqueOpened"
            @update:model-value="
              (v: boolean) => layoutStore.updateSetting('sidebarUniqueOpened', v)
            "
          />
        </div>
      </div>
    </div>

    <!-- 切换动画 -->
    <div class="between-start flex-col gap-gap-sm">
      <label class="fs-sm font-medium text-muted-foreground">
        {{ t('settings.transitionEffect') }}
      </label>
      <div class="full flex flex-wrap gap-gap-md px-padding-sm">
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
      <div class="full px-padding-sm">
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
    <div class="py-padding-xs"></div>
  </div>
</template>
