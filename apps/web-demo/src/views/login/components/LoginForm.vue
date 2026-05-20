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
          validator: value => typeof value === 'string' && value.trim().length > 0,
        },
        {
          message: t('login.passwordMin'),
          validator: value => typeof value === 'string' && value.trim().length >= 6,
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

function getInputValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function commitInputValue(onUpdate: (value: unknown) => void, value: unknown): void {
  onUpdate(typeof value === 'string' ? value : '')
}

function commitPasswordValue(onUpdate: (value: unknown) => void, value: unknown): void {
  const nextValue = typeof value === 'string' ? value : ''
  onUpdate(nextValue)
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

  const isValid = await instance.validate()
  if (!isValid) return

  const formState = instance.getFormState()
  await submitLogin(formState.values, () => {
    instance.form.setFieldsValue({ password: '' })
  })
}

const formShellClass = computed(() =>
  props.responsive.compactForm ? 'gap-sm p-sm sm:p-md' : 'gap-md p-lg'
)

const footerClass = computed(() => (props.responsive.compactForm ? 'gap-xs pt-0' : 'gap-sm pt-xs'))
</script>

<template>
  <section
    class="relative z-content w-full min-w-0 justify-self-end rounded-xl bg-background/80 col-stretch"
    :class="formShellClass"
  >
    <div class="col-center min-w-0 gap-xs text-center">
      <h2
        class="m-0 text-foreground font-bold leading-tight"
        :class="responsive.compactForm ? 'text-xl' : 'text-2xl md:text-3xl'"
      >
        {{ t('login.heading') }}
      </h2>
      <p
        v-if="!responsive.compactHeight"
        class="m-0 text-sm text-muted-foreground leading-normal"
      >
        {{ t('login.description') }}
      </p>
    </div>

    <ProForm
      :key="locale"
      ref="formRef"
      :schema="loginSchema"
      validate-on="submit"
      :disabled="loading"
      :gap="responsive.compactForm ? 'var(--spacing-xs)' : 'var(--spacing-sm)'"
      @submit="values => submitLogin(values)"
    >
      <template #field-username="{ state, onUpdate }">
        <div class="relative w-full">
          <span
            class="pointer-events-none absolute inset-y-0 left-0 z-content center h-full w-[var(--spacing-2xl)] text-muted-foreground"
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
            class="h-[var(--spacing-2xl)]! w-full pl-[var(--spacing-2xl)]!"
            fluid
            @update:model-value="value => commitInputValue(onUpdate, value)"
          />
        </div>
      </template>

      <template #field-password="{ state, onUpdate }">
        <div class="relative w-full">
          <span
            class="pointer-events-none absolute inset-y-0 left-0 z-content center h-full w-[var(--spacing-2xl)] text-muted-foreground"
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
            class="h-[var(--spacing-2xl)]! w-full pl-[var(--spacing-2xl)]! pr-[var(--spacing-2xl)]!"
            fluid
            @update:model-value="value => commitPasswordValue(onUpdate, value)"
          />
          <span
            role="button"
            tabindex="0"
            class="absolute inset-y-0 right-0 z-content center h-full w-[var(--spacing-2xl)] cursor-pointer text-muted-foreground duration-md hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
        <div
          class="col-stretch"
          :class="footerClass"
        >
          <div class="row-between min-w-0 gap-sm">
            <label class="inline-flex cursor-pointer items-center gap-xs text-sm text-foreground">
              <Checkbox
                v-model="rememberMe"
                binary
                input-id="login-remember"
              />
              <span class="leading-none">{{ t('login.rememberMe') }}</span>
            </label>
            <a
              href="#"
              class="text-sm text-primary leading-none decoration-none hover:underline"
            >
              {{ t('login.forgotPassword') }}
            </a>
          </div>

          <Button
            id="login-submit"
            class="w-full justify-center"
            :label="t('login.submit')"
            :loading="formState.submitting || loading"
            size="large"
            @click="handleLoginSubmit"
          />

          <div
            v-if="responsive.showQuickRoles"
            class="grid grid-cols-[1fr_auto_1fr] items-center gap-sm"
            :class="responsive.compactForm ? 'pt-0' : 'pt-xs'"
          >
            <span class="h-px bg-border/60" />
            <p class="m-0 text-sm text-muted-foreground leading-none text-no-wrap">
              {{ t('login.quickFillTips') }}
            </p>
            <span class="h-px bg-border/60" />
          </div>

          <div
            v-if="responsive.showQuickRoles"
            class="grid grid-cols-2 gap-sm"
          >
            <Button
              id="login-fill-admin"
              class="w-full justify-center"
              :label="t('login.quickAdmin')"
              severity="secondary"
              variant="text"
              size="large"
              @click="fillPreset(ADMIN_PRESET)"
            >
              <template #icon>
                <Icons
                  name="i-lucide-shield-check"
                  size="sm"
                />
              </template>
            </Button>
            <Button
              id="login-fill-user"
              class="w-full justify-center"
              :label="t('login.quickUser')"
              severity="secondary"
              variant="text"
              size="large"
              @click="fillPreset(USER_PRESET)"
            >
              <template #icon>
                <Icons
                  name="i-lucide-user"
                  size="sm"
                />
              </template>
            </Button>
          </div>

          <div
            v-if="!responsive.compactHeight && responsive.mode !== 'mobile'"
            class="row-between gap-sm rounded-lg border border-solid border-success/20 bg-success/10 px-sm py-xs text-sm text-success"
          >
            <span class="inline-flex min-w-0 items-center gap-xs leading-none">
              <Icons
                name="i-lucide-shield-check"
                size="sm"
                class="shrink-0"
              />
              <span class="truncate">{{ t('login.governanceProtected') }}</span>
            </span>
            <span class="inline-flex min-w-0 items-center gap-xs leading-none">
              <Icons
                name="i-lucide-circle-check"
                size="xs"
                class="shrink-0"
              />
              <span class="truncate">{{ t('login.runtimeSynchronized') }}</span>
            </span>
          </div>

          <p
            v-if="!responsive.compactHeight"
            class="m-0 text-center text-sm text-muted-foreground leading-normal"
          >
            {{ t('login.noAccount') }}
            <a
              href="#"
              class="text-primary decoration-none hover:underline"
            >
              {{ t('login.register') }}
            </a>
          </p>
        </div>
      </template>
    </ProForm>
  </section>
</template>
