<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { LoginParams } from '@/types/dto/auth.dto'
import type { FormSchema, ProFormExpose } from '@/components/ProForm'
import { useLoginSubmit } from '../composables/useLoginSubmit'
import type { LoginResponsiveState } from '../types'

defineOptions({ name: 'LoginForm' })

type LoginFormValues = LoginParams

const props = defineProps<{
  responsive: LoginResponsiveState
}>()

const { t, locale } = useI18n({ useScope: 'global' })
const { loading, submitLogin } = useLoginSubmit()
const formRef = ref<ProFormExpose | null>(null)
const isPasswordVisible = ref<boolean>(false)
const rememberMe = ref<boolean>(false)

const loginSchema = computed<FormSchema>(() => ({
  fields: [
    {
      name: 'username',
      component: 'input',
      label: t('login.usernameLabel'),
      required: true,
      props: {
        placeholder: t('login.usernamePlaceholder'),
        size: 'large',
        autocomplete: 'username',
      },
      rules: [
        {
          message: t('login.usernameRequired'),
          validator: value => typeof value === 'string' && value.trim().length > 0,
        },
        {
          message: t('login.usernameLength'),
          validator: value =>
            typeof value === 'string' && value.trim().length >= 3 && value.trim().length <= 20,
        },
      ],
    },
    {
      name: 'password',
      component: 'input',
      label: t('login.passwordLabel'),
      required: true,
      props: {
        placeholder: t('login.passwordPlaceholder'),
        size: 'large',
        autocomplete: 'current-password',
      },
      rules: [
        {
          message: t('login.passwordRequired'),
          validator: value => typeof value === 'string' && value.trim().length > 0,
        },
        {
          message: t('login.passwordMin'),
          validator: value => typeof value === 'string' && value.trim().length >= 6,
        },
      ],
    },
  ],
}))

const ADMIN_PRESET: LoginFormValues = { username: 'admin', password: '123456' }
const USER_PRESET: LoginFormValues = { username: 'user', password: '123456' }

function getInputValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function commitInputValue(onUpdate: (value: unknown) => void, value: unknown): void {
  onUpdate(typeof value === 'string' ? value : '')
}

function togglePasswordVisibility(): void {
  isPasswordVisible.value = !isPasswordVisible.value
}

function fillPreset(values: LoginFormValues): void {
  formRef.value?.form.setFieldsValue(values)
}

async function handleLoginSubmit(): Promise<void> {
  if (loading.value) return
  const instance = formRef.value
  if (!instance) return
  if (!(await instance.validate())) return

  await submitLogin(instance.getFormState().values, () => {
    instance.form.setFieldsValue({ password: '' })
  })
}

const formGap = computed(() =>
  props.responsive.isCompact ? 'var(--spacing-2xs)' : 'var(--spacing-xs)'
)
</script>

<template>
  <section class="col-stretch gap-sm">
    <ProForm
      :key="locale"
      ref="formRef"
      :schema="loginSchema"
      validate-on="submit"
      :disabled="loading"
      :gap="formGap"
      @submit="handleLoginSubmit"
    >
      <template #field-username="{ state, onUpdate }">
        <div class="relative w-full">
          <span
            class="pointer-events-none absolute inset-y-0 left-0 z-content center h-full w-[var(--spacing-2xl)] text-primary/75"
          >
            <Icons
              name="i-lucide-user"
              size="sm"
            />
          </span>
          <InputText
            id="username"
            :model-value="getInputValue(state.value)"
            :placeholder="t('login.usernamePlaceholder')"
            autocomplete="username"
            size="large"
            :disabled="loading || state.disabled"
            :invalid="state.errors.length > 0"
            class="h-[var(--spacing-2xl)]! w-full rounded-lg! border border-solid border-input! bg-background/88! pl-[var(--spacing-2xl)]! text-foreground! shadow-none! transition-colors duration-sm hover:!border-primary/45 focus-visible:!border-primary focus-visible:!bg-background focus-visible:[box-shadow:var(--p-form-field-focus-ring-shadow)]"
            fluid
            @update:model-value="value => commitInputValue(onUpdate, value)"
          />
        </div>
      </template>

      <template #field-password="{ state, onUpdate }">
        <div class="relative w-full">
          <span
            class="pointer-events-none absolute inset-y-0 left-0 z-content center h-full w-[var(--spacing-2xl)] text-primary/75"
          >
            <Icons
              name="i-lucide-lock"
              size="sm"
            />
          </span>
          <InputText
            id="password"
            :model-value="getInputValue(state.value)"
            :type="isPasswordVisible ? 'text' : 'password'"
            :placeholder="t('login.passwordPlaceholder')"
            autocomplete="current-password"
            size="large"
            :disabled="loading || state.disabled"
            :invalid="state.errors.length > 0"
            class="h-[var(--spacing-2xl)]! w-full rounded-lg! border border-solid border-input! bg-background/88! pl-[var(--spacing-2xl)]! pr-[var(--spacing-2xl)]! text-foreground! shadow-none! transition-colors duration-sm hover:!border-primary/45 focus-visible:!border-primary focus-visible:!bg-background focus-visible:[box-shadow:var(--p-form-field-focus-ring-shadow)]"
            fluid
            @update:model-value="value => commitInputValue(onUpdate, value)"
          />
          <span
            role="button"
            tabindex="0"
            class="absolute inset-y-0 right-0 z-content center h-full w-[var(--spacing-2xl)] cursor-pointer text-muted-foreground transition-colors duration-sm hover:text-primary ring-focus-focus"
            :aria-label="isPasswordVisible ? t('login.passwordHide') : t('login.passwordShow')"
            :aria-pressed="isPasswordVisible"
            :aria-disabled="loading || state.disabled"
            @click="!(loading || state.disabled) && togglePasswordVisibility()"
            @keydown.enter.prevent="!(loading || state.disabled) && togglePasswordVisibility()"
            @keydown.space.prevent="!(loading || state.disabled) && togglePasswordVisibility()"
          >
            <Icons
              :name="isPasswordVisible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              size="sm"
            />
          </span>
        </div>
      </template>

      <template #footer="{ formState }">
        <div class="col-stretch gap-xs pt-xs">
          <div class="row-between h-[var(--spacing-2xl)] gap-sm px-xs">
            <label
              class="row-center cursor-pointer gap-xs text-sm font-medium text-muted-foreground"
            >
              <Checkbox
                v-model="rememberMe"
                binary
                input-id="login-remember"
                class="shrink-0 leading-none"
                :pt="{ root: { class: 'center' }, box: { class: 'shrink-0' } }"
              />
              <span class="leading-none">{{ t('login.rememberMe') }}</span>
            </label>
            <a
              href="#"
              class="text-sm font-medium text-primary leading-none decoration-none hover:underline"
            >
              {{ t('login.forgotPassword') }}
            </a>
          </div>

          <Button
            id="login-submit"
            class="w-full justify-center rounded-lg! bg-primary! [color:rgb(var(--primary-foreground))]! shadow-sm transition-colors duration-sm hover:bg-primary-hover! ring-focus-focus disabled:opacity-70"
            :label="t('login.submit')"
            :loading="formState.submitting || loading"
            size="large"
            @click="handleLoginSubmit"
          />

          <div
            class="grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-solid border-border/45 bg-muted/30 p-2xs"
          >
            <button
              id="login-fill-admin"
              type="button"
              class="cursor-pointer rounded-md border-0 bg-transparent px-sm py-xs text-sm font-medium text-muted-foreground transition-colors duration-sm hover:bg-background/75 hover:text-foreground ring-focus-focus"
              @click="fillPreset(ADMIN_PRESET)"
            >
              {{ t('login.quickAdmin') }}
            </button>
            <button
              id="login-fill-user"
              type="button"
              class="cursor-pointer rounded-md border-0 bg-transparent px-sm py-xs text-sm font-medium text-muted-foreground transition-colors duration-sm hover:bg-background/75 hover:text-foreground ring-focus-focus"
              @click="fillPreset(USER_PRESET)"
            >
              {{ t('login.quickUser') }}
            </button>
          </div>
        </div>
      </template>
    </ProForm>
  </section>
</template>
