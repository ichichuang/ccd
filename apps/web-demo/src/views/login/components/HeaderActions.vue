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
      <span
        class="auth-toolbar__theme-indicator"
        aria-hidden="true"
      />
    </Button>

    <!-- Divider Line -->
    <span class="auth-toolbar__divider" />

    <!-- Locale Selector Trigger + Dropdown (scoped wrapper for positioning) -->
    <div class="auth-locale-anchor relative">
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

      <!-- Dropdown Locale Panel — positioned below trigger via top:100% on this anchor -->
      <Transition name="auth-locale-fade">
        <div
          v-if="isLocaleOpen"
          :id="localePanelId"
          class="auth-locale-panel absolute z-popover select-none"
          role="menu"
          :aria-label="t('login.localeSelect')"
        >
          <div class="col-stretch">
            <Button
              v-for="item in localeOptions"
              :key="item.key"
              type="button"
              severity="secondary"
              variant="text"
              role="menuitemradio"
              :aria-checked="isLocaleActive(item.key)"
              class="auth-locale-item w-full relative"
              :class="{ 'auth-locale-item--active': isLocaleActive(item.key) }"
              @click="selectLocale(item.key)"
            >
              <span
                v-if="isLocaleActive(item.key)"
                class="auth-locale-indicator"
                aria-hidden="true"
              />
              <span class="auth-locale-item__label text-sm">{{ item.label }}</span>
            </Button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.auth-toolbar {
  gap: var(--spacing-xs);
  min-height: calc(var(--control-height-lg) - var(--spacing-xs));
  padding: var(--spacing-xs);
  border: 1px solid rgb(var(--foreground) / 12%);
  border-radius: var(--radius-5xl);
  background:
    linear-gradient(180deg, rgb(var(--card) / 88%), rgb(var(--background) / 72%)),
    rgb(var(--card) / 72%);
  box-shadow:
    0 1px 2px rgb(var(--foreground) / 5%),
    inset 0 1px 0 rgb(var(--foreground) / 5%);
  transition:
    border-color var(--transition-sm) ease-out,
    background-color var(--transition-sm) ease-out,
    box-shadow var(--transition-sm) ease-out;
}

:global(.dark) .auth-toolbar {
  border-color: rgb(var(--foreground) / 16%);
  background:
    linear-gradient(180deg, rgb(var(--card) / 66%), rgb(var(--background) / 76%)),
    rgb(var(--background) / 62%);
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 6%),
    0 1px 2px rgb(var(--background) / 24%);
}

.auth-toolbar:hover {
  border-color: rgb(var(--primary) / 32%);
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 6%),
    0 1px 4px rgb(var(--foreground) / 6%);
}

.auth-toolbar__divider {
  width: 1px;
  height: calc(var(--spacing-lg) - var(--spacing-xs));
  background-color: rgb(var(--border) / 62%);
}

.auth-toolbar__btn {
  position: relative;
  height: calc(var(--control-height-lg) - var(--spacing-sm));
  border: 1px solid transparent !important;
  border-radius: var(--radius-5xl) !important;
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
  width: calc(var(--control-height-lg) - var(--spacing-sm));
  padding: 0 !important;
  background: linear-gradient(
    180deg,
    rgb(var(--card) / 82%),
    rgb(var(--background) / 68%)
  ) !important;
  border-color: rgb(var(--foreground) / 10%) !important;
}

.auth-toolbar__btn--locale {
  min-width: 88px;
  padding: 0 calc(var(--spacing-sm) + var(--spacing-xs)) !important;
}

.auth-toolbar__btn:hover,
.auth-toolbar__btn[aria-expanded='true'] {
  border-color: rgb(var(--border) / 70%) !important;
  background: rgb(var(--card)) !important;
  color: rgb(var(--foreground)) !important;
  box-shadow: 0 1px 3px rgb(var(--background) / 4%) !important;
}

:global(.dark) .auth-toolbar__btn:hover,
:global(.dark) .auth-toolbar__btn[aria-expanded='true'] {
  border-color: rgb(var(--border) / 50%) !important;
  background: rgb(var(--card) / 74%) !important;
  color: rgb(var(--card-foreground)) !important;
  box-shadow: 0 1px 3px rgb(var(--background) / 30%) !important;
}

.auth-toolbar__theme-indicator {
  position: absolute;
  left: 50%;
  bottom: -2px;
  width: var(--spacing-xs);
  height: var(--spacing-xs);
  border-radius: var(--radius-5xl);
  background: rgb(var(--primary));
  transform: translateX(-50%);
}

.auth-toolbar__chevron {
  transition:
    color var(--transition-sm) ease-out,
    opacity var(--transition-sm) ease-out;
}

.auth-toolbar__btn[aria-expanded='true'] .auth-toolbar__chevron {
  color: rgb(var(--primary));
  opacity: 0.92;
}

.auth-locale-anchor {
  display: flex;
  align-items: center;
}

.auth-locale-panel {
  top: calc(100% + var(--spacing-sm));
  right: 0;
  width: max(148px, 100%);
  border: 1px solid rgb(var(--foreground) / 12%);
  border-radius: var(--radius-xl);
  background:
    linear-gradient(180deg, rgb(var(--card) / 97%), rgb(var(--background) / 92%)), rgb(var(--card));
  backdrop-filter: blur(18px) saturate(1.08);
  box-shadow:
    0 2px 4px rgb(var(--foreground) / 6%),
    0 var(--spacing-md) var(--spacing-2xl) rgb(var(--foreground) / 12%),
    inset 0 1px 0 rgb(var(--foreground) / 6%);
  padding: var(--spacing-xs);
}

:global(.dark) .auth-locale-panel {
  border-color: rgb(var(--foreground) / 16%);
  background:
    linear-gradient(180deg, rgb(var(--card) / 82%), rgb(var(--background) / 92%)),
    rgb(var(--background) / 88%);
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 7%),
    0 var(--spacing-md) var(--spacing-2xl) rgb(var(--background) / 48%);
}

.auth-locale-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  height: clamp(32px, calc(var(--control-height-sm) + var(--spacing-xs) / 2), 34px);
  min-height: 0;
  padding: calc(var(--spacing-xs) / 2) calc(var(--spacing-sm) + var(--spacing-xs))
    calc(var(--spacing-xs) / 2) calc(var(--spacing-lg) + var(--spacing-xs) / 2) !important;
  border: 0 !important;
  border-radius: var(--radius-md) !important;
  background: transparent !important;
  color: rgb(var(--muted-foreground)) !important;
  box-shadow: none !important;
  font-weight: 600 !important;
  transition:
    background-color var(--transition-sm) ease-out,
    color var(--transition-sm) ease-out,
    box-shadow var(--transition-sm) ease-out;
}

:global(.dark) .auth-locale-item {
  color: rgb(var(--card-foreground) / 74%) !important;
}

.auth-locale-item:hover {
  background: linear-gradient(
    180deg,
    rgb(var(--foreground) / 6%),
    rgb(var(--foreground) / 3%)
  ) !important;
  color: rgb(var(--foreground)) !important;
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 6%),
    0 1px 4px rgb(var(--foreground) / 5%) !important;
}

:global(.dark) .auth-locale-item:hover {
  background: linear-gradient(
    180deg,
    rgb(var(--foreground) / 10%),
    rgb(var(--foreground) / 5%)
  ) !important;
  color: rgb(var(--card-foreground)) !important;
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 6%),
    0 1px 4px rgb(var(--background) / 20%) !important;
}

.auth-locale-item:active {
  background: rgb(var(--primary) / 8%) !important;
}

.auth-locale-item:focus-visible {
  outline: none !important;
  box-shadow:
    inset 0 0 0 1px rgb(var(--primary) / 42%),
    0 0 0 2px rgb(var(--primary) / 18%) !important;
}

.auth-locale-panel .auth-locale-item:is(.auth-locale-item--active, [aria-checked='true']) {
  color: rgb(var(--primary)) !important;
  background:
    linear-gradient(180deg, rgb(var(--primary) / 14%), rgb(var(--primary) / 8%)),
    rgb(var(--card) / 78%) !important;
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 5%),
    0 0 0 1px rgb(var(--primary) / 18%),
    0 1px 4px rgb(var(--primary) / 0%) !important;
}

:global(.dark)
  .auth-locale-panel
  .auth-locale-item:is(.auth-locale-item--active, [aria-checked='true']) {
  color: rgb(var(--primary) / 96%) !important;
  background:
    linear-gradient(180deg, rgb(var(--primary) / 20%), rgb(var(--primary) / 11%)),
    rgb(var(--background) / 70%) !important;
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 6%),
    0 0 0 1px rgb(var(--primary) / 22%),
    0 1px 4px rgb(var(--primary) / 0%) !important;
}

.auth-locale-panel .auth-locale-item:is(.auth-locale-item--active, [aria-checked='true']):hover,
.auth-locale-panel .auth-locale-item:is(.auth-locale-item--active, [aria-checked='true']):active {
  color: rgb(var(--primary)) !important;
  background:
    linear-gradient(180deg, rgb(var(--primary) / 16%), rgb(var(--primary) / 10%)),
    rgb(var(--card) / 84%) !important;
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 6%),
    0 0 0 1px rgb(var(--primary) / 26%),
    0 1px 4px rgb(var(--primary) / 10%) !important;
}

:global(.dark)
  .auth-locale-panel
  .auth-locale-item:is(.auth-locale-item--active, [aria-checked='true']):hover,
:global(.dark)
  .auth-locale-panel
  .auth-locale-item:is(.auth-locale-item--active, [aria-checked='true']):active {
  color: rgb(var(--primary) / 98%) !important;
  background:
    linear-gradient(180deg, rgb(var(--primary) / 23%), rgb(var(--primary) / 13%)),
    rgb(var(--background) / 76%) !important;
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 7%),
    0 0 0 1px rgb(var(--primary) / 30%),
    0 1px 4px rgb(var(--primary) / 12%) !important;
}

.auth-locale-panel
  .auth-locale-item:is(.auth-locale-item--active, [aria-checked='true']):focus-visible {
  color: rgb(var(--primary)) !important;
  background:
    linear-gradient(180deg, rgb(var(--primary) / 16%), rgb(var(--primary) / 10%)),
    rgb(var(--card) / 84%) !important;
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 6%),
    inset 0 0 0 1px rgb(var(--primary) / 44%),
    0 0 0 2px rgb(var(--primary) / 18%) !important;
}

:global(.dark)
  .auth-locale-panel
  .auth-locale-item:is(.auth-locale-item--active, [aria-checked='true']):focus-visible {
  color: rgb(var(--primary) / 98%) !important;
  background:
    linear-gradient(180deg, rgb(var(--primary) / 23%), rgb(var(--primary) / 13%)),
    rgb(var(--background) / 76%) !important;
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 7%),
    inset 0 0 0 1px rgb(var(--primary) / 48%),
    0 0 0 2px rgb(var(--primary) / 22%) !important;
}

.auth-locale-indicator {
  position: absolute;
  left: calc(var(--spacing-sm) + var(--spacing-xs) / 2);
  top: 50%;
  width: 3px;
  height: clamp(16px, calc(var(--spacing-md) + var(--spacing-xs) / 2), 18px);
  border-radius: var(--radius-5xl);
  background: rgb(var(--primary));
  transform: translateY(-50%);
}

.auth-locale-item__label {
  flex: 1 1 auto;
  min-width: 0;
  font-size: var(--font-size-sm);
  font-weight: inherit;
  line-height: 1;
  text-align: left;
  white-space: nowrap;
}

.auth-locale-fade-enter-active,
.auth-locale-fade-leave-active {
  transition:
    opacity var(--transition-sm) ease-out,
    transform var(--transition-sm) ease-out;
}

.auth-locale-fade-enter-from,
.auth-locale-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .auth-locale-fade-enter-active,
  .auth-locale-fade-leave-active {
    transition: opacity var(--transition-sm) ease-out;
  }

  .auth-locale-fade-enter-from,
  .auth-locale-fade-leave-to {
    transform: none;
  }
}
</style>
