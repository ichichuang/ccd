<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { brand } from '@/constants/brand'
import { useDeviceStore } from '@/stores/modules/system'
import { useLoading } from '@/hooks/layout/useLoading'
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'
import { useLocale } from '@/hooks/modules/useLocale'
import type { SupportedLocale } from '@/locales'
import { useAuth } from '@/hooks/modules/useAuth'
import type { LoginParams } from '@/types/dto/auth.dto'
import type { FormSchema, ProFormExpose } from '@/components/ProForm'

defineOptions({ name: 'LoginPage' })

const AnimatedCharacters = defineAsyncComponent(
  () => import('./components/animated-characters/Index.vue')
)

function scheduleIdle(fn: () => void): void {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(
      () => {
        fn()
      },
      { timeout: 2000 }
    )
  } else {
    setTimeout(fn, 0)
  }
}

onMounted(() => {
  scheduleIdle(() => {
    void import('@/views/dashboard/index.vue')
  })
})

type LoginFormValues = LoginParams

const formRef = ref<ProFormExpose | null>(null)

const isUsernameFocused = ref<boolean>(false)
const isPasswordVisible = ref<boolean>(false)
const passwordValue = ref<string>('')

const passwordLength = computed<number>(() => {
  if (passwordValue.value.length > 0) return passwordValue.value.length
  const inst = formRef.value
  if (!inst) return 0
  const raw = inst.getFormState().values.password
  return typeof raw === 'string' ? raw.length : 0
})

const deviceStore = useDeviceStore()
const isMobileLayout = computed<boolean>(() => deviceStore.isMobileLayout)
const { toggleThemeWithAnimation } = useThemeSwitch()
const { locale, switchLocale, supportedLocales } = useLocale()
const { t } = useI18n({ useScope: 'global' })
const { startLoading } = useLoading()

const localeOptions = computed<Array<{ value: SupportedLocale; label: string }>>(() =>
  supportedLocales.map(l => ({ value: l.key, label: `${l.flag} ${l.name}` }))
)

function readObjectProperty(source: unknown, key: string): unknown {
  if (typeof source !== 'object' || source === null) return undefined
  if (!Reflect.has(source, key)) return undefined
  return Reflect.get(source, key)
}

function readTrimmedStringProperty(source: unknown, key: string): string {
  const value = readObjectProperty(source, key)
  return typeof value === 'string' && value.trim().length > 0 ? value : ''
}

function isSupportedLocale(value: unknown): value is SupportedLocale {
  return value === 'zh-CN' || value === 'en-US'
}

function onLocaleChange(event: unknown): void {
  const nextValue = readObjectProperty(event, 'value')
  if (!isSupportedLocale(nextValue)) return
  void switchLocale(nextValue)
}

function getErrorMessage(error: unknown): string {
  const maybeMessage = readTrimmedStringProperty(error, 'message')
  if (maybeMessage) return maybeMessage

  const maybeData = readObjectProperty(error, 'data')
  return readTrimmedStringProperty(maybeData, 'message')
}

function getInputValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function commitInputValue(onUpdate: (value: unknown) => void, value: unknown): string {
  const nextValue = typeof value === 'string' ? value : ''
  onUpdate(nextValue)
  return nextValue
}

function handlePasswordUpdate(onUpdate: (value: unknown) => void, value: unknown): void {
  passwordValue.value = commitInputValue(onUpdate, value)
}

function handleUsernameFocus(): void {
  isUsernameFocused.value = true
}

function handleUsernameBlur(): void {
  isUsernameFocused.value = false
}

type ParsedAppInfo = {
  pkg?: { version?: string }
  lastBuildTime?: string
}

function parseAppInfo(): ParsedAppInfo {
  const appInfo: unknown = __APP_INFO__
  if (typeof appInfo === 'object' && appInfo !== null) {
    return {
      pkg: {
        version: readTrimmedStringProperty(readObjectProperty(appInfo, 'pkg'), 'version'),
      },
      lastBuildTime: readTrimmedStringProperty(appInfo, 'lastBuildTime'),
    }
  }

  if (typeof appInfo !== 'string') return {}

  try {
    const parsed: unknown = JSON.parse(appInfo)
    return {
      pkg: {
        version: readTrimmedStringProperty(readObjectProperty(parsed, 'pkg'), 'version'),
      },
      lastBuildTime: readTrimmedStringProperty(parsed, 'lastBuildTime'),
    }
  } catch {
    return {}
  }
}

const parsedAppInfo: ParsedAppInfo = parseAppInfo()

const appVersion: string =
  typeof parsedAppInfo?.pkg?.version === 'string' ? parsedAppInfo.pkg.version : ''

const versionLabel: string = appVersion ? `v${appVersion}` : ''

const buildYear: string = (() => {
  const lastBuildTime = parsedAppInfo?.lastBuildTime
  if (typeof lastBuildTime !== 'string') return ''
  const match = lastBuildTime.match(/^(\d{4})/)
  return match?.[1] ?? ''
})()

const loginFooterText: string = (() => {
  const parts: string[] = [brand.displayName]
  if (versionLabel) parts.push(versionLabel)
  const base = parts.join(' ')
  if (!buildYear) return base
  return `${base} © ${buildYear}`
})()

const loginSchema = computed<FormSchema>(() => ({
  fields: [
    {
      name: 'username',
      component: 'input',
      label: t('login.usernameLabel'),
      required: true,
      rules: [
        {
          message: t('login.usernameRequired'),
          validator: v => typeof v === 'string' && v.trim().length > 0,
        },
        {
          message: t('login.usernameLength'),
          validator: v => typeof v === 'string' && v.trim().length >= 3 && v.trim().length <= 20,
        },
      ],
      props: {
        placeholder: t('login.usernamePlaceholder'),
        size: 'large',
        autocomplete: 'username',
      },
    },
    {
      name: 'password',
      component: 'input',
      label: t('login.passwordLabel'),
      required: true,
      rules: [
        {
          message: t('login.passwordRequired'),
          validator: v => typeof v === 'string' && v.trim().length > 0,
        },
        {
          message: t('login.passwordMin'),
          validator: v => typeof v === 'string' && v.trim().length >= 6,
        },
      ],
      props: {
        placeholder: t('login.passwordPlaceholder'),
        size: 'large',
        autocomplete: 'current-password',
      },
    },
  ],
}))

const ADMIN_PRESET: LoginFormValues = {
  username: 'admin',
  password: '123456',
}

const USER_PRESET: LoginFormValues = {
  username: 'user',
  password: '123456',
}

function fillAdminPreset(): void {
  passwordValue.value = ADMIN_PRESET.password
  formRef.value?.form.setFieldsValue({
    username: ADMIN_PRESET.username,
    password: ADMIN_PRESET.password,
  })
}

function fillUserPreset(): void {
  passwordValue.value = USER_PRESET.password
  formRef.value?.form.setFieldsValue({
    username: USER_PRESET.username,
    password: USER_PRESET.password,
  })
}

const loading = ref<boolean>(false)

const route = useRoute()
const router = useRouter()
const { login: doLogin } = useAuth()

async function login(values: Record<string, unknown>): Promise<void> {
  if (loading.value) return

  loading.value = true

  try {
    const username = typeof values.username === 'string' ? values.username.trim() : ''
    const password = typeof values.password === 'string' ? values.password : ''
    const payload: LoginParams = { username, password }

    await doLogin(payload)

    const redirectQuery = route.query.redirect
    const redirectPath = typeof redirectQuery === 'string' ? redirectQuery : undefined
    const fallbackPath = import.meta.env.VITE_ROOT_REDIRECT || '/'
    const stopGlobalLoading = startLoading()

    try {
      await router.replace(redirectPath || fallbackPath)
      await nextTick()
    } finally {
      stopGlobalLoading()
    }
  } catch (error) {
    const message = getErrorMessage(error) || t('login.errorMessageGeneric')

    if (window.$toast?.dangerIn) {
      window.$toast.dangerIn('top-center', t('login.errorTitle'), message)
    }

    passwordValue.value = ''
    formRef.value?.form.setFieldsValue({
      password: '',
    })
  } finally {
    loading.value = false
  }
}

async function handleLoginSubmit(): Promise<void> {
  if (loading.value) return

  const instance = formRef.value
  if (!instance) return

  const isValid = await instance.validate()
  if (!isValid) return

  const formState = instance.getFormState()
  await login(formState.values)
}
</script>

<template>
  <div class="login-page relative layout-full col-stretch text-foreground">
    <div
      class="login-grid-bg absolute z-base"
      aria-hidden="true"
    ></div>
    <div
      class="login-beam login-beam-primary absolute z-base"
      aria-hidden="true"
    ></div>
    <div
      class="login-beam login-beam-info absolute z-base"
      aria-hidden="true"
    ></div>

    <header class="login-toolbar z-content row-between">
      <div class="login-brand-mark row-center min-w-0 gap-sm">
        <div class="login-logo center overflow-hidden">
          <img
            src="@/assets/images/face.png"
            alt=""
            class="block h-full w-full object-cover"
          />
        </div>
        <div class="col-stretch min-w-0">
          <span class="text-sm font-bold text-foreground">{{ brand.displayName }}</span>
          <span class="text-xs text-muted-foreground">{{ t('login.portalEyebrow') }}</span>
        </div>
      </div>

      <div class="row-end gap-sm">
        <span
          id="login-locale-label"
          class="sr-only"
        >
          {{ t('login.localeSelect') }}
        </span>
        <Button
          icon="i-lucide-sun dark:i-lucide-moon"
          variant="text"
          rounded
          severity="secondary"
          :aria-label="t('login.themeToggle')"
          @click="toggleThemeWithAnimation"
        />
        <Select
          :model-value="locale"
          :options="localeOptions"
          option-label="label"
          option-value="value"
          :size="isMobileLayout ? 'large' : 'small'"
          class="login-locale-select"
          label-id="login-locale-label"
          @change="onLocaleChange"
        />
      </div>
    </header>

    <main class="login-main relative z-content center">
      <section class="login-command material-elevated">
        <div
          class="login-command-ring"
          aria-hidden="true"
        ></div>

        <aside class="login-stage col-between">
          <div class="login-stage-copy col-stretch gap-sm">
            <span class="login-eyebrow surface-primary rounded-md px-sm py-xs text-xs">
              {{ t('login.portalEyebrow') }}
            </span>
            <h1 class="login-stage-title text-foreground">
              {{ t('login.brandTitle') }}
            </h1>
            <p class="login-stage-lead text-sm leading-relaxed text-muted-foreground">
              {{ t('login.brandSloganLine1') }}
            </p>
          </div>

          <div class="login-animation-dock center">
            <div
              class="login-dock-halo"
              aria-hidden="true"
            ></div>
            <div class="login-characters center">
              <AnimatedCharacters
                :is-typing="isUsernameFocused"
                :show-password="isPasswordVisible"
                :password-length="passwordLength"
              />
            </div>
          </div>

          <div class="login-signal-strip row-start">
            <span class="surface-primary rounded-md px-sm py-xs text-xs">
              {{ t('login.trustAdminConsole') }}
            </span>
            <span class="surface-success rounded-md px-sm py-xs text-xs">
              {{ t('login.trustRoleControl') }}
            </span>
            <span class="surface-info rounded-md px-sm py-xs text-xs">
              {{ t('login.trustSecureAccess') }}
            </span>
          </div>
        </aside>

        <section class="login-form-panel col-stretch">
          <div class="login-form-head col-stretch gap-xs">
            <span class="login-eyebrow surface-info rounded-md px-sm py-xs text-xs">
              {{ t('login.title') }}
            </span>
            <h2 class="login-form-title text-foreground">
              {{ t('login.heading') }}
            </h2>
            <p class="text-sm leading-relaxed text-muted-foreground">
              {{ t('login.description') }}
            </p>
          </div>

          <div class="login-preset-deck col-stretch gap-sm">
            <div class="row-between gap-sm">
              <span class="text-sm font-medium text-secondary-foreground">
                {{ t('login.quickFillTips') }}
              </span>
              <span class="text-xs text-muted-foreground">
                {{ t('login.quickPasswordHint') }}
              </span>
            </div>

            <div class="login-preset-grid">
              <Button
                id="login-fill-admin"
                size="small"
                icon="i-lucide-shield-check"
                :label="t('login.quickAdmin')"
                severity="secondary"
                variant="outlined"
                class="login-preset-button"
                @click="fillAdminPreset"
              />
              <Button
                id="login-fill-user"
                size="small"
                icon="i-lucide-user-round"
                :label="t('login.quickUser')"
                severity="success"
                variant="outlined"
                class="login-preset-button"
                @click="fillUserPreset"
              />
            </div>
          </div>

          <ProForm
            :key="locale"
            ref="formRef"
            class="login-form"
            :schema="loginSchema"
            validate-on="submit"
            :disabled="loading"
            gap="var(--spacing-sm)"
            @submit="login"
          >
            <template #field-username="{ state, onUpdate }">
              <IconField class="w-full">
                <InputIcon class="text-muted-foreground">
                  <Icons
                    name="i-lucide-user-round"
                    size="md"
                    color="text-muted-foreground"
                  />
                </InputIcon>
                <InputText
                  id="username"
                  :model-value="getInputValue(state.value)"
                  :placeholder="t('login.usernamePlaceholder')"
                  autocomplete="username"
                  size="large"
                  :disabled="loading || state.disabled"
                  :invalid="state.errors.length > 0"
                  fluid
                  @focus="handleUsernameFocus"
                  @blur="handleUsernameBlur"
                  @update:model-value="value => commitInputValue(onUpdate, value)"
                />
              </IconField>
            </template>

            <template #field-password="{ state, onUpdate }">
              <div class="login-password-control">
                <span class="login-password-leading-icon center text-muted-foreground">
                  <Icons
                    name="i-lucide-lock-keyhole"
                    size="md"
                    color="text-muted-foreground"
                  />
                </span>
                <InputText
                  id="password"
                  class="login-password-input"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :model-value="getInputValue(state.value)"
                  :placeholder="t('login.passwordPlaceholder')"
                  autocomplete="current-password"
                  size="large"
                  :disabled="loading || state.disabled"
                  :invalid="state.errors.length > 0"
                  fluid
                  @update:model-value="value => handlePasswordUpdate(onUpdate, value)"
                />
                <span
                  role="button"
                  tabindex="0"
                  class="login-password-toggle center"
                  :aria-label="
                    isPasswordVisible ? t('login.passwordHide') : t('login.passwordShow')
                  "
                  :aria-pressed="isPasswordVisible"
                  @click="isPasswordVisible = !isPasswordVisible"
                  @keydown.enter.prevent="isPasswordVisible = !isPasswordVisible"
                  @keydown.space.prevent="isPasswordVisible = !isPasswordVisible"
                >
                  <Icons
                    :name="isPasswordVisible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    size="md"
                    color="text-muted-foreground"
                  />
                </span>
              </div>
            </template>

            <template #footer="{ formState }">
              <div class="login-submit-area col-stretch">
                <Button
                  id="login-submit"
                  class="w-full"
                  icon="i-lucide-log-in"
                  :label="t('login.submit')"
                  :loading="formState.submitting || loading"
                  size="large"
                  @click="handleLoginSubmit"
                />
              </div>
            </template>
          </ProForm>

          <footer class="login-form-footer col-center gap-xs text-center">
            <div class="text-sm text-muted-foreground">
              {{ t('login.noAccount') }}
              <a
                href="#"
                class="text-primary hover:underline"
              >
                {{ t('login.register') }}
              </a>
            </div>
            <p class="text-xs text-muted-foreground/60">
              {{ loginFooterText }}
            </p>
          </footer>
        </section>

        <nav
          class="login-bottom-links row-center gap-lg"
          aria-label="login links"
        >
          <a
            href="#"
            class="text-sm text-muted-foreground transition-colors duration-sm ease-out hover:text-foreground"
          >
            {{ t('login.helpCenter') }}
          </a>
          <span class="login-link-divider"></span>
          <a
            href="#"
            class="text-sm text-muted-foreground transition-colors duration-sm ease-out hover:text-foreground"
          >
            {{ t('login.privacyPolicy') }}
          </a>
        </nav>
      </section>
    </main>
  </div>
</template>
<style scoped lang="scss">
.login-page {
  overflow: hidden;
  background:
    radial-gradient(circle at 16% 18%, rgb(var(--primary) / 18%), transparent 28%),
    radial-gradient(circle at 82% 72%, rgb(var(--info) / 14%), transparent 34%),
    linear-gradient(135deg, rgb(var(--background)), rgb(var(--muted) / 72%));
}

.login-page::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background:
    linear-gradient(90deg, rgb(var(--card) / 24%), transparent 42%),
    radial-gradient(circle at 52% 48%, rgb(var(--foreground) / 7%), transparent 42%);
}

.login-grid-bg {
  inset: 0;
  opacity: 0.54;
  pointer-events: none;
  background:
    linear-gradient(rgb(var(--foreground) / 8%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--foreground) / 7%) 1px, transparent 1px);
  background-size: var(--spacing-3xl) var(--spacing-3xl);
  mask-image: radial-gradient(circle at 50% 46%, rgb(var(--foreground) / 76%), transparent 78%);
}

.login-beam {
  width: min(36vw, calc(var(--spacing-6xl) * 4));
  height: min(36vw, calc(var(--spacing-6xl) * 4));
  border-radius: var(--radius-full);
  filter: blur(var(--spacing-3xl));
  opacity: 0.5;
  pointer-events: none;
}

.login-beam-primary {
  top: 12%;
  right: 10%;
  background: rgb(var(--primary) / 18%);
}

.login-beam-info {
  bottom: 8%;
  left: 8%;
  background: rgb(var(--info) / 16%);
}

.login-toolbar {
  position: absolute;
  top: calc(var(--spacing-md) + env(safe-area-inset-top, 0px));
  right: var(--spacing-lg);
  left: var(--spacing-lg);
}

.login-logo {
  width: var(--spacing-2xl);
  height: var(--spacing-2xl);
  border: 1px solid rgb(var(--border) / 62%);
  border-radius: var(--radius-lg);
  background: rgb(var(--card) / 78%);
  box-shadow: var(--shadow-sm);
}

.login-locale-select {
  width: min(42vw, 220px);
}

.login-main {
  height: 100%;
  padding: calc(var(--spacing-4xl) + env(safe-area-inset-top, 0px)) var(--spacing-lg)
    calc(var(--spacing-xl) + env(safe-area-inset-bottom, 0px));
}

.login-command {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.98fr) minmax(360px, 440px);
  grid-template-rows: minmax(0, 1fr) auto;
  width: min(88vw, 1120px);
  height: min(78vh, 700px);
  gap: var(--spacing-lg);
  overflow: hidden;
  border-color: rgb(var(--border) / 42%);
  border-radius: var(--radius-2xl);
  background: rgb(var(--card) / 76%);
  box-shadow:
    0 34px 96px rgb(var(--foreground) / 16%),
    inset 0 1px 0 rgb(var(--foreground) / 8%);
}

.login-command-ring {
  position: absolute;
  inset: var(--spacing-md);
  border: 1px solid rgb(var(--border) / 26%);
  border-radius: var(--radius-xl);
  pointer-events: none;
}

.login-stage {
  position: relative;
  min-width: 0;
  min-height: 0;
  padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-md);
  border-radius: var(--radius-xl);
  background:
    linear-gradient(145deg, rgb(var(--background) / 28%), transparent 48%),
    radial-gradient(circle at 46% 62%, rgb(var(--primary) / 16%), transparent 42%);
}

.login-stage-copy {
  max-width: min(100%, 560px);
}

.login-eyebrow {
  display: inline-flex;
  width: max-content;
  max-width: 100%;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.login-stage-title {
  max-width: 10ch;
  font-size: clamp(var(--spacing-2xl), 4vw, var(--spacing-5xl));
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.04em;
  line-height: 0.95;
}

.login-stage-lead {
  max-width: min(100%, 460px);
}

.login-animation-dock {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
}

.login-dock-halo {
  position: absolute;
  width: min(58%, 420px);
  height: min(58%, 420px);
  border-radius: var(--radius-full);
  background: rgb(var(--primary) / 16%);
  filter: blur(var(--spacing-2xl));
}

.login-characters {
  position: relative;
  width: min(92%, 560px);
  height: min(38vh, 350px);
  filter: drop-shadow(0 34px 46px rgb(var(--foreground) / 18%));
}

.login-signal-strip {
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.login-form-panel {
  position: relative;
  min-width: 0;
  min-height: 0;
  align-self: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  border: 1px solid rgb(var(--border) / 46%);
  border-radius: var(--radius-xl);
  background:
    linear-gradient(180deg, rgb(var(--background) / 30%), transparent 38%), rgb(var(--card) / 78%);
  box-shadow:
    0 26px 64px rgb(var(--foreground) / 14%),
    inset 0 1px 0 rgb(var(--foreground) / 8%);
}

.login-form-panel::before {
  position: absolute;
  top: 0;
  right: var(--spacing-lg);
  left: var(--spacing-lg);
  height: var(--spacing-xs);
  border-radius: 0 0 var(--radius-full) var(--radius-full);
  pointer-events: none;
  content: '';
  background: linear-gradient(90deg, rgb(var(--primary)), rgb(var(--info)));
}

.login-form-title {
  font-size: clamp(var(--spacing-xl), 4vw, var(--spacing-2xl));
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.03em;
  line-height: 1.04;
}

.login-preset-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-sm);
}

.login-preset-button {
  width: 100%;
  min-height: var(--spacing-2xl);
  justify-content: flex-start;
  border-radius: var(--radius-lg);
  background: rgb(var(--background) / 58%);
}

.login-submit-area {
  gap: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid rgb(var(--border) / 56%);
}

.login-password-control {
  position: relative;
  width: 100%;
}

.login-password-leading-icon {
  position: absolute;
  top: 50%;
  width: var(--spacing-lg);
  height: var(--spacing-lg);
  inset-inline-start: var(--spacing-md);
  pointer-events: none;
  transform: translateY(-50%);
}

.login-password-leading-icon :deep(.iconify) {
  display: block;
}

.login-password-toggle {
  position: absolute;
  top: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  appearance: none;
  border: 0;
  border-radius: var(--radius-md);
  background: rgb(var(--muted) / 36%);
  color: rgb(var(--muted-foreground));
  cursor: pointer;
  height: var(--spacing-xl);
  inset-inline-end: var(--spacing-md);
  line-height: 1;
  margin-top: 0;
  padding: 0;
  transform: translateY(-50%);
  transition:
    background-color var(--transition-sm) ease,
    color var(--transition-sm) ease,
    box-shadow var(--transition-sm) ease;
  width: var(--spacing-xl);
}

@media (hover: hover) and (pointer: fine) {
  .login-password-toggle:hover {
    background: rgb(var(--primary) / 12%);
    color: rgb(var(--primary));
    box-shadow: 0 0 0 1px rgb(var(--primary) / 16%);
  }
}

.login-password-toggle:focus-visible {
  box-shadow: 0 0 0 var(--spacing-xs) rgb(var(--ring) / 24%);
  outline: none;
}

.login-password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.login-password-input {
  border: 1px solid rgb(var(--border)) !important;
  border-radius: var(--radius-md) !important;
  background: rgb(var(--background) / 86%) !important;
  box-shadow: 0 1px 2px 0 rgb(var(--foreground) / 10%) !important;
  padding-inline: calc(var(--spacing-md) + var(--spacing-lg) + var(--spacing-xs))
    calc(var(--spacing-xl) + var(--spacing-md) + var(--spacing-sm)) !important;
}

.login-bottom-links {
  grid-column: 1 / -1;
  align-self: end;
}

.login-link-divider {
  width: 1px;
  height: var(--spacing-md);
  background: rgb(var(--border) / 72%);
}

.dark {
  .login-page {
    background:
      radial-gradient(circle at 16% 18%, rgb(var(--primary) / 24%), transparent 28%),
      radial-gradient(circle at 82% 72%, rgb(var(--info) / 18%), transparent 34%),
      linear-gradient(135deg, rgb(var(--background)), rgb(var(--card) / 86%));
  }

  .login-grid-bg {
    opacity: 0.46;
  }
}

@media (width <= 1280px) {
  .login-command {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(var(--spacing-5xl), 18vh) minmax(0, auto) auto;
    width: min(90vw, 580px);
    height: min(86vh, 800px);
  }

  .login-stage {
    padding: var(--spacing-sm) var(--spacing-md) 0;
    background: radial-gradient(circle at 50% 80%, rgb(var(--primary) / 18%), transparent 56%);
  }

  .login-stage-copy,
  .login-signal-strip {
    display: none;
  }

  .login-animation-dock {
    height: 100%;
  }

  .login-characters {
    width: min(78%, 360px);
    height: min(16vh, 150px);
  }

  .login-form-panel {
    align-self: start;
    padding: var(--spacing-lg);
  }
}

@media (width <= 640px) {
  .login-toolbar {
    right: var(--spacing-sm);
    left: var(--spacing-sm);
  }

  .login-brand-mark {
    display: none;
  }

  .login-main {
    padding-right: var(--spacing-sm);
    padding-left: var(--spacing-sm);
  }

  .login-command {
    width: 100%;
    height: min(88vh, 760px);
    gap: var(--spacing-sm);
  }

  .login-form-panel {
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
  }

  .login-preset-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
