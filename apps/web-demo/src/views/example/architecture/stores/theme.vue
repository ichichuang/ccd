<script setup lang="ts">
import { THEME_PRESETS } from '@/constants/theme'

defineOptions({ name: 'ArchitectureStoreTheme' })

const themeStore = useThemeStore()
const { mode, isDark, setMode } = useThemeSwitch()

const themeModes: { label: string; value: ThemeMode; icon: string }[] = [
  { label: 'Auto', value: 'auto', icon: 'i-lucide-sun-moon' },
  { label: 'Light', value: 'light', icon: 'i-lucide-sun' },
  { label: 'Dark', value: 'dark', icon: 'i-lucide-moon' },
  { label: 'Glass', value: 'glass', icon: 'i-lucide-aperture' },
]

function formatName(name: string): string {
  return name
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function getPrimaryColor(preset: (typeof THEME_PRESETS)[number]): string {
  const colors = isDark.value ? preset.colors?.dark : preset.colors?.light
  return colors?.primary?.default ?? '#888888'
}

function getAccentColor(preset: (typeof THEME_PRESETS)[number]): string {
  const colors = isDark.value ? preset.colors?.dark : preset.colors?.light
  return colors?.accent?.default ?? '#aaaaaa'
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
                  name="i-lucide-palette"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">Theme Store</span>
                  <span
                    class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase"
                  >
                    STORE
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  主题模式与色彩预设控制 — 模式切换经 useThemeSwitch()，预设切换经
                  themeStore.setTheme()
                </span>
              </div>
            </div>
            <div class="row-center gap-sm shrink-0">
              <Tag
                :value="`mode: ${mode}`"
                severity="secondary"
              />
              <Tag
                :value="isDark ? 'isDark' : 'isLight'"
                :severity="isDark ? 'info' : 'warn'"
              />
            </div>
          </div>

          <div class="col-stretch gap-sm min-w-0">
            <span class="text-sm text-muted-foreground">
              Theme Mode — useThemeSwitch().setMode()
            </span>
            <div class="row-start flex-wrap gap-sm">
              <Button
                v-for="m in themeModes"
                :key="m.value"
                :label="m.label"
                size="small"
                :severity="mode === m.value ? 'primary' : 'secondary'"
                @click="setMode(m.value)"
              >
                <template #icon>
                  <Icons
                    :name="m.icon"
                    size="xs"
                    class="mr-xs"
                  />
                </template>
              </Button>
            </div>
          </div>
        </header>

        <section class="glass-card col-stretch gap-md min-w-0">
          <div class="row-between gap-sm min-w-0 shrink-0">
            <div class="row-start gap-xs min-w-0">
              <Icons
                name="i-lucide-swatches"
                size="sm"
                class="text-muted-foreground"
              />
              <span class="text-sm font-semibold text-foreground text-no-wrap">Theme Presets</span>
            </div>
            <Tag
              :value="`active: ${themeStore.themeName}`"
              severity="primary"
            />
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md min-w-0">
            <div
              v-for="preset in THEME_PRESETS"
              :key="preset.name"
              v-tap="() => themeStore.setTheme(preset.name)"
              class="interactive-card motion-lift rounded-xl p-md col-stretch gap-sm text-start min-w-0"
              :class="
                themeStore.themeName === preset.name
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : ''
              "
            >
              <div class="row-between min-w-0">
                <span class="text-xs font-medium text-foreground text-ellipsis-1">
                  {{ formatName(preset.name) }}
                </span>
                <div
                  v-if="themeStore.themeName === preset.name"
                  class="w-[var(--spacing-sm)] h-[var(--spacing-sm)] rounded-full bg-primary shrink-0"
                />
              </div>
              <div class="row-start gap-xs">
                <div
                  class="flex-1 h-[5px] rounded-full"
                  :style="{ background: getPrimaryColor(preset) }"
                />
                <div
                  class="flex-1 h-[5px] rounded-full"
                  :style="{ background: getAccentColor(preset) }"
                />
              </div>
            </div>
          </div>
        </section>

        <section class="glass-card col-stretch gap-md min-w-0">
          <div class="row-start gap-xs min-w-0">
            <Icons
              name="i-lucide-info"
              size="sm"
              class="text-muted-foreground"
            />
            <span class="text-sm font-semibold text-foreground text-no-wrap">Store Details</span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-md min-w-0">
            <div class="col-stretch gap-xs min-w-0">
              <span class="text-xs text-muted-foreground">themeName</span>
              <span class="text-sm font-mono text-foreground">{{ themeStore.themeName }}</span>
            </div>
            <div class="col-stretch gap-xs min-w-0">
              <span class="text-xs text-muted-foreground">mode</span>
              <span class="text-sm font-mono text-foreground">{{ themeStore.mode }}</span>
            </div>
            <div class="col-stretch gap-xs min-w-0">
              <span class="text-xs text-muted-foreground">transitionMode</span>
              <span class="text-sm font-mono text-foreground">
                {{ themeStore.transitionMode }}
              </span>
            </div>
            <div class="col-stretch gap-xs min-w-0">
              <span class="text-xs text-muted-foreground">accentColor</span>
              <span class="text-sm font-mono text-foreground">
                {{ themeStore.accentColor ?? 'null (preset)' }}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
