<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'
import { useLocale } from '@/hooks/modules/useLocale'
import {
  MENU_ADMIN_CONTEXT_ICON_UNIFIED,
  MENU_ADMIN_CONTEXT_ITEM_UNIFIED,
  MENU_ADMIN_CONTEXT_PANEL_UNIFIED,
} from '@/constants/layout-menu'
import type { SupportedLocale } from '@/locales'

interface LocaleOption {
  key: SupportedLocale
  label: string
}

defineOptions({ name: 'LoginHeaderActions' })

const route = useRoute()
const { isDark, toggleThemeWithAnimation } = useThemeSwitch()
const { locale, switchLocale, supportedLocales } = useLocale()
const { t } = useI18n({ useScope: 'global' })

const utilityRootRef = ref<HTMLElement | null>(null)
const isLocaleOpen = ref(false)

const localePanelId = 'login-locale-panel'

const localeShortLabelMap: Record<SupportedLocale, string> = {
  'zh-CN': '简体',
  'en-US': 'EN',
}

const activeLocaleOption = computed(
  () => supportedLocales.find(item => item.key === locale.value) ?? supportedLocales[0]
)

const activeLocaleLabel = computed<string>(() => {
  const option = activeLocaleOption.value
  return option ? localeShortLabelMap[option.key] : localeShortLabelMap[locale.value]
})

const localeOptions = computed<LocaleOption[]>(() =>
  supportedLocales.map(item => ({
    key: item.key,
    label: item.name,
  }))
)

function isLocaleActive(key: SupportedLocale): boolean {
  return key === locale.value
}

function closeLocalePanel(): void {
  isLocaleOpen.value = false
}

function toggleLocalePanel(): void {
  isLocaleOpen.value = !isLocaleOpen.value
}

async function selectLocale(key: SupportedLocale): Promise<void> {
  closeLocalePanel()
  await switchLocale(key)
}

function onDocumentPointerDown(event: MouseEvent): void {
  if (!isLocaleOpen.value) return
  const target = event.target
  if (!(target instanceof Node)) return
  if (utilityRootRef.value?.contains(target)) return
  closeLocalePanel()
}

function onWindowKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') closeLocalePanel()
}

function handleThemeToggle(event?: MouseEvent): void {
  void toggleThemeWithAnimation(event ?? null)
}

watch(
  () => route.fullPath,
  () => closeLocalePanel()
)

onMounted(() => {
  document.addEventListener('mousedown', onDocumentPointerDown, true)
  window.addEventListener('keydown', onWindowKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentPointerDown, true)
  window.removeEventListener('keydown', onWindowKeydown)
})
</script>

<template>
  <header
    ref="utilityRootRef"
    class="login-utility-bar relative row-center gap-2xs rounded-lg border border-solid border-border/35 bg-card/75 p-2xs shadow-sm backdrop-blur-md"
  >
    <Button
      severity="secondary"
      variant="text"
      class="h-[var(--spacing-lg)] w-[var(--spacing-lg)] rounded-md border-0 bg-transparent p-0! text-muted-foreground shadow-none transition-colors duration-sm hover:bg-primary/8 hover:text-primary ring-focus-focus"
      :aria-label="t('login.themeToggle')"
      :aria-pressed="isDark"
      @click="handleThemeToggle"
    >
      <Icons
        :name="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
        size="sm"
      />
    </Button>

    <Button
      severity="secondary"
      variant="text"
      class="h-[var(--spacing-lg)] rounded-md border-0 bg-transparent px-xs! py-0! text-muted-foreground shadow-none transition-colors duration-sm hover:bg-primary/8 hover:text-primary ring-focus-focus"
      :aria-label="t('login.localeSelect')"
      aria-haspopup="menu"
      :aria-expanded="isLocaleOpen"
      :aria-controls="localePanelId"
      @click="toggleLocalePanel"
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

    <Transition name="login-locale-popup">
      <div
        v-if="isLocaleOpen"
        :id="localePanelId"
        :class="[
          MENU_ADMIN_CONTEXT_PANEL_UNIFIED,
          'login-locale-popup absolute left-1/2 top-[calc(100%+var(--spacing-xs))] z-popover min-w-[132px] -translate-x-1/2 select-none',
        ]"
        role="menu"
        :aria-label="t('login.localeSelect')"
      >
        <div class="col-stretch gap-xs">
          <Button
            v-for="item in localeOptions"
            :key="item.key"
            type="button"
            severity="secondary"
            variant="text"
            role="menuitemradio"
            :aria-checked="isLocaleActive(item.key)"
            :class="[
              MENU_ADMIN_CONTEXT_ITEM_UNIFIED,
              'w-full justify-between border-0! bg-transparent! shadow-none!',
              isLocaleActive(item.key) ? 'bg-primary/10! text-primary!' : '',
            ]"
            @click="selectLocale(item.key)"
          >
            <span>{{ item.label }}</span>
            <Icons
              v-if="isLocaleActive(item.key)"
              name="i-lucide-check"
              size="xs"
              :class="MENU_ADMIN_CONTEXT_ICON_UNIFIED"
            />
          </Button>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.login-locale-popup-enter-active,
.login-locale-popup-leave-active {
  transition:
    opacity var(--transition-md) ease-out,
    transform var(--transition-md) ease-out;
  transform-origin: top center;
}

.login-locale-popup-enter-from,
.login-locale-popup-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(0.95);
}
</style>
