<script setup lang="ts">
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'
import { useThemeStore } from '@/stores/modules/system'
import { useSizeStore } from '@/stores/modules/system'
import { useLayoutStore } from '@/stores/modules/system'
import { useLocale } from '@/hooks/modules/useLocale'
import { useLayoutRuntime } from '@/hooks/layout/useLayoutRuntime'
import {
  THEME_PRESETS,
  TRANSITION_DURATION_OPTIONS,
  getPresetPrimaryColor,
} from '@ccd/design-tokens'
import type { ThemeMode, ThemeTransitionDuration, ThemeTransitionMode } from '@ccd/design-tokens'
import { SIZE_PRESETS } from '@ccd/design-tokens'
import type { SupportedLocale } from '@/locales'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import { CScrollbar } from '@ccd/vue-ui'
import { Icons } from '@ccd/vue-ui'

defineEmits(['close'])

const { t } = useI18n()
const { mode, setThemeWithAnimation } = useThemeSwitch()
const themeStore = useThemeStore()
const sizeStore = useSizeStore()
const layoutStore = useLayoutStore()
const runtime = useLayoutRuntime()
const { locale, switchLocale, supportedLocales } = useLocale()
const isMobile = computed(() => runtime.isMobile.value)
const isMobileTerminal = computed(() => runtime.deviceType.value === 'Mobile')
const isPC = computed(() => runtime.isDesktop.value)

type SettingOption<TValue extends string | number> = {
  value: TValue
  label: string
}

// 主题模式选项 (light | dark | auto)
const themeModeOptions = computed<SettingOption<ThemeMode>[]>(() => [
  { value: 'light', label: t('settings.themeModeLight') },
  { value: 'dark', label: t('settings.themeModeDark') },
  { value: 'auto', label: t('settings.themeModeAuto') },
])

// 布局模式选项 (vertical | horizontal | mix)
const layoutModeOptions = computed<SettingOption<AdminLayoutMode>[]>(() => [
  { value: 'vertical', label: t('settings.layoutVertical') },
  { value: 'horizontal', label: t('settings.layoutHorizontal') },
  { value: 'mix', label: t('settings.layoutMix') },
])

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

const PRESET_ACTIVE_CLASS = 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-sm'
const PRESET_INACTIVE_CLASS = 'opacity-90 hover:opacity-100 hover:shadow-md'
const TRANSITION_ACTIVE_CLASS = '!bg-primary/10 !text-primary ring-1 ring-primary/35'
const TRANSITION_INACTIVE_CLASS = '!text-muted-foreground hover:!bg-muted/60 hover:!text-foreground'

function onTransitionDurationChange(value: ThemeTransitionDuration) {
  themeStore.setTransitionDuration(value)
}

const currentDurationLabel = computed(
  () =>
    TRANSITION_DURATION_OPTIONS.find(o => o.value === themeStore.transitionDuration)?.labelKey ??
    'settings.durationComfortable'
)

const durationOptions = computed<SettingOption<ThemeTransitionDuration>[]>(() =>
  TRANSITION_DURATION_OPTIONS.map(o => ({ value: o.value, label: `${o.value}ms` }))
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

const currentVisibilitySettings = computed(
  () => layoutStore.visibilitySettings[layoutStore.preferredMode]
)

function isLayoutModuleSwitchDisabled(key: LayoutModuleVisibilityKey): boolean {
  // Header 关闭时，其子模块没有独立展示意义；UI 上禁用以避免困惑
  if (!currentVisibilitySettings.value.showHeader && (key === 'showMenu' || key === 'showLogo')) {
    return true
  }
  // Breadcrumb 关闭时，Icon 没有意义；UI 上禁用
  if (!currentVisibilitySettings.value.showBreadcrumb && key === 'showBreadcrumbIcon') return true
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
    class="col-stretch h-[min(78vh,720px)] min-w-0"
  >
    <div class="col-fill min-w-0">
      <CScrollbar
        class="pr-xs"
        :options="{ overflow: { x: 'hidden' } }"
      >
        <div class="col-stretch gap-md px-xs py-md">
          <section class="col-stretch gap-md rounded-lg bg-muted/30 p-md">
            <header
              class="grid grid-cols-[var(--spacing-xl)_minmax(0,1fr)] items-center gap-sm min-w-0"
            >
              <span
                class="surface-primary center rounded-md shrink-0 w-[var(--spacing-xl)] h-[var(--spacing-xl)]"
              >
                <Icons
                  name="i-lucide-sun-moon"
                  size="sm"
                  class="text-current"
                />
              </span>
              <span
                id="global-settings-theme-mode"
                class="text-sm font-semibold text-foreground text-ellipsis-1"
              >
                {{ t('settings.themeMode') }}
              </span>
            </header>

            <SelectButton
              v-if="!isMobileTerminal"
              :model-value="mode"
              :options="themeModeOptions"
              option-value="value"
              option-label="label"
              :allow-empty="false"
              fluid
              @update:model-value="onThemeModeChange"
            >
              <template #option="{ option }">
                <span class="block min-w-0 max-w-full text-sm font-medium text-ellipsis-1">
                  {{ option.label }}
                </span>
              </template>
            </SelectButton>

            <div class="row-start flex-wrap gap-sm">
              <Button
                v-for="preset in THEME_PRESETS"
                :id="`theme-preset-${preset.name}`"
                :key="preset.name"
                type="button"
                text
                rounded
                :aria-pressed="themeStore.themeName === preset.name"
                :aria-label="preset.name"
                :style="{
                  backgroundColor: getPresetPrimaryColor(preset, themeStore.isDark),
                }"
                class="interaction-shrink w-[var(--spacing-xl)] h-[var(--spacing-xl)] !p-0 !rounded-md border border-solid border-transparent"
                :class="
                  themeStore.themeName === preset.name ? PRESET_ACTIVE_CLASS : PRESET_INACTIVE_CLASS
                "
                @click="themeStore.setTheme(preset.name)"
              >
                <Icons
                  v-if="themeStore.themeName === preset.name"
                  name="i-lucide-check"
                  size="sm"
                  class="text-primary-foreground drop-shadow-md"
                />
              </Button>
            </div>
          </section>

          <section class="col-stretch gap-md rounded-lg bg-muted/30 p-md">
            <header
              class="grid grid-cols-[var(--spacing-xl)_minmax(0,1fr)] items-center gap-sm min-w-0"
            >
              <span
                class="surface-info center rounded-md shrink-0 w-[var(--spacing-xl)] h-[var(--spacing-xl)]"
              >
                <Icons
                  name="i-lucide-sliders-horizontal"
                  size="sm"
                  class="text-current"
                />
              </span>
              <span class="text-sm font-semibold text-foreground text-ellipsis-1">
                {{ t('settings.size') }} / {{ t('settings.locale') }}
              </span>
            </header>

            <div class="col-stretch gap-md">
              <section class="col-stretch gap-sm">
                <label
                  id="global-settings-size"
                  class="text-xs font-medium text-muted-foreground text-ellipsis-1"
                >
                  {{ t('settings.size') }}
                </label>
                <SelectButton
                  :model-value="sizeStore.sizeName"
                  :options="sizeOptions"
                  option-value="value"
                  option-label="label"
                  :allow-empty="false"
                  fluid
                  @update:model-value="(v: SizeMode) => sizeStore.setSize(v)"
                >
                  <template #option="{ option }">
                    <span class="block min-w-0 max-w-full text-sm font-medium text-ellipsis-1">
                      {{ option.label }}
                    </span>
                  </template>
                </SelectButton>
              </section>

              <section class="col-stretch gap-sm">
                <label
                  id="global-settings-locale"
                  class="text-xs font-medium text-muted-foreground text-ellipsis-1"
                >
                  {{ t('settings.locale') }}
                </label>
                <Select
                  :model-value="locale"
                  :options="localeOptions"
                  option-value="value"
                  option-label="label"
                  placeholder="-"
                  fluid
                  @update:model-value="
                    (v: SupportedLocale | null) => {
                      if (v) void switchLocale(v)
                    }
                  "
                />
              </section>
            </div>
          </section>

          <section
            v-if="!isMobile"
            class="col-stretch gap-md rounded-lg bg-muted/30 p-md"
          >
            <header
              class="grid grid-cols-[var(--spacing-xl)_minmax(0,1fr)] items-center gap-sm min-w-0"
            >
              <span
                class="surface-success center rounded-md shrink-0 w-[var(--spacing-xl)] h-[var(--spacing-xl)]"
              >
                <Icons
                  name="i-lucide-layout-panel-left"
                  size="sm"
                  class="text-current"
                />
              </span>
              <span
                id="global-settings-layout-mode"
                class="text-sm font-semibold text-foreground text-ellipsis-1"
              >
                {{ t('settings.layoutMode') }}
              </span>
            </header>

            <!-- 布局模式（始终展示：控制用户偏好 preferredMode） -->
            <section class="col-stretch gap-sm">
              <SelectButton
                :model-value="layoutStore.preferredMode"
                :options="layoutModeOptions"
                option-value="value"
                option-label="label"
                :allow-empty="false"
                fluid
                @update:model-value="onLayoutModeChange"
              >
                <template #option="{ option }">
                  <span class="block min-w-0 max-w-full text-sm font-medium text-ellipsis-1">
                    {{ option.label }}
                  </span>
                </template>
              </SelectButton>
            </section>

            <!-- 布局模块显示（按 preferredMode 配置，不随 effectiveMode 跳变） -->
            <section class="col-stretch gap-sm">
              <label class="text-xs font-medium text-muted-foreground text-ellipsis-1">
                {{ t('settings.layoutModules') }}
              </label>
              <div class="col-stretch gap-xs rounded-md bg-background/45 p-xs">
                <div
                  v-for="item in visibleLayoutModuleSwitches"
                  :key="item.key"
                  class="row-between gap-sm min-w-0 rounded-md px-sm py-xs"
                >
                  <span class="text-sm text-foreground text-ellipsis-1">
                    {{ t(item.labelKey) }}
                  </span>
                  <ToggleSwitch
                    :model-value="currentVisibilitySettings[item.key]"
                    :disabled="isLayoutModuleSwitchDisabled(item.key)"
                    @update:model-value="(v: boolean) => layoutStore.setModuleVisible(item.key, v)"
                  />
                </div>
                <!-- 侧边栏手风琴模式 -->
                <div class="row-between gap-sm min-w-0 rounded-md px-sm py-xs">
                  <span class="text-sm text-foreground text-ellipsis-1">
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
            </section>
          </section>

          <section
            v-if="isPC"
            class="col-stretch gap-md rounded-lg bg-muted/30 p-md"
          >
            <header
              class="grid grid-cols-[var(--spacing-xl)_minmax(0,1fr)] items-center gap-sm min-w-0"
            >
              <span
                class="surface-warn center rounded-md shrink-0 w-[var(--spacing-xl)] h-[var(--spacing-xl)]"
              >
                <Icons
                  name="i-lucide-sparkles"
                  size="sm"
                  class="text-current"
                />
              </span>
              <span class="text-sm font-semibold text-foreground text-ellipsis-1">
                {{ t('settings.transitionEffect') }}
              </span>
            </header>

            <!-- 切换动画 -->
            <section class="col-stretch gap-sm">
              <div class="grid grid-cols-3 sm:grid-cols-6 gap-sm">
                <Button
                  v-for="opt in transitionOptions"
                  :id="`theme-transition-${opt.value}`"
                  :key="opt.value"
                  v-tooltip.top="t(opt.labelKey)"
                  type="button"
                  text
                  rounded
                  :aria-pressed="themeStore.transitionMode === opt.value"
                  :aria-label="t(opt.labelKey)"
                  class="interaction-shrink aspect-square !p-0 rounded-md"
                  :class="
                    themeStore.transitionMode === opt.value
                      ? TRANSITION_ACTIVE_CLASS
                      : TRANSITION_INACTIVE_CLASS
                  "
                  @click="themeStore.setTransitionMode(opt.value)"
                >
                  <Icons
                    :name="opt.icon"
                    size="2xl"
                    class="text-current"
                  />
                </Button>
              </div>
            </section>

            <!-- 过渡时长 -->
            <section class="col-stretch gap-sm">
              <div class="row-between gap-sm min-w-0">
                <label class="text-xs font-medium text-muted-foreground text-ellipsis-1">
                  {{ t('settings.transitionDuration') }}
                </label>
                <span class="text-xs font-semibold text-primary text-no-wrap">
                  {{ t(currentDurationLabel) }}
                </span>
              </div>
              <div class="rounded-md bg-background/45 p-xs">
                <SelectButton
                  :model-value="themeStore.transitionDuration"
                  :options="durationOptions"
                  option-value="value"
                  option-label="label"
                  :allow-empty="false"
                  fluid
                  @update:model-value="onTransitionDurationChange"
                >
                  <template #option="{ option }">
                    <span class="block min-w-0 max-w-full text-xs font-semibold text-ellipsis-1">
                      {{ option.label }}
                    </span>
                  </template>
                </SelectButton>
              </div>
            </section>
          </section>
        </div>
      </CScrollbar>
    </div>
  </div>
</template>
