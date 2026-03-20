<script setup lang="ts">
defineOptions({ name: 'ExampleProFormValidationPage' })

import type {
  FormSchema,
  ProFormExpose,
  UseFormOptions,
  ValidationResolver,
} from '@/components/ProForm'

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
          message: '用户名不能为空',
          validator: v => typeof v === 'string' && v.trim().length > 0,
        },
        {
          message: '用户名长度 3-20 字符',
          validator: v => typeof v === 'string' && v.trim().length >= 3 && v.trim().length <= 20,
        },
        {
          message: '只允许字母、数字和下划线',
          validator: v => typeof v === 'string' && /^[a-zA-Z0-9_]+$/.test(v),
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
          message: '邮箱不能为空',
          validator: v => typeof v === 'string' && v.trim().length > 0,
        },
        {
          message: '请输入合法的邮箱地址',
          validator: v => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
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
          message: '密码不能为空',
          validator: v => typeof v === 'string' && v.trim().length > 0,
        },
        {
          message: '密码至少 8 位',
          validator: v => typeof v === 'string' && v.length >= 8,
        },
        {
          message: '密码需包含大写字母、小写字母和数字',
          validator: v =>
            typeof v === 'string' && /[A-Z]/.test(v) && /[a-z]/.test(v) && /[0-9]/.test(v),
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
          message: '请确认密码',
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
      errors: { confirmPassword: ['两次输入的密码不一致'] },
    }
  }
  return { valid: true, errors: {} as Record<string, string[]> }
}

// ── 异步规则 Schema ───────────────────────────────────────────────
// 模拟已占用的用户名
const TAKEN_USERNAMES = ['admin', 'root', 'superuser', 'test']

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
          message: '用户名不能为空',
          validator: v => typeof v === 'string' && v.trim().length > 0,
        },
        {
          message: '该用户名已被占用（模拟 API 检查）',
          validator: (v): Promise<boolean> =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve(!TAKEN_USERNAMES.includes(String(v).toLowerCase()))
              }, 800)
            }),
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
          message: '请输入合法邮箱',
          validator: v => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        },
        {
          message: '该邮箱已注册（模拟 API 检查）',
          validator: (v): Promise<boolean> =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve(!['admin@example.com', 'root@example.com'].includes(String(v)))
              }, 600)
            }),
        },
      ],
      props: { placeholder: '试试: admin@example.com' },
    },
  ],
})

// ── Refs ──────────────────────────────────────────────────────────
const syncFormRef = ref<ProFormExpose | null>(null)
const syncResult = ref<string>('')
const asyncResult = ref<string>('')

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
    class="layout-full px-md md:px-lg col-stack-sm min-h-0"
  >
    <!-- Toolbar: Hero Header (Transparent Root Policy: Inherit canvas) -->
    <header class="shrink-0 border-b-default border-border/15">
      <div class="w-full py-sm row-y-center gap-md">
        <div class="p-md bg-primary/10 rounded-lg shrink-0">
          <Icons
            name="i-lucide-shield-check"
            class="text-primary text-2xl"
          />
        </div>
        <div class="col-stack-xs">
          <h1 class="text-2xl font-bold text-foreground m-0">ProForm 校验管线</h1>
          <p class="text-muted-foreground text-sm m-0">
            演示同步规则 / 异步 API 检查 / 触发模式（blur · change · submit）全链路校验能力。
          </p>
        </div>
      </div>
    </header>

    <!-- Scrollable content -->
    <CScrollbar class="flex-1 min-h-0">
      <div class="w-full p-md md:p-lg col-stack-xl pb-xl">
        <!-- 触发模式选择 -->
        <div
          class="bg-card rounded-md shadow-sm dark:shadow-md py-md px-lg flex flex-col gap-lg bg-primary/10 dark:bg-primary/5 border-primary/20"
        >
          <div class="row-between gap-md flex-wrap">
            <div class="row-y-center gap-md">
              <div class="p-sm bg-primary/10 rounded-md">
                <Icons
                  name="i-lucide-sliders-horizontal"
                  class="text-primary"
                />
              </div>
              <div class="col-stack-xs">
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
        </div>

        <!-- 同步规则演示 -->
        <div class="bg-card rounded-md shadow-sm dark:shadow-md py-md px-lg flex flex-col gap-lg">
          <div
            class="row-between items-start mb-padding-md border-b-default border-border/40 pb-sm"
          >
            <div class="row-y-center gap-sm">
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

          <div class="col-stack-md">
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
                <div class="row-end gap-sm pt-md border-t-default border-border/15 mt-padding-md">
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
              <pre class="m-0 whitespace-pre-wrap break-words text-xs font-mono text-success">{{
                syncResult
              }}</pre>
            </div>
          </div>
        </div>

        <!-- 异步规则演示 -->
        <div class="bg-card rounded-md shadow-sm dark:shadow-md py-md px-lg flex flex-col gap-lg">
          <div
            class="row-between items-start mb-padding-md border-b-default border-border/40 pb-sm"
          >
            <div class="row-y-center gap-sm">
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

          <div class="col-stack-md">
            <p class="text-muted-foreground text-sm m-0 italic">
              自动处理竞态安全，支持 Promise 返回。尝试输入 admin 或 root。
            </p>

            <div class="bg-muted rounded-md px-md py-sm border-default border-border/40">
              <div class="text-xs text-muted-foreground col-stack-xs">
                <div class="font-bold text-foreground text-xs uppercase tracking-tighter">
                  不可用资源清单 (模拟 DB)：
                </div>
                <div class="row-y-center gap-xs flex-wrap">
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
                <div class="row-end gap-sm pt-md border-t-default border-border/15 mt-padding-md">
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
              <pre class="m-0 whitespace-pre-wrap break-words text-xs font-mono text-primary">{{
                asyncResult
              }}</pre>
            </div>
          </div>
        </div>
      </div>
    </CScrollbar>
  </div>
</template>
