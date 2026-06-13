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
  onThemeModeChange,
  onThemePresetChange,
  previewItems,
  selectedSizeDescription,
  selectedThemeName,
  sizeOptions,
  sizeStore,
  themeModeOptions,
  themePresets,
  visibleLayoutModuleSwitches,
} = useSystemSettingsPage()
</script>

<template>
  <section
    id="global-settings-page"
    data-testid="global-settings-page"
    data-archetype="A1-toolbar-content"
    class="col-stretch min-w-0 gap-md p-xs sm:p-sm md:p-md lg:p-lg"
  >
    <header class="material-elevated col-stretch min-w-0 gap-md">
      <div class="row-between gap-md flex-wrap">
        <div class="col-stretch gap-xs min-w-0 max-w-960px">
          <span class="text-xs font-semibold text-primary text-no-wrap">
            {{ t('console.settingsPage.eyebrow') }}
          </span>
          <h1 class="text-2xl font-bold text-foreground m-0">
            {{ t('console.settingsPage.title') }}
          </h1>
          <p class="text-sm text-muted-foreground m-0 text-ellipsis-2">
            {{ t('console.settingsPage.description') }}
          </p>
        </div>

        <Tag
          severity="info"
          :value="t('console.settingsPage.runtimeTag')"
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
      <section class="material-elevated col-stretch min-w-0 gap-md xl:col-span-7">
        <header class="row-between gap-md flex-wrap">
          <div class="col-stretch gap-xs min-w-0">
            <span class="text-xs font-semibold text-primary text-no-wrap">
              {{ t('settings.themeMode') }}
            </span>
            <h2 class="text-lg font-semibold text-foreground m-0">
              {{ t('console.settingsPage.appearance.title') }}
            </h2>
            <p class="text-sm text-muted-foreground m-0">
              {{ t('console.settingsPage.appearance.description') }}
            </p>
          </div>
          <Tag
            :value="selectedThemeName"
            severity="success"
          />
        </header>

        <div class="grid min-w-0 grid-cols-1 gap-md lg:grid-cols-[minmax(0,46%)_minmax(0,1fr)]">
          <section class="demo-well col-stretch min-w-0 gap-sm">
            <span class="text-xs font-medium text-muted-foreground text-ellipsis-1">
              {{ t('settings.themeMode') }}
            </span>
            <SelectButton
              :model-value="mode"
              :options="themeModeOptions"
              option-value="value"
              option-label="label"
              :allow-empty="false"
              fluid
              @update:model-value="onThemeModeChange"
            />
          </section>

          <section class="demo-well col-stretch min-w-0 gap-sm">
            <span class="text-xs font-medium text-muted-foreground text-ellipsis-1">
              {{ t('settings.themePreset') }}
            </span>
            <div class="row-start flex-wrap gap-sm">
              <Button
                v-for="preset in themePresets"
                :key="preset.name"
                type="button"
                text
                rounded
                :aria-pressed="selectedThemeName === preset.name"
                :aria-label="preset.name"
                :style="{ backgroundColor: getThemePresetColor(preset.name) }"
                class="interaction-shrink w-[var(--spacing-xl)] h-[var(--spacing-xl)] !p-0 !rounded-md border border-solid border-transparent"
                @click="onThemePresetChange(preset.name)"
              >
                <Icons
                  v-if="selectedThemeName === preset.name"
                  name="i-lucide-check"
                  size="sm"
                  class="text-primary-foreground drop-shadow-md"
                />
              </Button>
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
              {{ t('console.settingsPage.sizeLocale.title') }}
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
            {{ t('console.settingsPage.layoutMode.title') }}
          </h2>
          <p class="text-sm text-muted-foreground m-0">
            {{ t('console.settingsPage.layoutMode.description') }}
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
              {{ t('console.settingsPage.layoutModules.title') }}
            </h2>
            <p class="text-sm text-muted-foreground m-0">
              {{ t('console.settingsPage.layoutModules.description') }}
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
              {{ t('console.settingsPage.runtimeTag') }}
            </span>
            <h2 class="text-lg font-semibold text-foreground m-0">
              {{ t('console.settingsPage.preview.title') }}
            </h2>
            <p class="text-sm text-muted-foreground m-0">
              {{ t('console.settingsPage.preview.description') }}
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
