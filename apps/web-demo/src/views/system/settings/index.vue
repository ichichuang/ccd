<script setup lang="ts">
import { CcdSelectButton as SelectButton } from '@ccd/vue-ui'
import { useSystemSettingsPage } from '@/hooks/modules/system/useSystemSettingsPage'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'SystemGlobalSettingsPage' })

const { t } = useI18n()
const {
  currentVisibilitySettings,
  getThemePresetColor,
  isLayoutModuleSwitchDisabled,
  layoutModeOptions,
  layoutStore,
  locale,
  localeOptions,
  mode,
  onLayoutModeChange,
  onLocaleChange,
  onModuleToggle,
  onSizeChange,
  onTransitionDurationChange,
  onTransitionModeChange,
  onThemeModeChange,
  onThemePresetChange,
  previewItems,
  selectedSizeDescription,
  selectedThemeName,
  selectedTransitionEffectIcon,
  selectedTransitionEffectLabel,
  sizeOptions,
  sizeStore,
  transitionDuration,
  transitionDurationOptions,
  transitionMode,
  transitionModeOptions,
  themeModeOptions,
  themePresets,
  visibleLayoutModuleSwitches,
} = useSystemSettingsPage()
</script>

<template>
  <section
    id="global-settings-page"
    data-archetype="A1-toolbar-content"
    class="col-stretch min-w-0 gap-md p-xs sm:p-sm md:p-md lg:p-lg"
  >
    <header class="material-elevated col-stretch min-w-0 gap-md">
      <div class="row-between gap-md flex-wrap">
        <div class="col-stretch gap-xs min-w-0 max-w-960px">
          <span class="text-xs font-semibold text-primary text-no-wrap">
            {{ t('settingsPage.eyebrow') }}
          </span>
          <h1 class="text-2xl font-bold text-foreground m-0">
            {{ t('settingsPage.title') }}
          </h1>
          <p class="text-sm text-muted-foreground m-0 text-ellipsis-2">
            {{ t('settingsPage.description') }}
          </p>
        </div>

        <Tag
          severity="info"
          :value="t('settingsPage.runtimeTag')"
        />
      </div>

      <div class="grid min-w-0 grid-cols-1 gap-sm md:grid-cols-4">
        <div
          v-for="item in previewItems"
          :key="item.label"
          class="demo-well col-stretch min-w-0 gap-xs"
        >
          <span class="text-xs font-medium text-muted-foreground text-ellipsis-1">
            {{ item.label }}
          </span>
          <strong class="text-sm text-foreground text-ellipsis-1">{{ item.value }}</strong>
        </div>
      </div>
    </header>

    <div class="grid min-w-0 grid-cols-1 gap-md xl:grid-cols-12">
      <section class="material-elevated col-stretch min-w-0 gap-md xl:col-span-12">
        <header class="row-between gap-md flex-wrap">
          <div class="col-stretch gap-xs min-w-0">
            <span class="text-xs font-semibold text-primary text-no-wrap">
              {{ t('settings.themeMode') }}
            </span>
            <h2 class="text-lg font-semibold text-foreground m-0">
              {{ t('settingsPage.appearance.title') }}
            </h2>
            <p class="text-sm text-muted-foreground m-0">
              {{ t('settingsPage.appearance.description') }}
            </p>
          </div>
          <Tag
            :value="selectedThemeName"
            severity="success"
          />
        </header>

        <div class="grid min-w-0 grid-cols-1 gap-md xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section class="demo-well col-stretch min-w-0 gap-md">
            <div class="col-stretch min-w-0 gap-xs">
              <span class="text-xs font-medium text-muted-foreground text-ellipsis-1">
                {{ t('settings.themeMode') }}
              </span>
            </div>

            <SelectButton
              :model-value="mode"
              :options="themeModeOptions"
              option-value="value"
              option-label="label"
              :allow-empty="false"
              fluid
              @update:model-value="onThemeModeChange"
            />

            <div class="col-stretch min-w-0 gap-sm pt-sm">
              <span class="text-xs font-medium text-muted-foreground text-ellipsis-1">
                {{ t('settings.themePreset') }}
              </span>
              <div class="row-start flex-wrap gap-sm">
                <button
                  v-for="preset in themePresets"
                  :key="preset.name"
                  type="button"
                  class="theme-preset-swatch"
                  :aria-pressed="selectedThemeName === preset.name"
                  :aria-label="preset.name"
                  :style="{ backgroundColor: getThemePresetColor(preset.name) }"
                  @click="onThemePresetChange(preset.name)"
                >
                  <Icons
                    v-if="selectedThemeName === preset.name"
                    name="i-lucide-check"
                    size="sm"
                    class="text-primary-foreground drop-shadow-md"
                  />
                </button>
              </div>
            </div>
          </section>

          <section class="demo-well col-stretch min-w-0 gap-md">
            <div class="row-between min-w-0 gap-md">
              <div class="col-stretch min-w-0 gap-xs">
                <span class="text-xs font-medium text-muted-foreground text-ellipsis-1">
                  {{ t('settings.transitionEffect') }}
                </span>
                <strong class="text-sm text-foreground text-ellipsis-1">
                  {{ selectedTransitionEffectLabel }}
                </strong>
              </div>
              <Tag
                severity="info"
                :value="`${transitionDuration}ms`"
              />
            </div>

            <div class="grid min-w-0 grid-cols-2 gap-sm lg:grid-cols-3">
              <button
                v-for="option in transitionModeOptions"
                :key="option.value"
                type="button"
                class="transition-effect-option"
                :aria-pressed="transitionMode === option.value"
                :aria-label="option.label"
                @click="onTransitionModeChange(option.value)"
              >
                <Icons
                  :name="option.icon"
                  size="sm"
                  color="text-current"
                  class="transition-effect-icon"
                />
                <span class="transition-effect-label">
                  {{ option.label }}
                </span>
                <Icons
                  v-if="transitionMode === option.value"
                  name="i-lucide-check"
                  size="sm"
                  class="transition-effect-check"
                />
              </button>
            </div>

            <div class="grid min-w-0 grid-cols-1 gap-md">
              <div
                aria-hidden="true"
                class="demo-stage grid min-w-0 grid-cols-3 gap-xs p-sm"
              >
                <div class="surface-warn col-center min-w-0 gap-xs rounded-md p-sm">
                  <Icons
                    name="i-lucide-sun"
                    size="lg"
                  />
                </div>
                <div class="surface-primary col-center min-w-0 gap-xs rounded-md p-sm">
                  <Icons
                    :name="selectedTransitionEffectIcon"
                    size="lg"
                  />
                  <span class="text-xs font-medium text-ellipsis-1">
                    {{ selectedTransitionEffectLabel }}
                  </span>
                </div>
                <div class="surface-info col-center min-w-0 gap-xs rounded-md p-sm">
                  <Icons
                    name="i-lucide-moon"
                    size="lg"
                  />
                </div>
              </div>

              <div class="col-stretch min-w-0 gap-sm">
                <span class="text-xs font-medium text-muted-foreground text-ellipsis-1">
                  {{ t('settings.transitionDuration') }}
                </span>
                <SelectButton
                  :model-value="transitionDuration"
                  :options="transitionDurationOptions"
                  option-value="value"
                  option-label="label"
                  :allow-empty="false"
                  fluid
                  @update:model-value="onTransitionDurationChange"
                />
              </div>
            </div>
          </section>
        </div>
      </section>

      <section class="material-elevated col-stretch min-w-0 gap-md xl:col-span-5">
        <header class="row-between gap-md">
          <div class="col-stretch gap-xs min-w-0">
            <span class="text-xs font-semibold text-primary text-no-wrap">
              {{ t('settings.size') }}
            </span>
            <h2 class="text-lg font-semibold text-foreground m-0">
              {{ t('settingsPage.sizeLocale.title') }}
            </h2>
            <p class="text-sm text-muted-foreground m-0">
              {{ selectedSizeDescription }}
            </p>
          </div>
          <Icons
            name="i-lucide-sliders-horizontal"
            size="xl"
            class="text-primary"
          />
        </header>

        <div class="grid min-w-0 grid-cols-1 gap-md">
          <section class="demo-well col-stretch min-w-0 gap-sm">
            <span class="text-xs font-medium text-muted-foreground text-ellipsis-1">
              {{ t('settings.size') }}
            </span>
            <SelectButton
              :model-value="sizeStore.sizeName"
              :options="sizeOptions"
              option-value="value"
              option-label="label"
              :allow-empty="false"
              fluid
              @update:model-value="onSizeChange"
            />
          </section>

          <section class="demo-well col-stretch min-w-0 gap-sm">
            <span class="text-xs font-medium text-muted-foreground text-ellipsis-1">
              {{ t('settings.locale') }}
            </span>
            <Select
              :model-value="locale"
              :options="localeOptions"
              option-value="value"
              option-label="label"
              fluid
              @update:model-value="onLocaleChange"
            />
          </section>
        </div>
      </section>

      <section class="material-elevated col-stretch min-w-0 gap-md xl:col-span-4">
        <header class="col-stretch gap-xs">
          <span class="text-xs font-semibold text-primary text-no-wrap">
            {{ t('settings.layoutMode') }}
          </span>
          <h2 class="text-lg font-semibold text-foreground m-0">
            {{ t('settingsPage.layoutMode.title') }}
          </h2>
          <p class="text-sm text-muted-foreground m-0">
            {{ t('settingsPage.layoutMode.description') }}
          </p>
        </header>

        <section class="demo-well col-stretch min-w-0 gap-sm">
          <SelectButton
            :model-value="layoutStore.preferredMode"
            :options="layoutModeOptions"
            option-value="value"
            option-label="label"
            :allow-empty="false"
            fluid
            @update:model-value="onLayoutModeChange"
          />
        </section>

        <div class="grid min-w-0 grid-cols-3 gap-sm">
          <div
            v-for="item in previewItems.slice(0, 3)"
            :key="item.label"
            class="surface-info col-center gap-xs rounded-md p-sm text-center"
          >
            <span class="text-xs text-ellipsis-1">
              {{ item.label }}
            </span>
            <strong class="text-sm text-ellipsis-1">
              {{ item.value }}
            </strong>
          </div>
        </div>
      </section>

      <section class="material-elevated col-stretch min-w-0 gap-md xl:col-span-8">
        <header class="row-between gap-md flex-wrap">
          <div class="col-stretch gap-xs min-w-0">
            <span class="text-xs font-semibold text-primary text-no-wrap">
              {{ t('settings.showHeader') }}
            </span>
            <h2 class="text-lg font-semibold text-foreground m-0">
              {{ t('settingsPage.layoutModules.title') }}
            </h2>
            <p class="text-sm text-muted-foreground m-0">
              {{ t('settingsPage.layoutModules.description') }}
            </p>
          </div>
          <Icons
            name="i-lucide-panels-top-left"
            size="xl"
            class="text-primary"
          />
        </header>

        <div class="grid min-w-0 grid-cols-1 gap-sm md:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="item in visibleLayoutModuleSwitches"
            :key="item.key"
            class="demo-well row-between min-w-0 gap-sm"
          >
            <span class="text-sm text-foreground text-ellipsis-1">
              {{ t(item.labelKey) }}
            </span>
            <ToggleSwitch
              :model-value="currentVisibilitySettings[item.key]"
              :disabled="isLayoutModuleSwitchDisabled(item.key)"
              @update:model-value="value => onModuleToggle(item.key, value)"
            />
          </div>

          <div class="demo-well row-between min-w-0 gap-sm">
            <span class="text-sm text-foreground text-ellipsis-1">
              {{ t('settings.sidebarAccordion') }}
            </span>
            <ToggleSwitch
              :model-value="layoutStore.sidebarUniqueOpened"
              @update:model-value="
                value => {
                  if (typeof value === 'boolean') {
                    layoutStore.updateSetting('sidebarUniqueOpened', value)
                  }
                }
              "
            />
          </div>
        </div>
      </section>

      <section class="material-elevated col-stretch min-w-0 gap-md xl:col-span-12">
        <header class="row-between gap-md flex-wrap">
          <div class="col-stretch gap-xs min-w-0">
            <span class="text-xs font-semibold text-primary text-no-wrap">
              {{ t('settingsPage.runtimeTag') }}
            </span>
            <h2 class="text-lg font-semibold text-foreground m-0">
              {{ t('settingsPage.preview.title') }}
            </h2>
            <p class="text-sm text-muted-foreground m-0">
              {{ t('settingsPage.preview.description') }}
            </p>
          </div>
          <Icons
            name="i-lucide-monitor-smartphone"
            size="xl"
            class="text-primary"
          />
        </header>

        <div class="grid min-w-0 grid-cols-1 gap-sm md:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="item in previewItems"
            :key="item.label"
            class="demo-well row-between min-w-0 gap-sm"
          >
            <span class="text-sm text-muted-foreground text-ellipsis-1">{{ item.label }}</span>
            <Tag
              severity="info"
              :value="item.value"
            />
          </div>
        </div>
      </section>
    </div>

    <div
      aria-hidden="true"
      class="shrink-0 h-[calc(var(--footer-height)+var(--spacing-2xl)+var(--safe-bottom))]"
    />
  </section>
</template>

<style scoped>
.theme-preset-swatch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--spacing-xl);
  height: var(--spacing-xl);
  appearance: none;
  padding: 0;
  border: thin solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition-property: border-color, outline-color, transform;
  transition-duration: var(--transition-sm);
}

.theme-preset-swatch:hover,
.theme-preset-swatch[aria-pressed='true'] {
  border-color: rgb(var(--primary-foreground) / 72%);
}

.theme-preset-swatch:active {
  transform: scale(0.96);
}

.theme-preset-swatch:focus-visible,
.transition-effect-option:focus-visible {
  outline: thin solid rgb(var(--primary));
  outline-offset: calc(var(--spacing-xs) / 2);
}

.transition-effect-option {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
  min-height: var(--control-height-sm);
  appearance: none;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: thin solid rgb(var(--border));
  border-radius: var(--radius-md);
  background-color: rgb(var(--background) / 42%);
  color: rgb(var(--foreground));
  text-align: left;
  cursor: pointer;
  transition-property: background-color, border-color, color;
  transition-duration: var(--transition-sm);
}

.transition-effect-option:hover {
  background-color: rgb(var(--primary) / 8%);
  border-color: rgb(var(--primary) / 28%);
  color: rgb(var(--primary));
}

.transition-effect-option[aria-pressed='true'] {
  background-color: rgb(var(--primary) / 14%);
  border-color: rgb(var(--primary) / 42%);
  color: rgb(var(--primary));
}

.transition-effect-icon,
.transition-effect-check {
  flex-shrink: 0;
}

.transition-effect-check {
  margin-left: auto;
}

.transition-effect-label {
  min-width: 0;
  overflow: hidden;
  font-size: var(--font-size-sm);
  font-weight: 600;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
