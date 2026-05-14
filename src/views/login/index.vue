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

const passwordLength = computed<number>(() => {
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

function commitInputValue(onUpdate: (value: unknown) => void, value: unknown): void {
  onUpdate(typeof value === 'string' ? value : '')
}

function handleUsernameFocus(): void {
  isUsernameFocused.value = true
}

function handleUsernameBlur(): void {
  isUsernameFocused.value = false
}

function togglePasswordVisibility(toggleCallback: () => void): void {
  isPasswordVisible.value = !isPasswordVisible.value
  toggleCallback()
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
        type: 'password',
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
  formRef.value?.form.setFieldsValue({
    username: ADMIN_PRESET.username,
    password: ADMIN_PRESET.password,
  })
}

function fillUserPreset(): void {
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
  <div class="login-page relative layout-full col-stretch">
    <div class="login-grid-bg absolute z-base"></div>

    <header class="login-toolbar z-content row-between">
      <div class="row-center min-w-0 gap-sm lg:hidden">
        <div class="login-logo center shrink-0 overflow-hidden">
          <img
            src="@/assets/images/face.png"
            alt=""
            class="block h-full w-full object-cover"
          />
        </div>
        <span class="text-lg font-bold text-foreground">
          {{ brand.displayName }}
        </span>
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

    <CScrollbar
      class="col-fill"
      visibility="hidden"
    >
      <main class="login-main relative z-content col-center">
        <div class="login-shell">
          <section class="login-visual-panel glass-card">
            <div class="row-center gap-sm">
              <div class="login-logo center shrink-0 overflow-hidden">
                <img
                  src="@/assets/images/face.png"
                  alt=""
                  class="block h-full w-full object-cover"
                />
              </div>
              <div class="col-stretch min-w-0">
                <span class="text-lg font-bold text-foreground">{{ brand.displayName }}</span>
                <span class="text-sm text-muted-foreground">{{ t('login.brandQuoteAuthor') }}</span>
              </div>
            </div>

            <div class="login-hero-copy col-stretch">
              <h1 class="text-3xl font-bold text-foreground">
                {{ t('login.brandTitle') }}
              </h1>
              <p class="text-md leading-relaxed text-muted-foreground">
                {{ t('login.brandSloganLine1') }}
              </p>
              <p class="text-sm leading-relaxed text-muted-foreground">
                {{ t('login.brandSloganLine2') }}
              </p>
            </div>

            <div class="login-characters center">
              <AnimatedCharacters
                :is-typing="isUsernameFocused"
                :show-password="isPasswordVisible"
                :password-length="passwordLength"
              />
            </div>

            <div class="login-pills row-start">
              <span class="surface-primary rounded-md px-sm py-xs text-xs">
                {{ t('login.quickAdmin') }}
              </span>
              <span class="surface-info rounded-md px-sm py-xs text-xs">
                {{ t('login.quickUser') }}
              </span>
            </div>
          </section>

          <section class="login-card material-elevated">
            <div class="login-card-content col-stretch">
              <div class="col-stretch gap-sm">
                <span class="text-sm font-medium text-primary">{{ t('login.title') }}</span>
                <h2 class="text-2xl font-bold text-foreground sm:text-3xl">
                  {{ t('login.heading') }}
                </h2>
                <p class="text-sm leading-relaxed text-muted-foreground">
                  {{ t('login.description') }}
                </p>
              </div>

              <div class="col-stretch gap-sm">
                <div class="row-between gap-sm">
                  <span class="text-sm font-medium text-secondary-foreground">
                    {{ t('login.quickFillTips') }}
                  </span>
                  <span class="text-xs text-muted-foreground">
                    {{ t('login.placeholderPassword') }}
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-sm">
                  <Button
                    id="login-fill-admin"
                    size="small"
                    icon="i-lucide-shield-check"
                    :label="t('login.quickAdmin')"
                    severity="secondary"
                    variant="outlined"
                    class="w-full"
                    @click="fillAdminPreset"
                  />
                  <Button
                    id="login-fill-user"
                    size="small"
                    icon="i-lucide-user-round"
                    :label="t('login.quickUser')"
                    severity="success"
                    variant="outlined"
                    class="w-full"
                    @click="fillUserPreset"
                  />
                </div>
              </div>

              <ProForm
                :key="locale"
                ref="formRef"
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
                  <Password
                    input-id="password"
                    :model-value="getInputValue(state.value)"
                    :placeholder="t('login.passwordPlaceholder')"
                    autocomplete="current-password"
                    size="large"
                    :feedback="false"
                    toggle-mask
                    fluid
                    :disabled="loading || state.disabled"
                    :invalid="state.errors.length > 0"
                    @update:model-value="value => commitInputValue(onUpdate, value)"
                  >
                    <template #maskicon="{ toggleCallback }">
                      <button
                        type="button"
                        class="login-password-toggle center"
                        :aria-label="t('login.passwordHide')"
                        @click="togglePasswordVisibility(toggleCallback)"
                      >
                        <Icons
                          name="i-lucide-eye-off"
                          size="md"
                          color="text-muted-foreground"
                        />
                      </button>
                    </template>
                    <template #unmaskicon="{ toggleCallback }">
                      <button
                        type="button"
                        class="login-password-toggle center"
                        :aria-label="t('login.passwordShow')"
                        @click="togglePasswordVisibility(toggleCallback)"
                      >
                        <Icons
                          name="i-lucide-eye"
                          size="md"
                          color="text-muted-foreground"
                        />
                      </button>
                    </template>
                  </Password>
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

              <div class="col-center gap-md text-center">
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
              </div>
            </div>
          </section>
        </div>

        <nav
          class="login-links row-center gap-lg"
          aria-label="login links"
        >
          <a
            href="#"
            class="text-sm text-muted-foreground transition-colors duration-sm ease-out hover:text-foreground"
          >
            {{ t('login.helpCenter') }}
          </a>
          <a
            href="#"
            class="text-sm text-muted-foreground transition-colors duration-sm ease-out hover:text-foreground"
          >
            {{ t('login.privacyPolicy') }}
          </a>
        </nav>
      </main>
    </CScrollbar>
  </div>
</template>
<style scoped lang="scss">
.login-page {
  overflow: hidden;
}

.login-grid-bg {
  inset: 0;
  background:
    linear-gradient(rgb(var(--primary) / 28%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--primary) / 12%) 1px, transparent 1px);
  background-size: var(--spacing-2xl) var(--spacing-2xl);
  mask-image: linear-gradient(to bottom, rgb(var(--foreground) / 75%), transparent);
}

.login-toolbar {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  left: var(--spacing-md);
  justify-content: flex-end;
}

.login-logo {
  width: var(--spacing-2xl);
  height: var(--spacing-2xl);
  border: 1px solid rgb(var(--border) / 65%);
  border-radius: var(--radius-lg);
  background: rgb(var(--card) / 70%);
}

.login-locale-select {
  width: min(46vw, 220px);
}

.login-main {
  min-height: 100%;
  padding: var(--spacing-5xl) var(--spacing-md) var(--spacing-lg);
}

.login-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 440px);
  align-items: stretch;
  width: min(94vw, 1180px);
  min-height: min(78vh, 720px);
  gap: var(--spacing-xl);
}

.login-visual-panel {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  gap: var(--spacing-xl);
  overflow: hidden;
}

.login-hero-copy {
  gap: var(--spacing-sm);
  max-width: 76%;
}

.login-characters {
  min-height: 0;
}

.login-pills {
  gap: var(--spacing-sm);
}

.login-card {
  align-self: center;
}

.login-card-content {
  gap: var(--spacing-lg);
  padding: var(--spacing-sm);
}

.login-submit-area {
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid rgb(var(--border) / 60%);
}

.login-password-toggle {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 0;
}

.login-links {
  margin-top: var(--spacing-md);
}

.dark {
  .login-grid-bg {
    background:
      linear-gradient(rgb(var(--foreground) / 8%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(var(--foreground) / 8%) 1px, transparent 1px);
    background-size: var(--spacing-2xl) var(--spacing-2xl);
  }
}

@media (width <= 1023px) {
  .login-toolbar {
    align-items: flex-start;
    justify-content: space-between;
  }

  .login-main {
    align-items: flex-start;
    padding-top: var(--spacing-5xl);
  }

  .login-shell {
    grid-template-columns: minmax(0, 1fr);
    width: min(94vw, 460px);
    min-height: auto;
  }

  .login-visual-panel {
    display: none;
  }
}

@media (width <= 640px) {
  .login-toolbar {
    right: var(--spacing-sm);
    left: var(--spacing-sm);
  }

  .login-main {
    padding-right: var(--spacing-sm);
    padding-left: var(--spacing-sm);
  }

  .login-shell {
    width: 100%;
  }

  .login-card-content {
    padding: 0;
  }
}
</style>
