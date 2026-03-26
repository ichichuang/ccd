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
    class="animate__animated animate__fadeIn col-stretch gap-md"
    data-archetype="A1-toolbar-content"
  >
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between items-center">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">Theme Store</h2>
            <p class="text-sm text-muted-foreground m-0">
              主题模式与色彩预设控制 — 模式切换经 useThemeSwitch()，预设切换经 themeStore.setTheme()
            </p>
          </div>
          <div class="row-center gap-sm">
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
        <Divider />

        <div class="col-stretch gap-sm">
          <span class="text-sm text-muted-foreground">Theme Mode — useThemeSwitch().setMode()</span>
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
      </section>

      <section class="material-elevated col-stretch gap-md">
        <div class="row-between items-center">
          <h3 class="text-md font-semibold text-foreground m-0">Theme Presets</h3>
          <Tag
            :value="`active: ${themeStore.themeName}`"
            severity="primary"
          />
        </div>
        <Divider />

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
          <button
            v-for="preset in THEME_PRESETS"
            :key="preset.name"
            class="interactive-card rounded-xl p-md col-stretch gap-sm text-start"
            :class="
              themeStore.themeName === preset.name
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                : ''
            "
            @click="themeStore.setTheme(preset.name)"
          >
            <div class="row-between items-center">
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
          </button>
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">Store Details</h3>
        <Divider />
        <div class="grid grid-cols-2 md:grid-cols-4 gap-md">
          <div class="col-stretch gap-xs">
            <span class="text-xs text-muted-foreground">themeName</span>
            <span class="text-sm font-mono text-foreground">{{ themeStore.themeName }}</span>
          </div>
          <div class="col-stretch gap-xs">
            <span class="text-xs text-muted-foreground">mode</span>
            <span class="text-sm font-mono text-foreground">{{ themeStore.mode }}</span>
          </div>
          <div class="col-stretch gap-xs">
            <span class="text-xs text-muted-foreground">transitionMode</span>
            <span class="text-sm font-mono text-foreground">{{ themeStore.transitionMode }}</span>
          </div>
          <div class="col-stretch gap-xs">
            <span class="text-xs text-muted-foreground">accentColor</span>
            <span class="text-sm font-mono text-foreground">
              {{ themeStore.accentColor ?? 'null (preset)' }}
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
