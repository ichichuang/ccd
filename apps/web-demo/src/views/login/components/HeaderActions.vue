<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'
import { useLocale } from '@/hooks/modules/useLocale'
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
  <div
    ref="utilityRootRef"
    class="auth-toolbar relative row-center"
  >
    <!-- Theme Toggle Switcher -->
    <Button
      severity="secondary"
      variant="text"
      class="auth-toolbar__btn auth-toolbar__btn--icon ring-focus-focus"
      :aria-label="t('login.themeToggle')"
      :aria-pressed="isDark"
      @click="handleThemeToggle"
    >
      <Icons
        :name="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
        size="sm"
      />
    </Button>

    <!-- Divider Line -->
    <span class="auth-toolbar__divider" />

    <!-- Locale Selector Trigger -->
    <Button
      severity="secondary"
      variant="text"
      class="auth-toolbar__btn auth-toolbar__btn--locale ring-focus-focus"
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
          class="auth-toolbar__chevron text-muted-foreground"
        />
      </span>
    </Button>

    <!-- Dropdown Locale Panel -->
    <Transition name="auth-locale-fade">
      <div
        v-if="isLocaleOpen"
        :id="localePanelId"
        class="auth-locale-panel absolute left-1/2 z-popover select-none"
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
            class="auth-locale-item w-full justify-start relative"
            :class="{ 'auth-locale-item--active': isLocaleActive(item.key) }"
            @click="selectLocale(item.key)"
          >
            <span
              v-if="isLocaleActive(item.key)"
              class="auth-locale-indicator absolute"
            />
            <span class="text-sm font-medium">{{ item.label }}</span>
          </Button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.auth-toolbar {
  gap: var(--spacing-3xs);
  padding: var(--spacing-3xs);
  border: 1px solid rgb(var(--border) / 50%);
  border-radius: var(--radius-full);
  background: rgb(var(--card) / 42%);
  box-shadow: inset 0 1px 0 rgb(var(--foreground) / 3%);
  transition:
    border-color var(--transition-sm) ease-out,
    background-color var(--transition-sm) ease-out,
    box-shadow var(--transition-sm) ease-out;
}

:global(.dark) .auth-toolbar {
  border-color: rgb(var(--border) / 45%);
  background: rgb(var(--card) / 20%);
}

.auth-toolbar:hover {
  border-color: rgb(var(--primary) / 25%);
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 4%),
    0 1px 3px rgb(var(--foreground) / 4%);
}

.auth-toolbar__divider {
  width: 1px;
  height: 12px;
  background-color: rgb(var(--border) / 50%);
  margin: 0 var(--spacing-3xs);
}

.auth-toolbar__btn {
  height: 28px;
  border: 1px solid transparent !important;
  border-radius: var(--radius-full) !important;
  background: transparent !important;
  color: rgb(var(--muted-foreground)) !important;
  box-shadow: none !important;
  transition:
    background-color var(--transition-sm) ease-out,
    color var(--transition-sm) ease-out,
    border-color var(--transition-sm) ease-out,
    box-shadow var(--transition-sm) ease-out;
}

.auth-toolbar__btn--icon {
  width: 28px;
  padding: 0 !important;
}

.auth-toolbar__btn--locale {
  padding: 0 var(--spacing-sm) !important;
}

.auth-toolbar__btn:hover {
  border-color: rgb(var(--border) / 70%) !important;
  background: rgb(var(--card)) !important;
  color: rgb(var(--foreground)) !important;
  box-shadow: 0 1px 3px rgb(var(--background) / 4%) !important;
}

:global(.dark) .auth-toolbar__btn:hover {
  border-color: rgb(var(--border) / 50%) !important;
  background: rgb(var(--background) / 80%) !important;
  box-shadow: 0 1px 3px rgb(var(--background) / 30%) !important;
}

.auth-toolbar__chevron {
  transition: transform var(--transition-sm) ease-out;
}

.auth-toolbar__btn[aria-expanded='true'] .auth-toolbar__chevron {
  transform: rotate(180deg);
}

.auth-locale-panel {
  top: calc(100% + var(--spacing-sm));
  min-width: 128px;
  transform: translateX(-50%);
  border: 1px solid rgb(var(--border) / 60%) !important;
  background: rgb(var(--card)) !important;
  box-shadow:
    0 1px 2px rgb(var(--foreground) / 4%),
    0 var(--spacing-md) var(--spacing-xl) rgb(var(--foreground) / 10%) !important;
  border-radius: var(--radius-lg) !important;
  padding: var(--spacing-xs) !important;
}

:global(.dark) .auth-locale-panel {
  border-color: rgb(var(--border) / 45%) !important;
  background: rgb(var(--background) / 90%) !important;
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 5%),
    0 var(--spacing-md) var(--spacing-xl) rgb(var(--background) / 45%) !important;
}

.auth-locale-item {
  height: 32px;
  padding: 0 var(--spacing-sm) 0 var(--spacing-xl) !important;
  border: 0 !important;
  border-radius: var(--radius-md) !important;
  background: transparent !important;
  color: rgb(var(--muted-foreground)) !important;
  box-shadow: none !important;
  transition:
    background-color var(--transition-sm) ease-out,
    color var(--transition-sm) ease-out;
}

.auth-locale-item:hover {
  background: rgb(var(--primary) / 6%) !important;
  color: rgb(var(--foreground)) !important;
}

.auth-locale-item--active {
  color: rgb(var(--primary)) !important;
  background: rgb(var(--primary) / 4%) !important;
  font-weight: 600 !important;
}

.auth-locale-indicator {
  left: var(--spacing-sm);
  top: 50%;
  width: calc(var(--spacing-xs) - var(--spacing-3xs));
  height: var(--spacing-md);
  border-radius: var(--radius-full);
  background: rgb(var(--primary));
  transform: translateY(-50%);
}

.auth-locale-fade-enter-active,
.auth-locale-fade-leave-active {
  transition:
    opacity var(--transition-sm) ease-out,
    transform var(--transition-sm) ease-out;
  transform-origin: top center;
}

.auth-locale-fade-enter-from,
.auth-locale-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(0.96);
}
</style>
