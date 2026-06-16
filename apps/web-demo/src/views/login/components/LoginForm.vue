<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { LoginParams } from '@/types/dto/auth.dto'
import type { FormSchema, ProFormExpose } from '@ccd/vue-ui'
import AuthLoginCard from './AuthLoginCard.vue'
import AuthQuickAccounts from './AuthQuickAccounts.vue'
import HeaderActions from './HeaderActions.vue'
import { useLoginSubmit } from '../composables/useLoginSubmit'
import type { LoginCharacterState, LoginFieldName, LoginResponsiveState } from '../types'

defineOptions({ name: 'LoginForm' })

type LoginFormValues = LoginParams
type QuickAccountKind = 'admin' | 'user'

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
const selectedQuickAccount = ref<QuickAccountKind | null>(null)
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
  selectedQuickAccount.value = null
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

function fillPreset(kind: QuickAccountKind, values: LoginFormValues): void {
  selectedQuickAccount.value = kind
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
    selectedQuickAccount.value = null
    fieldDraft.password = ''
    activeField.value = 'password'
    emitCharacterState()
  })
}

const formGap = computed(() =>
  props.responsive.isCompact ? 'var(--spacing-xs)' : 'var(--spacing-sm)'
)

onMounted(() => emitCharacterState())
</script>

<template>
  <AuthLoginCard :compact="responsive.isCompact">
    <template #actions>
      <HeaderActions />
    </template>

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
          class="login-field-shell row-center"
          :class="{ 'login-field-shell--invalid': state.errors.length > 0 }"
        >
          <Icons
            name="i-lucide-user"
            size="sm"
            class="login-field-icon"
          />
          <InputText
            id="username"
            :model-value="getInputValue(state.value)"
            :placeholder="t('login.usernamePlaceholder')"
            autocomplete="username"
            size="large"
            :disabled="loading || state.disabled"
            :invalid="state.errors.length > 0"
            class="login-field-input"
            fluid
            @focus="handleFieldFocus('username', state.value)"
            @blur="handleFieldBlur('username', state.value)"
            @update:model-value="value => commitInputValue('username', onUpdate, value)"
          />
        </div>
      </template>

      <template #field-password="{ state, onUpdate }">
        <div
          class="login-field-shell row-center"
          :class="{ 'login-field-shell--invalid': state.errors.length > 0 }"
        >
          <Icons
            name="i-lucide-lock"
            size="sm"
            class="login-field-icon"
          />
          <InputText
            id="password"
            :model-value="getInputValue(state.value)"
            :type="isPasswordVisible ? 'text' : 'password'"
            :placeholder="t('login.passwordPlaceholder')"
            autocomplete="current-password"
            size="large"
            :disabled="loading || state.disabled"
            :invalid="state.errors.length > 0"
            class="login-field-input login-field-input--password"
            fluid
            @focus="handleFieldFocus('password', state.value)"
            @blur="handleFieldBlur('password', state.value)"
            @update:model-value="value => commitInputValue('password', onUpdate, value)"
          />
          <Button
            type="button"
            severity="secondary"
            variant="text"
            class="login-password-toggle ring-focus-focus"
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
        <div class="login-form-footer col-stretch">
          <div class="login-form-options row-between">
            <label class="login-remember-option row-center">
              <Checkbox
                v-model="rememberMe"
                binary
                input-id="login-remember"
                class="shrink-0 leading-none"
                :pt="{ root: { class: 'center' }, box: { class: 'shrink-0' } }"
              />
              <span>{{ t('login.rememberMe') }}</span>
            </label>
            <Button
              type="button"
              severity="secondary"
              variant="text"
              class="login-forgot-button ring-focus-focus"
              :label="t('login.forgotPassword')"
            />
          </div>

          <Button
            id="login-submit"
            class="login-submit-button ring-focus-focus"
            :label="t('login.submit')"
            :loading="formState.submitting || loading"
            size="large"
            @click="handleLoginSubmit"
          />

          <AuthQuickAccounts
            :selected="selectedQuickAccount"
            @fill-admin="fillPreset('admin', ADMIN_PRESET)"
            @fill-user="fillPreset('user', USER_PRESET)"
          />
        </div>
      </template>
    </ProForm>
  </AuthLoginCard>
</template>

<style scoped>
.login-field-shell {
  width: 100%;
  height: calc(var(--control-height-lg) + var(--spacing-sm));
  overflow: hidden;
  border: 1px solid rgb(var(--foreground) / 12%);
  border-radius: var(--radius-xl);
  background:
    linear-gradient(180deg, rgb(var(--card) / 92%), rgb(var(--background) / 74%)),
    rgb(var(--card) / 88%);
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 6%),
    0 1px 2px rgb(var(--foreground) / 3%);
  color: rgb(var(--foreground));
  transition:
    background-color var(--transition-sm) ease-out,
    border-color var(--transition-sm) ease-out,
    box-shadow var(--transition-sm) ease-out;
}

.login-field-shell:hover {
  border-color: rgb(var(--primary) / 38%);
}

.login-field-shell:focus-within {
  border-color: rgb(var(--primary) / 78%);
  background:
    linear-gradient(180deg, rgb(var(--card)), rgb(var(--background) / 82%)), rgb(var(--card));
  box-shadow:
    0 0 0 1px rgb(var(--primary) / 26%),
    0 0 0 4px rgb(var(--primary) / 8%),
    0 2px 8px rgb(var(--primary) / 5%),
    inset 0 1px 0 rgb(var(--foreground) / 7%);
}

:global(.dark) .login-field-shell {
  border-color: rgb(var(--foreground) / 18%);
  background:
    linear-gradient(180deg, rgb(var(--card) / 88%), rgb(var(--background) / 70%)),
    rgb(var(--background) / 70%);
}

:global(.dark) .login-field-shell:hover {
  border-color: rgb(var(--primary) / 48%);
}

:global(.dark) .login-field-shell:focus-within {
  border-color: rgb(var(--primary) / 82%);
  background:
    linear-gradient(180deg, rgb(var(--card) / 84%), rgb(var(--background) / 78%)),
    rgb(var(--background) / 78%);
  box-shadow:
    0 0 0 1px rgb(var(--primary) / 30%),
    0 0 0 4px rgb(var(--primary) / 10%),
    inset 0 1px 0 rgb(var(--foreground) / 5%);
}

.login-field-shell--invalid {
  border-color: rgb(var(--danger) / 64%) !important;
  background-color: rgb(var(--danger) / 2%) !important;
  box-shadow:
    0 0 0 3px rgb(var(--danger) / 7%),
    inset 0 1px 0 rgb(var(--foreground) / 5%) !important;
}

:global(.dark) .login-field-shell--invalid {
  border-color: rgb(var(--danger) / 66%) !important;
  background-color: rgb(var(--danger) / 5%) !important;
}

.login-field-input {
  height: 100% !important;
  min-width: 0 !important;
  flex: 1 1 auto !important;
  padding: 0 var(--spacing-md) 0 var(--spacing-sm) !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: rgb(var(--foreground)) !important;
  box-shadow: none !important;
  outline: none !important;
}

.login-field-input--password {
  padding-right: var(--spacing-sm) !important;
}

.login-field-icon {
  width: var(--spacing-lg);
  margin-left: calc(var(--spacing-md) + var(--spacing-xs));
  flex: 0 0 auto;
  color: rgb(var(--muted-foreground) / 74%);
  opacity: 0.82;
}

:global(.dark) .login-field-icon {
  color: rgb(var(--card-foreground) / 58%);
}

.login-field-shell:focus-within .login-field-icon {
  color: rgb(var(--primary) / 90%);
}

.login-field-input::placeholder {
  color: rgb(var(--muted-foreground) / 66%) !important;
}

:global(.dark) .login-field-input::placeholder {
  color: rgb(var(--card-foreground) / 66%) !important;
}

.login-password-toggle {
  width: calc(var(--control-height-sm) + var(--spacing-xs));
  height: calc(var(--control-height-sm) + var(--spacing-xs));
  margin-right: var(--spacing-sm);
  flex: 0 0 auto;
  border: 1px solid transparent !important;
  border-radius: var(--radius-5xl) !important;
  background: rgb(var(--foreground) / 4%) !important;
  color: rgb(var(--muted-foreground) / 88%) !important;
  box-shadow: none !important;
  padding: 0 !important;
  transition:
    background-color var(--transition-sm) ease-out,
    color var(--transition-sm) ease-out;
}

.login-password-toggle:hover {
  border-color: rgb(var(--primary) / 24%) !important;
  background: rgb(var(--primary) / 10%) !important;
  color: rgb(var(--primary)) !important;
}

.login-password-toggle[aria-pressed='true'] {
  border-color: rgb(var(--primary) / 34%) !important;
  background: rgb(var(--primary) / 12%) !important;
  color: rgb(var(--primary)) !important;
}

/* Deep overrides for ProForm labels and errors */
:deep(label) {
  font-size: var(--font-size-xs) !important;
  font-weight: 600 !important;
  color: rgb(var(--muted-foreground)) !important;
  margin-bottom: var(--spacing-xs) !important;
  letter-spacing: 0 !important;
}

:global(.dark) :deep(label) {
  color: rgb(var(--card-foreground) / 84%) !important;
}

:deep(label > span.text-danger) {
  display: none !important;
}

:deep(.text-danger) {
  color: rgb(var(--danger) / 92%) !important;
  font-size: var(--font-size-xs) !important;
  font-weight: 500 !important;
  letter-spacing: 0 !important;
}

:deep(.text-muted-foreground) {
  font-size: var(--font-size-xs) !important;
  color: rgb(var(--muted-foreground) / 80%) !important;
}

:global(.dark) :deep(.text-muted-foreground) {
  color: rgb(var(--card-foreground) / 78%) !important;
}

.login-form-footer {
  gap: var(--spacing-lg);
  padding-top: var(--spacing-sm);
}

.login-form-options {
  min-height: var(--spacing-2xl);
  gap: var(--spacing-sm);
  padding: 0 var(--spacing-xs);
}

.login-remember-option {
  gap: var(--spacing-xs);
  cursor: pointer;
  color: rgb(var(--muted-foreground));
  font-size: var(--font-size-sm);
  font-weight: 550;
  line-height: 1;
}

:global(.dark) .login-remember-option {
  color: rgb(var(--card-foreground) / 82%);
}

.login-forgot-button {
  height: var(--spacing-lg);
  border: 0 !important;
  border-radius: var(--radius-md) !important;
  background: transparent !important;
  color: rgb(var(--primary)) !important;
  box-shadow: none !important;
  font-size: var(--font-size-sm) !important;
  font-weight: 550 !important;
  padding: 0 var(--spacing-xs) !important;
  transition: background-color var(--transition-sm) ease-out;
}

.login-forgot-button:hover {
  background: rgb(var(--primary) / 7%) !important;
}

.login-submit-button {
  justify-content: center;
  width: 100%;
  min-height: calc(var(--control-height-lg) + var(--spacing-sm) + var(--spacing-xs));
  border: 0 !important;
  border-radius: var(--radius-lg) !important;
  background: linear-gradient(90deg, rgb(var(--primary)), rgb(var(--accent) / 85%)) !important;
  color: rgb(var(--primary-foreground)) !important;
  box-shadow:
    0 var(--spacing-xs) var(--spacing-lg) rgb(var(--primary) / 20%),
    0 1px 2px rgb(var(--foreground) / 8%) !important;
  font-weight: 600 !important;
  letter-spacing: 0 !important;
  transition:
    background-color var(--transition-sm) ease-out,
    opacity var(--transition-sm) ease-out,
    box-shadow var(--transition-sm) ease-out;
}

.login-submit-button:hover:not(:disabled) {
  background: linear-gradient(
    90deg,
    rgb(var(--primary-hover)),
    rgb(var(--accent) / 95%)
  ) !important;
  box-shadow:
    0 var(--spacing-sm) var(--spacing-xl) rgb(var(--primary) / 24%),
    0 2px 4px rgb(var(--foreground) / 10%) !important;
}

.login-submit-button:disabled {
  opacity: 0.6;
}

@media (width <= 768px) {
  .login-form-options {
    padding: 0;
  }
}
</style>
