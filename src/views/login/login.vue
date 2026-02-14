<script setup lang="tsx">
import type { FormValues, Schema } from '@/components/schema-form'
import { SchemaForm } from '@/components/schema-form'
import { AUTH_ENABLED } from '@/constants/router'
import { LOGIN_CARD_MAX_WIDTH } from '@/constants/login'
import { useDeviceStore } from '@/stores/modules/device'
import { useUserStore } from '@/stores/modules/user'
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'
import { useLocale } from '@/hooks/modules/useLocale'
import type { SupportedLocale } from '@/locales'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const userStore = useUserStore()
const deviceStore = useDeviceStore()
const isMobileLayout = computed(() => deviceStore.isMobileLayout)
const toolbarIconSize = computed(() => (isMobileLayout.value ? 'xl' : '2xl'))
const toolbarSelectSize = computed(() => (isMobileLayout.value ? 'large' : 'small'))
const { isDark, isAnimating, toggleThemeWithAnimation } = useThemeSwitch()
const { locale, switchLocale, supportedLocales } = useLocale()

const localeOptions = computed(() =>
  supportedLocales.map(l => ({ value: l.key as SupportedLocale, label: `${l.flag} ${l.name}` }))
)

const formRef = ref<InstanceType<typeof SchemaForm> | null>(null)
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
              class="text-primary fs-sm no-underline hover:text-primary-hover transition-colors"
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
    // 成功后，userStore.setUserInfo 内部会处理跳转
  } catch (error) {
    errorMessage.value = (error as Error).message || t('login.failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 overflow-hidden center">
    <!-- 渐变背景：使用配色系统变量，无外部资源 -->
    <div class="login-bg absolute inset-0 z-0" />

    <!-- 主题 / 语言切换（右上角） -->
    <div class="absolute top-[var(--spacing-lg)] right-[var(--spacing-lg)] z-20 row-center gap-sm">
      <Button
        variant="text"
        severity="secondary"
        class="center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
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
      class="login-card relative z-10 w-full max-w-[90vw] md:max-w-[var(--login-card-max-width)] p-padding-xl bg-card/90 backdrop-blur-md rounded-scale-md shadow-md border border-border animate__animated animate__fadeInUp"
    >
      <!-- Header -->
      <div class="column cross-center gap-md mb-margin-xl">
        <div
          class="w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] shrink-0 rounded-full bg-primary/10 row-center"
        >
          <Icons
            name="i-lucide-layout-dashboard"
            size="2xl"
            class="text-primary"
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

      <!-- Error Message -->
      <Transition name="fade">
        <div
          v-if="errorMessage"
          class="mt-margin-md p-padding-md rounded-scale-md bg-destructive/10 border border-destructive/20 row cross-center gap-sm"
        >
          <Icons
            name="i-lucide-alert-circle"
            class="text-destructive shrink-0"
          />
          <span class="text-destructive fs-sm">{{ errorMessage }}</span>
        </div>
      </Transition>

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

    <!-- Footer Copyright -->
    <div class="absolute bottom-[var(--spacing-lg)] text-muted fs-xs text-center w-full z-10">
      &copy; {{ new Date().getFullYear() }}
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
  --login-card-max-width: v-bind(LOGIN_CARD_MAX_WIDTH);
}

// 渐变背景：使用配色系统 CSS 变量，无硬编码
.login-bg {
  background: linear-gradient(
    135deg,
    rgb(var(--muted) / 0.15) 0%,
    rgb(var(--background)) 40%,
    rgb(var(--muted) / 0.25) 100%
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
