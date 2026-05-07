<script setup lang="ts">
defineOptions({ name: 'ExampleProFormValidationPage' })

import type {
  FormSchema,
  ProFormExpose,
  UseFormOptions,
  ValidationResolver,
} from '@/components/ProForm'
import {
  REGEX_EMAIL,
  REGEX_HAS_DIGIT,
  REGEX_HAS_LOWERCASE,
  REGEX_HAS_UPPERCASE,
  REGEX_USERNAME,
  RESERVED_REGISTERED_EMAILS,
  RESERVED_USERNAMES,
  validationMessage,
} from '@/constants/validation'
import { DraftStorage } from '@/components/ProForm/engine/persistence/DraftStorage'

// ── 验证触发模式 ──────────────────────────────────────────────────
const validateOnMode = ref<UseFormOptions['validateOn']>('blur')
const validateOnOptions: { label: string; value: UseFormOptions['validateOn'] }[] = [
  { label: 'blur', value: 'blur' },
  { label: 'change', value: 'change' },
  { label: 'submit', value: 'submit' },
]

// ── 同步规则 Schema ───────────────────────────────────────────────
const syncSchema = reactive<FormSchema>({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      name: 'username',
      component: 'input',
      label: '用户名',
      required: true,
      rules: [
        {
          message: validationMessage.username_required,
          validator: v => typeof v === 'string' && v.trim().length > 0,
        },
        {
          message: validationMessage.username_length,
          validator: v => typeof v === 'string' && v.trim().length >= 3 && v.trim().length <= 20,
        },
        {
          message: validationMessage.username_pattern,
          validator: v => typeof v === 'string' && REGEX_USERNAME.test(v),
        },
      ],
      props: { placeholder: '输入用户名...' },
    },
    {
      name: 'email',
      component: 'input',
      label: '邮箱',
      required: true,
      rules: [
        {
          message: validationMessage.email_required,
          validator: v => typeof v === 'string' && v.trim().length > 0,
        },
        {
          message: validationMessage.email_invalid,
          validator: v => typeof v === 'string' && REGEX_EMAIL.test(v),
        },
      ],
      props: { placeholder: 'user@example.com' },
    },
    {
      name: 'password',
      component: 'input',
      label: '密码',
      required: true,
      rules: [
        {
          message: validationMessage.password_required,
          validator: v => typeof v === 'string' && v.trim().length > 0,
        },
        {
          message: validationMessage.password_min_length,
          validator: v => typeof v === 'string' && v.length >= 8,
        },
        {
          message: validationMessage.password_complexity,
          validator: v =>
            typeof v === 'string' &&
            REGEX_HAS_UPPERCASE.test(v) &&
            REGEX_HAS_LOWERCASE.test(v) &&
            REGEX_HAS_DIGIT.test(v),
        },
      ],
      props: { type: 'password', placeholder: '至少8位，含大小写与数字' },
    },
    {
      name: 'confirmPassword',
      component: 'input',
      label: '确认密码',
      required: true,
      deps: ['password'],
      rules: [
        {
          message: validationMessage.confirm_password_required,
          validator: v => typeof v === 'string' && v.trim().length > 0,
        },
      ],
      visibleIf: ({ form }) => {
        const pwd = form['password']
        return typeof pwd === 'string' && pwd.length > 0
      },
      props: { type: 'password', placeholder: '再次输入密码' },
    },
  ],
})

// 跨字段校验：密码与确认密码一致（通过 resolver 实现）
const syncResolver: ValidationResolver<Record<string, unknown>> = async values => {
  const password = values['password']
  const confirmPassword = values['confirmPassword']
  if (password !== confirmPassword) {
    return {
      valid: false,
      errors: { confirmPassword: [validationMessage.password_mismatch] },
    }
  }
  return { valid: true, errors: {} as Record<string, string[]> }
}

// ── 异步规则 Schema ───────────────────────────────────────────────
const waitFor = (ms: number): Promise<void> =>
  new Promise(resolve => {
    const { start, stop } = useTimeoutFn(
      () => {
        stop()
        resolve()
      },
      ms,
      { immediate: false }
    )
    start()
  })

const asyncSchema = reactive<FormSchema>({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      name: 'asyncUsername',
      component: 'input',
      label: '用户名（异步唯一性检查）',
      required: true,
      rules: [
        {
          message: validationMessage.username_required,
          validator: v => typeof v === 'string' && v.trim().length > 0,
        },
        {
          message: validationMessage.username_taken,
          validator: async (v): Promise<boolean> => {
            await waitFor(800)
            return !(RESERVED_USERNAMES as readonly string[]).includes(String(v).toLowerCase())
          },
        },
      ],
      props: { placeholder: '试试: admin / root / superuser' },
    },
    {
      name: 'asyncEmail',
      component: 'input',
      label: '邮箱（格式 + 异步存在检查）',
      required: true,
      rules: [
        {
          message: validationMessage.email_async_invalid,
          validator: v => typeof v === 'string' && REGEX_EMAIL.test(v),
        },
        {
          message: validationMessage.email_taken,
          validator: async (v): Promise<boolean> => {
            await waitFor(600)
            return !(RESERVED_REGISTERED_EMAILS as readonly string[]).includes(String(v))
          },
        },
      ],
      props: { placeholder: '试试: admin@example.com' },
    },
  ],
})

// ── Refs ──────────────────────────────────────────────────────────
const syncFormRef = ref<ProFormExpose | null>(null)
const draftFormRef = ref<ProFormExpose<DraftFormModel> | null>(null)
const syncResult = ref<string>('')
const asyncResult = ref<string>('')

// ── 表单草稿持久化 / Draft Persistence ─────────────────────────────
const DRAFT_STORAGE_KEY = 'example:proform:validation:draft'

type DraftFormModel = Record<string, unknown> & {
  title: string
  content: string
}

const draftSchema = reactive<FormSchema>({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      name: 'title',
      component: 'input',
      label: 'Article Title',
      required: true,
      rules: [
        {
          message: '标题不能为空',
          validator: v => typeof v === 'string' && v.trim().length > 0,
        },
      ],
      props: { placeholder: '输入标题...' },
    },
    {
      name: 'content',
      component: 'textarea',
      label: 'Content',
      required: true,
      rules: [
        {
          message: '内容不能为空',
          validator: v => typeof v === 'string' && v.trim().length > 0,
        },
      ],
      props: { placeholder: '输入正文...' },
    },
  ],
})

const emptyDraftValues: DraftFormModel = { title: '', content: '' }

const saveDraftDebounced = useDebounceFn((values: DraftFormModel): void => {
  DraftStorage.save(DRAFT_STORAGE_KEY, values)
}, 400)

const draftFormValues = computed<DraftFormModel>(() => {
  const state = draftFormRef.value?.getFormState()
  const values = (state?.values ?? {}) as Record<string, unknown>
  return {
    title: typeof values['title'] === 'string' ? (values['title'] as string) : '',
    content: typeof values['content'] === 'string' ? (values['content'] as string) : '',
  }
})

watch(
  () => draftFormValues.value,
  values => {
    saveDraftDebounced(values)
  },
  { deep: false }
)

onMounted(() => {
  const restored = DraftStorage.load(DRAFT_STORAGE_KEY) as DraftFormModel | null
  if (!restored) return
  nextTick(() => {
    draftFormRef.value?.form?.setFieldsValue({
      title: restored.title ?? '',
      content: restored.content ?? '',
    })
  })
})

function onClearDraft(): void {
  DraftStorage.clear(DRAFT_STORAGE_KEY)
  draftFormRef.value?.form?.setFieldsValue(emptyDraftValues)
  draftFormRef.value?.form?.clearValidate()
  window.$toast?.successIn('top-right', '已清除草稿', '草稿内容已重置')
}

function onClickClearSyncValidate(): void {
  syncFormRef.value?.form?.clearValidate()
}

async function onSyncSubmit(values: Record<string, unknown>): Promise<void> {
  syncResult.value = JSON.stringify(values, null, 2)
  window.$toast?.successIn('top-right', '同步校验通过', '表单提交成功')
}

async function onAsyncSubmit(values: Record<string, unknown>): Promise<void> {
  asyncResult.value = JSON.stringify(values, null, 2)
  window.$toast?.successIn('top-right', '异步校验通过', '表单提交成功')
}
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="flex flex-col"
  >
    <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
      <div class="row-between gap-md min-w-0">
        <div class="row-start gap-sm min-w-0 flex-wrap">
          <div class="glass-icon-box shrink-0">
            <Icons
              name="i-lucide-shield-check"
              size="xl"
              class="text-primary"
            />
          </div>
          <div class="col-stretch gap-xs min-w-0">
            <div class="row-start gap-xs min-w-0 flex-wrap">
              <span class="text-lg font-bold text-foreground text-no-wrap">ProForm 表单验证</span>
              <span class="surface-success rounded-md px-sm py-xs text-xs font-semibold uppercase">
                PRO-FORM
              </span>
            </div>
            <span class="text-sm text-muted-foreground text-ellipsis-1">
              演示同步规则 / 异步 API 检查 / 触发模式（blur / change /
              submit）全链路校验能力。覆盖能力：sync/async 规则、resolver 跨字段校验、validateOn
              三种触发模式与结果观测。
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Scrollable content -->
    <CScrollbar class="flex-1 min-h-0">
      <div class="layout-container py-md col-stretch gap-xl pb-xl">
        <!-- 触发模式选择 -->
        <section class="material-elevated col-stretch gap-lg bg-primary/10 border-primary/20">
          <div class="row-between gap-md flex-wrap">
            <div class="row-center gap-md">
              <div class="p-sm bg-primary/10 rounded-md">
                <Icons
                  name="i-lucide-sliders-horizontal"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs">
                <span class="font-bold text-foreground uppercase tracking-tight">校验触发策略</span>
                <span class="text-xs text-muted-foreground">
                  全局切换 blur / change / submit 触发行为。
                </span>
              </div>
            </div>
            <SelectButton
              v-model="validateOnMode"
              :options="validateOnOptions"
              option-label="label"
              option-value="value"
              class="scale-90 origin-right"
            />
          </div>
        </section>

        <!-- 同步规则演示 -->
        <section class="material-elevated col-stretch gap-lg">
          <div class="row-between items-start mb-md border-border/40 pb-sm">
            <div class="row-center gap-sm">
              <Icons
                name="i-lucide-zap"
                class="text-primary"
              />
              <span class="font-bold text-foreground uppercase tracking-widest">
                同步规则校验 / Sync
              </span>
            </div>
            <Tag
              value="SYNC ENGINE"
              severity="success"
              class="text-xs font-bold"
            />
          </div>

          <div class="col-stretch gap-md">
            <p class="text-muted-foreground text-sm m-0 italic">
              必填检查 · 正则格式 · 跨字段联动 (确认密码)。
            </p>

            <ProForm
              ref="syncFormRef"
              :schema="syncSchema"
              :validate-on="validateOnMode"
              :resolver="syncResolver"
              @submit="onSyncSubmit"
            >
              <template #footer="{ submit, formState }">
                <div class="row-end gap-sm pt-md border-border/15 mt-md">
                  <Button
                    label="重置校验"
                    variant="text"
                    severity="secondary"
                    icon="i-lucide-rotate-ccw"
                    @click="onClickClearSyncValidate"
                  />
                  <Button
                    label="立即提交"
                    icon="i-lucide-check"
                    :loading="formState.submitting"
                    @click="submit"
                  />
                </div>
              </template>
            </ProForm>

            <div
              v-if="syncResult"
              class="bg-muted rounded-md p-md border-default border-border/40"
            >
              <div class="text-xs font-bold text-muted-foreground uppercase mb-xs">
                Submit Result:
              </div>
              <pre class="code-preview text-success">{{ syncResult }}</pre>
            </div>
          </div>
        </section>

        <!-- 异步规则演示 -->
        <section class="material-elevated col-stretch gap-lg">
          <div class="row-between items-start mb-md border-border/40 pb-sm">
            <div class="row-center gap-sm">
              <Icons
                name="i-lucide-loader"
                class="text-primary"
              />
              <span class="font-bold text-foreground uppercase tracking-widest">
                异步 API 校验 / Async
              </span>
            </div>
            <Tag
              value="ASYNC ENGINE"
              severity="info"
              class="text-xs font-bold"
            />
          </div>

          <div class="col-stretch gap-md">
            <p class="text-muted-foreground text-sm m-0 italic">
              自动处理竞态安全，支持 Promise 返回。尝试输入 admin 或 root。
            </p>

            <div class="bg-muted rounded-md px-md py-sm border-default border-border/40">
              <div class="text-xs text-muted-foreground col-stretch gap-xs">
                <div class="font-bold text-foreground text-xs uppercase tracking-tighter">
                  不可用资源清单 (模拟 DB)：
                </div>
                <div class="row-center gap-xs flex-wrap">
                  <span
                    v-for="name in ['admin', 'root', 'superuser', 'test']"
                    :key="name"
                    class="px-xs py-0.5 rounded-sm bg-danger/10 text-danger border-danger/20 border-default"
                  >
                    {{ name }}
                  </span>
                  <span class="mx-2 text-muted-foreground/30">|</span>
                  <span
                    v-for="mail in ['admin@example.com', 'root@example.com']"
                    :key="mail"
                    class="px-xs py-0.5 rounded-sm bg-danger/10 text-danger border-danger/20 border-default"
                  >
                    {{ mail }}
                  </span>
                </div>
              </div>
            </div>

            <ProForm
              ref="asyncFormRef"
              :schema="asyncSchema"
              :validate-on="validateOnMode"
              @submit="onAsyncSubmit"
            >
              <template #footer="{ submit, formState }">
                <div class="row-end gap-sm pt-md border-border/15 mt-md">
                  <Button
                    label="异步校验并提交"
                    icon="i-lucide-cloud-lightning"
                    :loading="formState.submitting"
                    @click="submit"
                  />
                </div>
              </template>
            </ProForm>

            <div
              v-if="asyncResult"
              class="bg-muted rounded-md p-md border-default border-border/40"
            >
              <div class="text-xs font-bold text-muted-foreground uppercase mb-xs">
                Submit Result:
              </div>
              <pre class="code-preview text-primary">{{ asyncResult }}</pre>
            </div>
          </div>
        </section>

        <!-- 表单草稿持久化 / Draft Persistence -->
        <section class="material-elevated col-stretch gap-md">
          <div class="row-between gap-md flex-wrap">
            <div class="row-center gap-sm">
              <Icons
                name="i-lucide-save"
                class="text-primary"
              />
              <span class="font-bold text-foreground uppercase tracking-widest">
                表单草稿持久化 / Draft Persistence
              </span>
            </div>
            <Button
              label="清除草稿 / Clear Draft"
              severity="secondary"
              variant="text"
              icon="i-lucide-trash-2"
              @click="onClearDraft"
            />
          </div>

          <p class="text-muted-foreground text-sm m-0">
            本示例会在输入时自动加密保存草稿（SafeStorage），刷新页面后自动恢复。存储 Key：
            <span class="code-inline">{{ DRAFT_STORAGE_KEY }}</span>
          </p>

          <ProForm
            ref="draftFormRef"
            :schema="draftSchema"
            :initial-values="emptyDraftValues"
            :validate-on="validateOnMode"
          />
        </section>
      </div>
    </CScrollbar>
  </div>
</template>
