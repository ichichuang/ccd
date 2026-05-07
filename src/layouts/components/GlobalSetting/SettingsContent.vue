<script setup lang="ts">
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'
import { useThemeStore } from '@/stores/modules/system'
import { useSizeStore } from '@/stores/modules/system'
import { useLayoutStore } from '@/stores/modules/system'
import { useDeviceStore } from '@/stores/modules/system'
import { useLocale } from '@/hooks/modules/useLocale'
import {
  THEME_PRESETS,
  TRANSITION_DURATION_OPTIONS,
  getPresetPrimaryColor,
} from '@/constants/theme'
import { SIZE_PRESETS } from '@/constants/size'
import type { SupportedLocale } from '@/locales'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import SelectButton from 'primevue/selectbutton'
import Select from 'primevue/select'
import Slider from 'primevue/slider'
import ToggleSwitch from 'primevue/toggleswitch'
import { Icons } from '@/components/Icons'

defineEmits(['close'])

const { t } = useI18n()
const { mode, setThemeWithAnimation } = useThemeSwitch()
const themeStore = useThemeStore()
const deviceStore = useDeviceStore()
const sizeStore = useSizeStore()
const layoutStore = useLayoutStore()
const { locale, switchLocale, supportedLocales } = useLocale()
const { isMobile, isMobileTerminal } = storeToRefs(deviceStore)
const isPC = computed(() => !isMobile.value)

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

// 尺寸选项（来自 SIZE_PRESETS，文案走 i18n）
const sizeOptionKeys: Record<SizeMode, string> = {
  compact: 'settings.sizeCompact',
  comfortable: 'settings.sizeComfortable',
  loose: 'settings.sizeLoose',
}
const sizeOptions = computed(() =>
  SIZE_PRESETS.map(p => ({ value: p.name, label: t(sizeOptionKeys[p.name]) }))
)

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
  const preferredVisibility = layoutStore.visibilitySettings[layoutStore.preferredMode]
  // Header 关闭时，其子模块没有独立展示意义；UI 上禁用以避免困惑
  if (!preferredVisibility.showHeader && (key === 'showMenu' || key === 'showLogo')) return true
  // Breadcrumb 关闭时，Icon 没有意义；UI 上禁用
  if (!preferredVisibility.showBreadcrumb && key === 'showBreadcrumbIcon') return true
  return false
}

const allowedLayoutModuleKeys = computed<LayoutModuleVisibilityKey[]>(() => {
  const mode = layoutStore.preferredMode
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
  layoutStore.setPreferredMode(value)
}

function onThemeModeChange(value: ThemeMode) {
  setThemeWithAnimation(value)
}
</script>

<template>
  <div
    id="global-settings-content"
    class="flex flex-col px-sm md:px-md gap-md md:gap-lg xl:gap-xl"
  >
    <!-- 深色 / 浅色 -->
    <template v-if="!isMobileTerminal">
      <div class="flex flex-col gap-xs md:gap-sm">
        <label class="text-sm font-medium text-muted-foreground">
          {{ t('settings.themeMode') }}
        </label>
        <div class="layout-full">
          <SelectButton
            :model-value="mode"
            :options="themeModeOptions"
            option-value="value"
            :option-label="opt => t(opt.labelKey)"
            :allow-empty="false"
            class="w-full"
            @update:model-value="onThemeModeChange"
          />
        </div>
      </div>

      <div class="border-b border-b-solid border-border opacity-50"></div>
    </template>

    <!-- 系统配色 -->
    <div class="flex flex-col gap-xs md:gap-sm">
      <label class="text-sm font-medium text-muted-foreground">
        {{ t('settings.themePreset') }}
      </label>
      <div class="flex flex-wrap gap-lg">
        <div
          v-for="preset in THEME_PRESETS"
          :id="`theme-preset-${preset.name}`"
          :key="preset.name"
          :aria-pressed="themeStore.themeName === preset.name"
          :aria-label="preset.name"
          :style="{
            backgroundColor: getPresetPrimaryColor(preset, themeStore.isDark),
          }"
          class="w-[var(--spacing-xl)] h-[var(--spacing-xl)] rounded-md center cursor-pointer select-none transition-all duration-md hover:scale-105 active:scale-95"
          :class="
            themeStore.themeName === preset.name
              ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
              : ''
          "
          @click="themeStore.setTheme(preset.name)"
        >
          <Icons
            v-if="themeStore.themeName === preset.name"
            name="i-lucide-check"
            class="text-primary-foreground drop-shadow-md text-sm transition-transform duration-sm ease-out-expo"
          />
        </div>
      </div>
    </div>

    <div class="border-b border-b-solid border-border opacity-50"></div>

    <!-- 尺寸 -->
    <div class="flex flex-col gap-xs md:gap-sm">
      <label class="text-sm font-medium text-muted-foreground">
        {{ t('settings.size') }}
      </label>
      <div>
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
    </div>

    <div class="border-b border-b-solid border-border opacity-50"></div>

    <!-- 语言 -->
    <div class="flex flex-col gap-xs md:gap-sm">
      <label class="text-sm font-medium text-muted-foreground">
        {{ t('settings.locale') }}
      </label>
      <div>
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

    <div class="border-b border-b-solid border-border opacity-50"></div>

    <!-- 布局模式（始终展示：控制用户偏好 preferredMode） -->
    <div
      v-if="!isMobile"
      class="flex flex-col items-start justify-between gap-xs md:gap-sm"
    >
      <label class="text-sm font-medium text-muted-foreground">
        {{ t('settings.layoutMode') }}
      </label>
      <SelectButton
        :model-value="layoutStore.preferredMode"
        :options="layoutModeOptions"
        option-value="value"
        :option-label="opt => t(opt.labelKey)"
        :allow-empty="false"
        class="w-full"
        @update:model-value="onLayoutModeChange"
      />
    </div>

    <!-- 布局模块显示（按 preferredMode 配置，不随 effectiveMode 跳变） -->
    <div
      v-if="!isMobile"
      class="flex flex-col items-start justify-between gap-xs md:gap-sm"
    >
      <label class="text-sm font-medium text-muted-foreground">
        {{ t('settings.layoutModules') }}
      </label>
      <div class="layout-full flex flex-col gap-xs md:gap-sm">
        <div
          v-for="item in visibleLayoutModuleSwitches"
          :key="item.key"
          class="row-between gap-sm md:gap-md"
        >
          <span class="text-sm text-foreground">
            {{ t(item.labelKey) }}
          </span>
          <ToggleSwitch
            :model-value="layoutStore.visibilitySettings[layoutStore.preferredMode][item.key]"
            :disabled="isLayoutModuleSwitchDisabled(item.key)"
            @update:model-value="(v: boolean) => layoutStore.setModuleVisible(item.key, v)"
          />
        </div>
        <!-- 侧边栏手风琴模式 -->
        <div class="row-between gap-sm md:gap-md">
          <span class="text-sm text-foreground">
            {{ t('settings.sidebarAccordion') }}
          </span>
          <ToggleSwitch
            :model-value="layoutStore.sidebarUniqueOpened"
            @update:model-value="
              (v: boolean) => layoutStore.updateSetting('sidebarUniqueOpened', v)
            "
          />
        </div>
      </div>
    </div>

    <!-- 切换动画 -->
    <div
      v-if="isPC"
      class="flex flex-col gap-xs md:gap-sm"
    >
      <label class="text-sm font-medium text-muted-foreground">
        {{ t('settings.transitionEffect') }}
      </label>
      <div class="flex flex-wrap gap-sm md:gap-md">
        <div
          v-for="opt in transitionOptions"
          :id="`theme-transition-${opt.value}`"
          :key="opt.value"
          v-tooltip.top="t(opt.labelKey)"
          :aria-pressed="themeStore.transitionMode === opt.value"
          :aria-label="t(opt.labelKey)"
          class="interaction-shrink transition-all duration-md ease-in-out hover:-translate-y-1 p-xs rounded-md"
          :class="[themeStore.transitionMode === opt.value && 'bg-primary/10 shadow-sm']"
          @click="themeStore.setTransitionMode(opt.value)"
        >
          <Icons
            class="transition-colors duration-md ease-in-out"
            :class="[
              themeStore.transitionMode === opt.value ? 'text-primary!' : 'text-muted-foreground',
            ]"
            :name="opt.icon"
            size="3xl"
          />
        </div>
      </div>
    </div>

    <!-- 过渡时长 -->
    <div
      v-if="isPC"
      class="layout-full flex flex-col gap-xs md:gap-sm"
    >
      <div class="row-between">
        <label class="text-sm font-medium text-muted-foreground">
          {{ t('settings.transitionDuration') }}
        </label>
        <span class="text-sm font-medium text-accent">
          {{ t(currentDurationLabel) }}
        </span>
      </div>
      <div class="layout-full">
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
  </div>
</template>
