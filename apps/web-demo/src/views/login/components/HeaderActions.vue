<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'
import { useLocale } from '@/hooks/modules/useLocale'
import type { SupportedLocale } from '@/locales'

defineOptions({ name: 'LoginHeaderActions' })

defineProps<{
  compact: boolean
}>()

const { isDark, toggleThemeWithAnimation } = useThemeSwitch()
const { locale, switchLocale, supportedLocales } = useLocale()
const { t } = useI18n({ useScope: 'global' })
const localeMenuRef = ref()

const localeShortLabelMap: Record<SupportedLocale, string> = {
  'zh-CN': '简体',
  'en-US': 'EN',
}

const activeLocaleOption = computed(
  () => supportedLocales.find(item => item.key === locale.value) ?? supportedLocales[0]
)

const activeLocaleLabel = computed<string>(() => {
  const option = activeLocaleOption.value
  if (!option) return localeShortLabelMap[locale.value]
  return `${option.flag} ${localeShortLabelMap[option.key]}`
})

const localeMenuItems = computed(() =>
  supportedLocales.map(item => ({
    label: `${item.flag} ${item.name}`,
    command: () => {
      void switchLocale(item.key)
    },
  }))
)

function toggleLocaleMenu(event: MouseEvent): void {
  localeMenuRef.value?.toggle(event)
}

function handleThemeToggle(event?: MouseEvent): void {
  void toggleThemeWithAnimation(event ?? null)
}
</script>

<template>
  <header
    class="absolute z-layout row-end gap-xs"
    :class="compact ? 'right-sm top-sm max-w-[calc(100vw-var(--spacing-md))]' : 'right-lg top-lg'"
  >
    <span
      role="button"
      tabindex="0"
      class="center h-[var(--spacing-xl)] w-[var(--spacing-xl)] cursor-pointer rounded-md text-muted-foreground duration-md hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      :class="
        compact
          ? 'h-[var(--spacing-lg)] w-[var(--spacing-lg)]'
          : 'h-[var(--spacing-xl)] w-[var(--spacing-xl)]'
      "
      :aria-label="t('login.themeToggle')"
      :aria-pressed="isDark"
      @click="handleThemeToggle"
      @keydown.enter.prevent="handleThemeToggle()"
      @keydown.space.prevent="handleThemeToggle()"
    >
      <Icons
        :name="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
        size="sm"
      />
    </span>
    <Button
      severity="secondary"
      variant="outlined"
      class="rounded-full border border-solid border-border bg-card/80 text-foreground shadow-none duration-md"
      :class="compact ? 'px-sm! py-xs!' : ''"
      :aria-label="t('login.localeSelect')"
      aria-haspopup="menu"
      @click="toggleLocaleMenu"
    >
      <span class="row-center gap-xs text-sm">
        <span>{{ activeLocaleLabel }}</span>
        <Icons
          name="i-lucide-chevron-down"
          size="xs"
          class="text-muted-foreground"
        />
      </span>
    </Button>
    <Menu
      ref="localeMenuRef"
      :model="localeMenuItems"
      popup
    />
  </header>
</template>
