<script setup lang="tsx">
import type { FormValues, Schema } from '@/components/SchemaForm'
import { brand } from '@/constants/brand'
import { AUTH_ENABLED } from '@/constants/router'
import { LOGIN_CARD_MAX_WIDTH } from '@/constants/login'
import { useDeviceStore } from '@/stores/modules/device'
import { useUserStore } from '@/stores/modules/user'
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'
import { useLocale } from '@/hooks/modules/useLocale'
import type { SupportedLocale } from '@/locales'
import logoSrc from '@/assets/images/face.png'

interface SchemaFormRef {
  submit?: () => void
}

const formRef = ref<SchemaFormRef | null>(null)
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const appVersion: string =
  typeof __APP_INFO__ === 'object' && __APP_INFO__ !== null
    ? (__APP_INFO__?.pkg?.version ?? '')
    : (() => {
        try {
          const parsed = JSON.parse(__APP_INFO__ as string) as { pkg?: { version?: string } }
          return parsed?.pkg?.version ?? ''
        } catch {
          return ''
        }
      })()
const footerVersion = computed(() => (appVersion ? `v${appVersion}` : ''))
const deviceStore = useDeviceStore()
const isMobileLayout = computed(() => deviceStore.isMobileLayout)
const toolbarIconSize = computed(() => (isMobileLayout.value ? 'xl' : '2xl'))
const toolbarSelectSize = computed(() => (isMobileLayout.value ? 'large' : 'small'))
const { isDark, isAnimating, toggleThemeWithAnimation } = useThemeSwitch()
const { locale, switchLocale, supportedLocales } = useLocale()
const t = $t

const login_card_max_width = LOGIN_CARD_MAX_WIDTH

const localeOptions = computed(() =>
  supportedLocales.map(l => ({ value: l.key as SupportedLocale, label: `${l.flag} ${l.name}` }))
)

const formValues = ref<FormValues>({} as FormValues)
const loading = ref(false)
const errorMessage = ref('')

const loginSchema = computed<Schema>(() => ({
  gap: 24, // 语义间距，映射到 var(--spacing-lg)
  layout: {
    cols: 1,
    labelWidth: 0, // 登录页通常不需要 Label 文案，用 placeholder + icon 即可
    labelPosition: 'top',
    showLabel: false, // 隐藏 Label
  },
  columns: [
    {
      field: 'username',
      label: t('login.username'),
      component: 'InputText',
      props: {
        placeholder: t('login.placeholderUsername'),
        autocomplete: 'username',
        size: 'large', // 大尺寸输入框
        prefixIcon: 'i-lucide-user', // 新增：前缀图标
        fluid: true, // 确保宽度填满
      },
      rules: 'required',
    },
    {
      field: 'password',
      label: t('login.password'),
      component: 'Password',
      props: {
        placeholder: t('login.placeholderPassword'),
        feedback: false,
        toggleMask: true,
        autocomplete: 'current-password',
        size: 'large',
        prefixIcon: 'i-lucide-lock', // 新增：前缀图标
        fluid: true,
        inputClass: 'w-full', // 确保 Input 内部宽度
      },
      rules: 'required',
    },
    {
      field: 'forgotPassword',
      label: '',
      component: 'Custom',
      props: {
        render: () => (
          <div class="row main-end w-full">
            <a
              href="#"
              class="text-primary fs-sm no-underline hover:text-accent transition-colors duration-scale-md"
              onClick={(e: Event) => {
                e.preventDefault()
                /* TODO: Forgot Password */
              }}
            >
              {t('login.forgotPassword')}
            </a>
          </div>
        ),
      },
    },
  ],
}))

async function handleSubmit(values: FormValues) {
  if (!AUTH_ENABLED) {
    errorMessage.value = t('login.authDisabled')
    return
  }

  const username = String(values.username ?? '').trim()
  const password = String(values.password ?? '').trim()

  if (!username || !password) {
    errorMessage.value = t('login.required')
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''
    await userStore.login({ username, password })
    // 架构规定：Store 不负责导航，由调用方在登录成功后跳转（见 05-architecture-decoupling）
    const redirect = route.query.redirect
    const targetPath =
      typeof redirect === 'string' && redirect
        ? decodeURIComponent(redirect)
        : import.meta.env.VITE_ROOT_REDIRECT || '/'
    await router.replace(targetPath)
  } catch (error) {
    errorMessage.value = (error as Error).message || t('login.failed')
  } finally {
    loading.value = false
  }
}

/** 回车快捷登录：在输入框内按 Enter 时触发提交，与点击登录按钮一致 */
function onEnterSubmit() {
  if (!loading.value) formRef.value?.submit?.()
}
</script>

<template>
  <div
    class="fixed inset-0 overflow-hidden center"
    @keydown.enter.prevent="onEnterSubmit"
  >
    <!-- 渐变背景：使用配色系统变量，无外部资源 -->
    <div class="login-bg absolute inset-0 z-0" />

    <!-- 错误提示：固定于页面中上方，不撑开登录卡片 -->
    <Transition name="fade">
      <div
        v-if="errorMessage"
        class="ixed left-1/2 top-[var(--spacing-xl)] z-30 -translate-x-1/2 row cross-center gap-sm p-padding-md rounded-scale-md bg-danger/10 border border-danger/20 shadow-md"
      >
        <Icons
          name="i-lucide-alert-circle"
          class="text-danger shrink-0"
        />
        <span class="text-danger fs-sm">
          {{ errorMessage }}
        </span>
      </div>
    </Transition>

    <!-- 主题 / 语言切换（右上角） -->
    <div class="absolute top-[var(--spacing-lg)] right-[var(--spacing-lg)] z-20 row-center gap-sm">
      <Button
        variant="text"
        severity="secondary"
        class="center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-scale-md"
        :disabled="isAnimating"
        @click="toggleThemeWithAnimation($event)"
      >
        <Icons
          :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
          :size="toolbarIconSize"
        />
      </Button>
      <SelectButton
        :model-value="locale"
        :options="localeOptions"
        option-value="value"
        option-label="label"
        :size="toolbarSelectSize"
        :allow-empty="false"
        @update:model-value="v => v && switchLocale(v)"
      />
    </div>

    <!-- Login Card -->
    <div
      class="login-card relative z-10 w-full max-w-[90vw] md:max-w-[var(--login-card-max-width)] p-padding-xl bg-card/90 backdrop-blur-md rounded-scale-md shadow-md component-border animate__animated animate__fadeInUp"
    >
      <!-- Header -->
      <div class="column cross-center gap-md mb-margin-xl">
        <div class="w-[var(--spacing-4xl)] h-[var(--spacing-4xl)]">
          <img
            class="layout-full!"
            :src="logoSrc"
          />
        </div>
        <div class="column cross-center">
          <h1 class="fs-2xl font-bold text-foreground m-0">
            {{ t('login.title') }}
          </h1>
          <p class="text-muted mt-margin-sm fs-sm">
            {{ t('login.subtitle') }}
          </p>
        </div>
      </div>

      <!-- Form -->
      <SchemaForm
        ref="formRef"
        v-model="formValues"
        :schema="loginSchema"
        @submit="handleSubmit"
      />

      <!-- Submit Button -->
      <div class="mt-margin-xl">
        <Button
          class="w-full"
          :label="t('login.submit')"
          :loading="loading"
          size="large"
          @click="formRef?.submit?.()"
        />
      </div>

      <!-- Footer / Register Link -->
      <div class="mt-margin-lg text-center">
        <span class="text-muted fs-sm">
          {{ t('login.noAccount') }}
        </span>
        <a class="text-primary font-medium fs-sm ml-margin-sm cursor-pointer hover:underline">
          {{ t('login.register') }}
        </a>
      </div>
    </div>

    <!-- Footer：版权 + 应用名 · 版本 · 描述 -->
    <div
      class="absolute bottom-[var(--spacing-lg)] left-0 right-0 z-10 flex flex-col items-center justify-center gap-y-gap-xs text-muted fs-xs"
    >
      <div class="flex flex-wrap items-center justify-center gap-x-gap-md gap-y-gap-xs">
        <span>{{ brand.displayName }}</span>
        <template v-if="footerVersion">
          <span class="text-border">·</span>
          <span>{{ footerVersion }}</span>
        </template>
        <template v-if="brand.description">
          <span class="text-border">·</span>
          <span
            class="max-w-2xl truncate"
            :title="brand.description"
          >
            {{ brand.description }}
          </span>
        </template>
      </div>
      <div class="text-muted-foreground/80">&copy; {{ new Date().getFullYear() }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// 覆盖 AnimateRouterView 对 .animate__animated 的绝对定位，使 flex 居中生效
:deep(.animate__animated) {
  position: relative !important;
  top: auto !important;
  left: auto !important;
  width: auto !important;
}

// 登录卡片最大宽度（语义化常量）
.login-card {
  --login-card-max-width: v-bind(login_card_max_width);
}

// 渐变背景：使用配色系统 CSS 变量，无硬编码
.login-bg {
  background: linear-gradient(
    135deg,
    rgb(var(--muted) / 15%) 0%,
    rgb(var(--background)) 40%,
    rgb(var(--muted) / 25%) 100%
  );
}

// 覆盖 PrimeVue Card 样式以支持 glassmorphism
:deep(.p-card) {
  background: transparent;
  box-shadow: none;
}

// 动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-md) ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
