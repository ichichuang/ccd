<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
// import { AUTH_ENABLED } from '@/constants/router'
import { brand } from '@/constants/brand'
import { useDeviceStore } from '@/stores/modules/device'
import { useLayoutStore } from '@/stores/modules/layout'
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'
import { useLocale } from '@/hooks/modules/useLocale'
import type { SupportedLocale } from '@/locales'
import { useAuth } from '@/hooks/modules/useAuth'
import type { LoginParams } from '@/types/dto/auth.dto'
import type { FormSchema, ProFormExpose } from '@/components/ProForm'

type LoginFormValues = LoginParams

const formRef = ref<ProFormExpose | null>(null)

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

const loginSchema = computed<FormSchema>(() => {
  return {
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
          toggleMask: true,
        },
      },
    ],
  }
})

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

// LEGACY SchemaForm 已物理删除：登录页暂时进入“白地”占位状态
const loading = ref<boolean>(false)

const route = useRoute()
const router = useRouter()
const { login: doLogin } = useAuth()

/** 回车快捷登录：在输入框内按 Enter 时触发提交 */
function onEnterSubmit(): void {
  if (!loading.value) {
    void handleLoginSubmit()
  }
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

    // 先开启全屏 Loading 作为“快门”，彻底遮住退出中间态（避免卡片样式瞬变被看到）
    layoutStore.beginGlobalLoading()
    didStartGlobalLoading = true

    const redirectPath = route.query.redirect as string | undefined
    const fallbackPath = import.meta.env.VITE_ROOT_REDIRECT || '/'

    await router.replace(redirectPath || fallbackPath)
  } catch (error) {
    // 若路由跳转失败/异常，回收本次手动开启的全屏 Loading，避免遮罩残留
    if (didStartGlobalLoading) {
      layoutStore.endGlobalLoading()
    }
    const message = getErrorMessage(error) || t('login.errorMessageGeneric')

    // 使用全局 Toast 提示错误（组件内可直接访问 window.$toast）
    if (window.$toast?.dangerIn) {
      window.$toast.dangerIn('top-center', t('login.errorTitle'), message)
    }

    // 失败后清空密码字段，减少安全风险
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
  <!-- 背景由根布局 AmbientBackground 提供；与 index.vue 单栏 glass-card 策略对齐 -->
  <div
    class="relative z-content w-full min-h-full col-stretch items-center px-sm pt-[calc(var(--spacing-3xl)+env(safe-area-inset-top,0px))] pb-[calc(var(--spacing-lg)+env(safe-area-inset-bottom,0px))] md:px-md text-foreground"
    @keydown.enter.prevent="onEnterSubmit"
  >
    <div
      class="absolute z-layout row-end gap-md right-sm top-[calc(var(--spacing-sm)+env(safe-area-inset-top,0px))] md:right-md md:top-[calc(var(--spacing-md)+env(safe-area-inset-top,0px))]"
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
        class="max-w-[min(48vw,220px)] min-w-[var(--spacing-2xl)] shrink-0"
        @change="onLocaleChange"
      />
    </div>

    <div
      class="col-stretch mx-auto w-full max-w-[min(92vw,1024px)] gap-lg lg:max-w-[min(96vw,1024px)] xl:max-w-[min(96vw,1200px)] 2xl:max-w-[min(96vw,1320px)]"
    >
      <div
        class="w-full min-h-0 max-lg:col-stretch max-lg:gap-lg lg:row-center lg:min-h-[min(52vh,480px)] lg:gap-x-2xl xl:gap-x-3xl 2xl:gap-x-4xl"
      >
        <!-- ≥lg：左栏品牌文案两端对齐左区；<lg 纵向堆叠 -->
        <div
          class="col-center w-full gap-md text-center lg:min-h-0 lg:min-w-0 lg:max-h-[min(68vh,520px)] lg:max-w-[min(58vw,560px)] lg:flex-1 lg:overflow-hidden lg:px-sm"
        >
          <Icons
            name="i-lucide-box"
            class="text-primary"
            size="3xl"
          />
          <span class="text-xl font-bold tracking-wider text-foreground">
            {{ t('login.brandTitle') }}
          </span>
          <blockquote class="col-stretch gap-md">
            <p class="text-lg font-medium leading-relaxed text-foreground/90 lg:text-2xl">
              "{{ t('login.brandSloganLine1') }}
              <br />
              {{ t('login.brandSloganLine2') }}"
            </p>
            <footer class="text-sm text-muted-foreground">
              — {{ t('login.brandQuoteAuthor') }}
            </footer>
          </blockquote>
        </div>

        <div
          class="col-stretch mx-auto w-[max(320px,min(92vw,440px))] shrink-0 gap-md md:w-[max(340px,min(88vw,440px))] lg:mx-0 lg:w-[max(360px,min(45vw,520px))] lg:gap-lg"
        >
          <section class="glass-card z-content w-full text-card-foreground">
            <div class="col-stretch gap-lg px-sm py-lg lg:gap-xl">
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
                  :validate-on="'submit'"
                  :disabled="loading"
                  @submit="login"
                >
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

<style lang="scss"></style>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-md) ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
