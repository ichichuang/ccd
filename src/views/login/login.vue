<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
// import { AUTH_ENABLED } from '@/constants/router'
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
const isMobileLayout = computed(() => deviceStore.isMobileLayout)
const { toggleThemeWithAnimation } = useThemeSwitch()
const { locale, switchLocale, supportedLocales } = useLocale()
const { t } = useI18n({ useScope: 'global' })

const localeOptions = computed(() =>
  supportedLocales.map(l => ({ value: l.key as SupportedLocale, label: `${l.flag} ${l.name}` }))
)

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
const loading = ref(false)

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

  let didStartGlobalLoading = false

  try {
    const payload: LoginParams = {
      username: String(values.username ?? '').trim(),
      password: String(values.password ?? ''),
    }

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
    const rawMessage =
      (error as { message?: string })?.message ||
      (error as { data?: { message?: string } })?.data?.message ||
      ''
    const message = rawMessage || t('login.errorMessageGeneric')

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
  <div
    class="flex h-screen w-screen overflow-hidden bg-background"
    @keydown.enter.prevent="onEnterSubmit"
  >
    <!-- Left Background -->
    <div
      class="hidden lg:flex flex-col justify-between w-[55%] bg-background text-foreground p-xl relative overflow-hidden"
    >
      <div
        class="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent pointer-events-none"
      ></div>

      <div class="relative z-10 row-y-center gap-md">
        <Icons
          name="i-lucide-box"
          class="text-primary"
          size="3xl"
        />
        <span class="text-xl font-bold tracking-wider">
          {{ t('login.brandTitle') }}
        </span>
      </div>

      <div class="relative z-10 mb-[var(--spacing-2xl)]">
        <blockquote class="col-stack-md">
          <p class="text-2xl font-medium leading-relaxed text-foreground/90">
            "{{ t('login.brandSloganLine1') }}
            <br />
            {{ t('login.brandSloganLine2') }}"
          </p>
          <footer class="text-sm text-muted-foreground">— {{ t('login.brandQuoteAuthor') }}</footer>
        </blockquote>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="flex-1 col-fill relative bg-background bg-card">
      <div
        class="absolute top-[var(--spacing-xl)] right-[var(--spacing-xl)] row-y-center gap-md z-20"
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
          class="size-select-min"
          @change="e => e.value && switchLocale(e.value)"
        />
      </div>

      <div class="layout-full center p-sm md:p-md lg:p-lg">
        <div
          class="w-full py-sm md:py-md xl:py-lg 2xl:py-xl mx-auto max-w-[88%] sm:max-w-[84%] md:max-w-[82%] lg:max-w-[80%] xl:max-w-[78%] 2xl:max-w-[76%] col-stack-xl"
        >
          <div class="col-stack-sm text-left">
            <h2 class="text-3xl font-bold text-foreground">
              {{ t('login.heading') }}
            </h2>
            <p class="text-sm text-muted-foreground">
              {{ t('login.description') }}
            </p>
          </div>

          <!-- Quick Fill / Role Switch -->
          <div class="mb-md column-between gap-sm">
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

          <div class="col-stack-md text-center mt-[var(--spacing-xl)]">
            <div class="text-muted-foreground text-sm">
              {{ t('login.noAccount') }}
              <a
                href="#"
                class="text-primary hover:underline"
              >
                {{ t('login.register') }}
              </a>
            </div>
            <p class="text-muted-foreground/50 text-xs mt-[var(--spacing-2xl)]">
              {{ t('login.footerText', { version: '1.0.0', year: '2026' }) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.p-card) {
  background: transparent;
  box-shadow: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-md) ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
