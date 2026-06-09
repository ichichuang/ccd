<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { LoginParams } from '@/types/dto/auth.dto'
import type { FormSchema, ProFormExpose } from '@ccd/vue-ui'
import { useLoginSubmit } from '../composables/useLoginSubmit'
import type { LoginCharacterState, LoginFieldName, LoginResponsiveState } from '../types'

defineOptions({ name: 'LoginForm' })

type LoginFormValues = LoginParams

const props = defineProps<{
  responsive: LoginResponsiveState
}>()

const emit = defineEmits<{
  characterStateChange: [state: LoginCharacterState]
}>()

const { t, locale } = useI18n({ useScope: 'global' })
const { loading, submitLogin } = useLoginSubmit()
const formRef = ref<ProFormExpose | null>(null)
const isPasswordVisible = ref<boolean>(false)
const rememberMe = ref<boolean>(false)
const activeField = ref<LoginFieldName | null>(null)
const fieldDraft = reactive<Record<LoginFieldName, string>>({
  username: '',
  password: '',
})

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

function emitCharacterState(): void {
  emit('characterStateChange', {
    activeField: activeField.value,
    usernameLength: fieldDraft.username.length,
    passwordLength: fieldDraft.password.length,
    showPassword: isPasswordVisible.value,
  })
}

function commitInputValue(
  field: LoginFieldName,
  onUpdate: (value: unknown) => void,
  value: unknown
): void {
  const normalizedValue = typeof value === 'string' ? value : ''
  fieldDraft[field] = normalizedValue
  activeField.value = field
  onUpdate(normalizedValue)
  emitCharacterState()
}

function handleFieldFocus(field: LoginFieldName, value: unknown): void {
  activeField.value = field
  fieldDraft[field] = getInputValue(value)
  emitCharacterState()
}

function handleFieldBlur(field: LoginFieldName, value: unknown): void {
  fieldDraft[field] = getInputValue(value)
  activeField.value = null
  emitCharacterState()
}

function togglePasswordVisibility(): void {
  isPasswordVisible.value = !isPasswordVisible.value
  emitCharacterState()
}

function fillPreset(values: LoginFormValues): void {
  formRef.value?.form.setFieldsValue(values)
  fieldDraft.username = values.username
  fieldDraft.password = values.password
  activeField.value = 'username'
  emitCharacterState()
}

async function handleLoginSubmit(): Promise<void> {
  if (loading.value) return
  const instance = formRef.value
  if (!instance) return
  if (!(await instance.validate())) return

  await submitLogin(instance.getFormState().values, () => {
    instance.form.setFieldsValue({ password: '' })
    fieldDraft.password = ''
    activeField.value = 'password'
    emitCharacterState()
  })
}

const formGap = computed(() =>
  props.responsive.isCompact ? 'var(--spacing-2xs)' : 'var(--spacing-xs)'
)

onMounted(() => emitCharacterState())
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
        <div
          class="login-field-shell row-center h-[var(--spacing-2xl)] w-full overflow-hidden rounded-md border border-solid border-input bg-background/88 text-foreground shadow-sm transition-[border-color,box-shadow,background-color] duration-sm hover:border-primary/45 focus-within:!border-primary focus-within:!bg-background focus-within:[box-shadow:var(--p-form-field-focus-ring-shadow)]"
          :class="state.errors.length > 0 ? '!border-danger' : ''"
        >
          <span
            class="pointer-events-none center h-full w-[var(--spacing-2xl)] shrink-0 text-primary/75"
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
            class="login-field-input h-full! min-w-0! flex-1! rounded-none! border-0! bg-transparent! px-0! text-foreground! shadow-none! outline-none! ring-0!"
            fluid
            @focus="handleFieldFocus('username', state.value)"
            @blur="handleFieldBlur('username', state.value)"
            @update:model-value="value => commitInputValue('username', onUpdate, value)"
          />
        </div>
      </template>

      <template #field-password="{ state, onUpdate }">
        <div
          class="login-field-shell row-center h-[var(--spacing-2xl)] w-full overflow-hidden rounded-md border border-solid border-input bg-background/88 text-foreground shadow-sm transition-[border-color,box-shadow,background-color] duration-sm hover:border-primary/45 focus-within:!border-primary focus-within:!bg-background focus-within:[box-shadow:var(--p-form-field-focus-ring-shadow)]"
          :class="state.errors.length > 0 ? '!border-danger' : ''"
        >
          <span
            class="pointer-events-none center h-full w-[var(--spacing-2xl)] shrink-0 text-primary/75"
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
            class="login-field-input h-full! min-w-0! flex-1! rounded-none! border-0! bg-transparent! px-0! text-foreground! shadow-none! outline-none! ring-0!"
            fluid
            @focus="handleFieldFocus('password', state.value)"
            @blur="handleFieldBlur('password', state.value)"
            @update:model-value="value => commitInputValue('password', onUpdate, value)"
          />
          <Button
            type="button"
            severity="secondary"
            variant="text"
            class="h-full! w-[var(--spacing-2xl)] shrink-0 rounded-none! border-0! bg-transparent! p-0! text-muted-foreground! shadow-none! transition-colors duration-sm hover:!bg-primary/8 hover:!text-primary ring-focus-focus"
            :aria-label="isPasswordVisible ? t('login.passwordHide') : t('login.passwordShow')"
            :aria-pressed="isPasswordVisible"
            :disabled="loading || state.disabled"
            @click="togglePasswordVisibility"
          >
            <Icons
              :name="isPasswordVisible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              size="sm"
            />
          </Button>
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
            <Button
              type="button"
              severity="secondary"
              variant="text"
              class="h-[var(--spacing-lg)] rounded-md border-0 bg-transparent px-xs! py-0! text-sm! font-medium! text-primary! shadow-none! transition-colors duration-sm hover:!bg-primary/8 ring-focus-focus"
              :label="t('login.forgotPassword')"
            />
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
            <Button
              id="login-fill-admin"
              type="button"
              severity="secondary"
              variant="text"
              class="justify-center rounded-md! border-0! bg-transparent! px-sm! py-xs! text-sm! font-medium! text-muted-foreground! shadow-none! transition-colors duration-sm hover:!bg-background/75 hover:!text-foreground ring-focus-focus"
              :label="t('login.quickAdmin')"
              @click="fillPreset(ADMIN_PRESET)"
            />
            <Button
              id="login-fill-user"
              type="button"
              severity="secondary"
              variant="text"
              class="justify-center rounded-md! border-0! bg-transparent! px-sm! py-xs! text-sm! font-medium! text-muted-foreground! shadow-none! transition-colors duration-sm hover:!bg-background/75 hover:!text-foreground ring-focus-focus"
              :label="t('login.quickUser')"
              @click="fillPreset(USER_PRESET)"
            />
          </div>
        </div>
      </template>
    </ProForm>
  </section>
</template>
