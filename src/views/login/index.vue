<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { brand } from '@/constants/brand'
import { useDeviceStore } from '@/stores/modules/device'
import { useLayoutStore } from '@/stores/modules/layout'
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'
import { useLocale } from '@/hooks/modules/useLocale'
import type { SupportedLocale } from '@/locales'
import { useAuth } from '@/hooks/modules/useAuth'
import type { LoginParams } from '@/types/dto/auth.dto'
import type { FieldSchema, FormSchema, ProFormExpose } from '@/components/ProForm'

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

const showPassword = ref<boolean>(false)
const isUsernameFocused = ref<boolean>(false)

const passwordLength = computed<number>(() => {
  const inst = formRef.value
  if (!inst) return 0
  const raw = inst.getFormState().values.password
  return typeof raw === 'string' ? raw.length : 0
})

const deviceStore = useDeviceStore()
const layoutStore = useLayoutStore()
const isMobileLayout = computed<boolean>(() => deviceStore.isMobileLayout)
const { toggleThemeWithAnimation } = useThemeSwitch()
const { locale, switchLocale, supportedLocales } = useLocale()
const { t } = useI18n({ useScope: 'global' })

const localeOptions = computed<Array<{ value: SupportedLocale; label: string }>>(() =>
  supportedLocales.map(l => ({ value: l.key, label: `${l.flag} ${l.name}` }))
)

function isSupportedLocale(value: unknown): value is SupportedLocale {
  return value === 'zh-CN' || value === 'en-US'
}

function onLocaleChange(event: unknown): void {
  if (typeof event !== 'object' || event === null) return
  const nextValue = (event as { value?: unknown }).value
  if (!isSupportedLocale(nextValue)) return
  void switchLocale(nextValue)
}

function getErrorMessage(error: unknown): string {
  if (typeof error !== 'object' || error === null) return ''

  const maybeMessage = (error as { message?: unknown }).message
  if (typeof maybeMessage === 'string' && maybeMessage.trim().length > 0) return maybeMessage

  const maybeData = (error as { data?: unknown }).data
  if (typeof maybeData === 'object' && maybeData !== null) {
    const maybeDataMessage = (maybeData as { message?: unknown }).message
    if (typeof maybeDataMessage === 'string' && maybeDataMessage.trim().length > 0)
      return maybeDataMessage
  }

  return ''
}

type ParsedAppInfo = {
  pkg?: { version?: string }
  lastBuildTime?: string
}

function parseAppInfo(): ParsedAppInfo {
  if (typeof __APP_INFO__ === 'object' && __APP_INFO__ !== null) {
    return __APP_INFO__ as ParsedAppInfo
  }

  try {
    const parsed = JSON.parse(__APP_INFO__ as string) as ParsedAppInfo
    return parsed
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

/** 登录凭证行外壳：半透明以透出 glass-card；focus-within 整行高亮（含左侧图标区）。 */
const loginShellRowValid =
  'row-start layout-full self-stretch overflow-hidden rounded-md border border-border bg-card/50 shadow-sm shadow-foreground/10 transition-all duration-md ease-smooth dark:shadow-foreground/20 hover:border-primary/50 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background'

const loginShellRowInvalid =
  'row-start layout-full self-stretch overflow-hidden rounded-md border !border-danger bg-card/50 shadow-sm shadow-foreground/10 transition-all duration-md ease-smooth dark:shadow-foreground/20 hover:!border-danger focus-within:!border-danger focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background'

const loginShellIconCol =
  'row-center shrink-0 self-stretch min-h-0 border-r border-border bg-transparent px-sm'

/** InputText：! 覆盖 Prime 主题 background 简写，与 Shell 融为一体。 */
const loginShellInputPt = {
  root: {
    class:
      'w-full !border-none !shadow-none !rounded-none !bg-transparent !ring-0 !outline-none focus:!border-none focus:!ring-0 focus:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0',
  },
} as const

/** Password：外层去壳撑满；pcInputText 剥离 GOLDEN_INPUT 实底与边框。 */
const loginPasswordPt = {
  root: {
    class:
      'min-h-0 w-full min-w-0 flex-1 self-stretch items-center !border-none !shadow-none !rounded-none !bg-transparent !ring-0 !outline-none focus:!ring-0',
  },
  pcInputText: {
    root: {
      class:
        'w-full !border-none !shadow-none !rounded-none !bg-transparent !ring-0 !outline-none focus:!border-none focus:!ring-0 focus:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0',
    },
  },
} as const

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
        prefixIcon: 'i-lucide-user',
        size: 'large',
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
        prefixIcon: 'i-lucide-lock',
        size: 'large',
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

function onUnmaskToggle(toggleCallback: () => void): void {
  toggleCallback()
  showPassword.value = true
}

function onMaskToggle(toggleCallback: () => void): void {
  toggleCallback()
  showPassword.value = false
}

function fieldPrefixIcon(field: FieldSchema<unknown>): string {
  const icon = field.props?.prefixIcon
  return typeof icon === 'string' && icon.length > 0 ? icon : 'i-lucide-circle'
}

function fieldPlaceholder(field: FieldSchema<unknown>): string {
  const ph = field.props?.placeholder
  return typeof ph === 'string' ? ph : ''
}

async function login(values: Record<string, unknown>): Promise<void> {
  if (loading.value) return

  loading.value = true

  let didStartGlobalLoading: boolean = false

  try {
    const username = typeof values.username === 'string' ? values.username.trim() : ''
    const password = typeof values.password === 'string' ? values.password : ''
    const payload: LoginParams = { username, password }

    await doLogin(payload)

    layoutStore.beginGlobalLoading()
    didStartGlobalLoading = true

    const redirectPath = route.query.redirect as string | undefined
    const fallbackPath = import.meta.env.VITE_ROOT_REDIRECT || '/'

    await router.replace(redirectPath || fallbackPath)
  } catch (error) {
    if (didStartGlobalLoading) {
      layoutStore.endGlobalLoading()
    }
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
  <!-- 背景由根布局 AmbientBackground（fullscreen）提供；此处保持透明叠层 -->
  <div class="relative z-content layout-full center">
    <div class="command-center-container-gradient absolute top-0 left-0 right-0 bottom-0 z-0"></div>
    <!-- <lg：单栏≈90vw；≥lg：版心随断点放宽，大屏两列间距由 gap-x 与版心宽度共同放大（避免 row-between 吃满空隙导致 gap 无效） -->
    <div class="layout-full col-center gap-md">
      <div class="row-center shrink-0 gap-sm lg:hidden">
        <div
          class="glass-icon-box h-[var(--spacing-2xl)] w-[var(--spacing-2xl)] shrink-0 overflow-hidden"
        >
          <img
            src="@/assets/images/face.png"
            alt=""
            class="block h-full w-full object-cover"
          />
        </div>
        <span class="text-xl font-bold tracking-wide text-foreground">
          {{ brand.displayName }}
        </span>
      </div>

      <div class="col-stretch lg:row-center lg:min-h-[min(58vh,560px)] xl:gap-3xl 2xl:gap-5xl">
        <!-- ≥lg：左侧小人；相对父级 % + px 上限；与表单列用 gap-x 控距（居中成组） -->
        <div
          class="center relative max-lg:hidden min-h-0 min-w-0 w-full lg:flex-1 lg:max-w-[min(58vw,560px)] lg:w-auto lg:self-stretch lg:min-h-[min(58vh,560px)] lg:overflow-visible lg:px-sm lg:py-md"
        >
          <div class="fixed z-content top-xl left-xl row-center max-lg:hidden shrink-0 gap-sm">
            <div
              class="glass-icon-box h-[var(--spacing-2xl)] w-[var(--spacing-2xl)] shrink-0 overflow-hidden"
            >
              <img
                src="@/assets/images/face.png"
                alt=""
                class="block h-full w-full object-cover"
              />
            </div>
            <span class="text-xl font-bold tracking-wide text-foreground">
              {{ brand.displayName }}
            </span>
          </div>
          <AnimatedCharacters
            :is-typing="isUsernameFocused"
            :show-password="showPassword"
            :password-length="passwordLength"
          />
        </div>

        <!-- 右侧：≥lg 顶对齐品牌 + glass-card；<lg 整列仅表单区品牌用顶部 lg:hidden 行 -->
        <div
          class="col-stretch mx-auto w-[max(320px,min(92vw,440px))] shrink-0 gap-md md:w-[max(340px,min(88vw,440px))] lg:mx-0 lg:w-[max(360px,min(45vw,520px))] lg:gap-lg"
        >
          <div
            class="fixed z-content top-xl right-xl row-end w-full shrink-0 gap-sm sm:w-auto sm:justify-self-end sm:gap-md"
          >
            <Button
              icon="i-lucide-sun dark:i-lucide-moon"
              text
              rounded
              severity="secondary"
              class="text-lg!"
              @click="toggleThemeWithAnimation"
            />
            <Select
              :model-value="locale"
              :options="localeOptions"
              option-label="label"
              option-value="value"
              :size="isMobileLayout ? 'large' : 'small'"
              class="max-w-[min(70vw,220px)] min-w-0 shrink-0 sm:max-w-[200px]"
              @change="onLocaleChange"
            />
          </div>
          <section class="glass-card z-content w-full text-card-foreground">
            <div class="col-stretch gap-lg px-sm py-lg lg:gap-xl">
              <!-- Grid：避免 flex-1+min-w-0 在 row-between 下被工具列压成极窄（标题竖排） -->
              <div
                class="grid w-full min-w-0 shrink-0 grid-cols-1 gap-y-md gap-x-md sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
              >
                <div class="col-stretch min-w-0 gap-sm text-left">
                  <h2
                    class="text-pretty text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
                  >
                    {{ t('login.heading') }}
                  </h2>
                  <p class="text-sm leading-relaxed text-muted-foreground">
                    {{ t('login.description') }}
                  </p>
                </div>
              </div>

              <div class="col-stretch gap-sm">
                <div class="text-xs text-muted-foreground">
                  {{ t('login.quickFillTips') }}
                </div>
                <div class="row-start gap-xs">
                  <Button
                    size="small"
                    text
                    @click="fillAdminPreset"
                  >
                    <Icons
                      name="i-lucide-shield-check"
                      size="sm"
                      class="mr-xs text-current"
                    />
                    <span class="text-xs">
                      {{ t('login.quickAdmin') }}
                    </span>
                  </Button>
                  <Button
                    size="small"
                    severity="success"
                    text
                    @click="fillUserPreset"
                  >
                    <Icons
                      name="i-lucide-user-round"
                      size="sm"
                      class="mr-xs text-current"
                    />
                    <span class="text-xs">
                      {{ t('login.quickUser') }}
                    </span>
                  </Button>
                </div>
              </div>

              <div class="col-stretch mt-md">
                <ProForm
                  :key="locale"
                  ref="formRef"
                  :schema="loginSchema"
                  validate-on="submit"
                  :disabled="loading"
                  @submit="login"
                >
                  <template #field-username="{ field, state, onUpdate }">
                    <div
                      :class="state.errors.length > 0 ? loginShellRowInvalid : loginShellRowValid"
                    >
                      <div :class="loginShellIconCol">
                        <Icons
                          :name="fieldPrefixIcon(field)"
                          class="text-lg text-muted-foreground"
                        />
                      </div>
                      <div class="min-w-0 flex-1 self-stretch min-h-0">
                        <InputText
                          :id="field.name"
                          :pt="loginShellInputPt"
                          :model-value="state.value == null ? '' : String(state.value)"
                          autocomplete="username"
                          :placeholder="fieldPlaceholder(field)"
                          :invalid="state.errors.length > 0"
                          size="large"
                          @update:model-value="v => onUpdate(v)"
                          @focus="isUsernameFocused = true"
                          @blur="isUsernameFocused = false"
                        />
                      </div>
                    </div>
                  </template>

                  <template #field-password="{ field, state, onUpdate }">
                    <div
                      :class="state.errors.length > 0 ? loginShellRowInvalid : loginShellRowValid"
                    >
                      <div :class="loginShellIconCol">
                        <Icons
                          :name="fieldPrefixIcon(field)"
                          class="text-lg text-muted-foreground"
                        />
                      </div>
                      <div class="min-w-0 flex-1 self-stretch min-h-0">
                        <Password
                          fluid
                          :pt="loginPasswordPt"
                          :model-value="state.value == null ? '' : String(state.value)"
                          toggle-mask
                          :feedback="false"
                          size="large"
                          :placeholder="fieldPlaceholder(field)"
                          :invalid="state.errors.length > 0"
                          autocomplete="current-password"
                          :input-id="field.name"
                          @update:model-value="v => onUpdate(v)"
                        >
                          <template #unmaskicon="{ toggleCallback }">
                            <span
                              class="mr-sm inline-flex shrink-0 cursor-pointer items-center text-muted-foreground"
                              @click.stop="onUnmaskToggle(toggleCallback)"
                            >
                              <Icons name="i-lucide-eye" />
                            </span>
                          </template>
                          <template #maskicon="{ toggleCallback }">
                            <span
                              class="mr-sm inline-flex shrink-0 cursor-pointer items-center text-muted-foreground"
                              @click.stop="onMaskToggle(toggleCallback)"
                            >
                              <Icons name="i-lucide-eye-off" />
                            </span>
                          </template>
                        </Password>
                      </div>
                    </div>
                  </template>

                  <template #footer="{ formState }">
                    <div class="mt-xl">
                      <Button
                        class="w-full"
                        :label="t('login.submit')"
                        :loading="formState.submitting || loading"
                        size="large"
                        @click="handleLoginSubmit"
                      />
                    </div>
                  </template>
                </ProForm>
              </div>

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
                <p class="mt-[var(--spacing-2xl)] text-xs text-muted-foreground/50">
                  {{ loginFooterText }}
                </p>
              </div>
            </div>
          </section>

          <div class="row-center gap-lg text-sm">
            <a
              href="#"
              class="text-muted-foreground transition-colors duration-sm ease-out hover:text-foreground"
            >
              {{ t('login.helpCenter') }}
            </a>
            <a
              href="#"
              class="text-muted-foreground transition-colors duration-sm ease-out hover:text-foreground"
            >
              {{ t('login.privacyPolicy') }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.command-center-container-gradient {
  background:
    linear-gradient(rgb(var(--primary) / 28%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--primary) / 12%) 1px, transparent 1px);
  background-size: var(--spacing-2xl) var(--spacing-2xl);
}
.dark {
  .command-center-container-gradient {
    background:
      linear-gradient(rgb(var(--foreground) / 8%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(var(--foreground) / 8%) 1px, transparent 1px);
    background-size: var(--spacing-2xl) var(--spacing-2xl);
  }
}
</style>
