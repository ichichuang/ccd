<script setup lang="ts">
import { THEME_PRESETS } from '@ccd/design-tokens'
import { useThemeStore } from '@/stores/modules/system'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'AuthPalettePicker' })

const { t } = useI18n({ useScope: 'global' })
const themeStore = useThemeStore()

const activeTheme = computed(() => themeStore.themeName)

// Each orb maps a theme preset to a compact hue descriptor for the preview control.
const paletteMeta: Record<string, { label: string; hue: string }> = {
  'morandi-elegance': { label: '莫兰迪', hue: '210' },
  'soft-morandi-pastels': { label: '柔彩', hue: '249' },
  'modern-calm-neutrals': { label: '暖沙', hue: '25' },
  'eco-nature-earth': { label: '大地', hue: '18' },
  'elevated-digital-pastels': { label: '数字蓝', hue: '214' },
  'warm-modern-sunset': { label: '日落', hue: '24' },
  'royal-amethyst': { label: '紫晶', hue: '268' },
  'emerald-forest': { label: '翠林', hue: '145' },
  'midnight-deep-sea': { label: '深海', hue: '197' },
  'industrial-tech': { label: '工业', hue: '220' },
}

const presets = computed(() =>
  THEME_PRESETS.map(p => ({
    name: p.name,
    label: paletteMeta[p.name]?.label ?? p.name,
    hue: paletteMeta[p.name]?.hue ?? '0',
  }))
)

function selectTheme(name: string): void {
  themeStore.setTheme(name)
}
</script>

<template>
  <div
    class="auth-palette-picker"
    data-testid="auth-palette-picker"
    role="group"
    :aria-label="t('settings.themePreset')"
  >
    <Button
      v-for="preset in presets"
      :key="preset.name"
      type="button"
      severity="secondary"
      variant="text"
      class="auth-palette-orb"
      :class="{ 'auth-palette-orb--active': activeTheme === preset.name }"
      :aria-label="preset.label"
      :aria-pressed="activeTheme === preset.name"
      :style="{ '--orb-hue': preset.hue }"
      @click="selectTheme(preset.name)"
    >
      <span
        class="auth-palette-orb__specular"
        aria-hidden="true"
      />
      <span
        v-if="activeTheme === preset.name"
        class="auth-palette-orb__dot"
        aria-hidden="true"
      />
    </Button>
  </div>
</template>

<style scoped>
.auth-palette-picker {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: calc(var(--spacing-xs) + 2px);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid rgb(var(--foreground) / 8%);
  border-radius: var(--radius-5xl);
  background: rgb(var(--card) / 38%);
  box-shadow: inset 0 1px 0 rgb(var(--foreground) / 5%);
}

.auth-palette-orb {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--spacing-lg);
  height: var(--spacing-lg);
  min-width: var(--spacing-lg) !important;
  border: 1px solid hsl(var(--orb-hue) 38% 66% / 38%) !important;
  border-radius: var(--radius-5xl) !important;
  background:
    radial-gradient(circle at 32% 28%, hsl(var(--orb-hue) 50% 96% / 58%) 0%, transparent 50%),
    radial-gradient(circle at 68% 72%, hsl(var(--orb-hue) 44% 62% / 32%) 0%, transparent 60%),
    linear-gradient(145deg, hsl(var(--orb-hue) 52% 72% / 82%), hsl(var(--orb-hue) 46% 52% / 72%)) !important;
  box-shadow:
    inset 0 1px 0 hsl(var(--orb-hue) 60% 88% / 60%),
    0 2px 5px hsl(var(--orb-hue) 40% 40% / 14%) !important;
  cursor: pointer;
  outline: none;
  opacity: 0.76;
  padding: 0 !important;
  transition:
    opacity var(--transition-sm) ease-out,
    box-shadow var(--transition-sm) ease-out,
    border-color var(--transition-sm) ease-out;
}

:global(.dark) .auth-palette-orb {
  border-color: hsl(var(--orb-hue) 32% 52% / 36%);
  background:
    radial-gradient(circle at 32% 28%, hsl(var(--orb-hue) 46% 76% / 44%) 0%, transparent 50%),
    radial-gradient(circle at 68% 72%, hsl(var(--orb-hue) 36% 40% / 28%) 0%, transparent 60%),
    linear-gradient(145deg, hsl(var(--orb-hue) 44% 52% / 72%), hsl(var(--orb-hue) 38% 32% / 64%)) !important;
  box-shadow:
    inset 0 1px 0 hsl(var(--orb-hue) 52% 72% / 36%),
    0 2px 8px hsl(var(--orb-hue) 34% 20% / 22%) !important;
}

.auth-palette-orb:hover {
  border-color: hsl(var(--orb-hue) 50% 62% / 64%) !important;
  box-shadow:
    inset 0 1px 0 hsl(var(--orb-hue) 60% 88% / 66%),
    0 0 0 3px hsl(var(--orb-hue) 48% 60% / 18%),
    0 3px 8px hsl(var(--orb-hue) 40% 40% / 22%) !important;
  opacity: 0.98;
}

:global(.dark) .auth-palette-orb:hover {
  border-color: hsl(var(--orb-hue) 44% 56% / 56%) !important;
  box-shadow:
    inset 0 1px 0 hsl(var(--orb-hue) 52% 72% / 44%),
    0 0 0 3px hsl(var(--orb-hue) 40% 48% / 16%),
    0 3px 8px hsl(var(--orb-hue) 32% 24% / 32%) !important;
}

.auth-palette-orb:focus-visible {
  box-shadow:
    inset 0 1px 0 hsl(var(--orb-hue) 60% 88% / 60%),
    0 0 0 3px hsl(var(--orb-hue) 52% 56% / 44%),
    0 2px 6px hsl(var(--orb-hue) 40% 40% / 18%) !important;
  opacity: 1;
}

.auth-palette-orb--active {
  border-color: hsl(var(--orb-hue) 56% 68% / 82%) !important;
  box-shadow:
    inset 0 1px 0 hsl(var(--orb-hue) 60% 88% / 72%),
    0 0 0 2px hsl(var(--orb-hue) 54% 62% / 54%),
    0 0 0 4px hsl(var(--orb-hue) 50% 56% / 18%),
    0 4px 12px hsl(var(--orb-hue) 44% 44% / 28%) !important;
  opacity: 1;
}

:global(.dark) .auth-palette-orb--active {
  border-color: hsl(var(--orb-hue) 50% 60% / 74%) !important;
  box-shadow:
    inset 0 1px 0 hsl(var(--orb-hue) 52% 72% / 52%),
    0 0 0 2px hsl(var(--orb-hue) 46% 50% / 48%),
    0 0 0 4px hsl(var(--orb-hue) 42% 44% / 14%),
    0 4px 14px hsl(var(--orb-hue) 36% 28% / 38%) !important;
}

.auth-palette-orb__specular {
  position: absolute;
  top: 18%;
  left: 18%;
  width: 36%;
  height: 22%;
  border-radius: var(--radius-5xl);
  background: hsl(var(--orb-hue) 60% 98% / 52%);
  filter: blur(2px);
  pointer-events: none;
}

.auth-palette-orb__dot {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: var(--spacing-xs);
  height: var(--spacing-xs);
  border-radius: var(--radius-5xl);
  background: hsl(var(--orb-hue) 60% 98% / 92%);
  box-shadow: 0 0 0 1px hsl(var(--orb-hue) 56% 64% / 48%);
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .auth-palette-orb {
    transition:
      opacity var(--transition-sm) ease-out,
      box-shadow var(--transition-sm) ease-out;
  }
}
</style>
