<script setup lang="ts">
defineOptions({ name: 'ExampleProFormDagPage' })

import type { FormSchema, FormState, ProFormExpose } from '@/components/ProForm'
import { DateFormatEnum } from '@/constants/dateFormats'

const formRef = ref<ProFormExpose | null>(null)
const { formatDate, isInitialized } = useDateUtils()
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

const initialValues: Record<string, unknown> = {
  cloudProvider: 'aws',
  cpuCores: 2,
  ramGb: 4,
  diskSizeGb: 100,
  needDatabase: false,
}

const schema = reactive<FormSchema>({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    // ── Card 1: 云服务商与区域 — visibleIf ──
    {
      type: 'card',
      name: 'group_visibility',
      label: '1. 云服务商与区域 — visibleIf',
      layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 6 } },
      children: [
        {
          name: 'cloudProvider',
          component: 'select',
          label: '云服务商',
          required: true,
          span: 12,
          props: {
            placeholder: '请选择云服务商',
            options: [
              { label: 'Amazon Web Services', value: 'aws' },
              { label: 'Google Cloud Platform', value: 'gcp' },
              { label: 'Microsoft Azure', value: 'azure' },
            ],
          },
        },
        {
          name: 'awsRegion',
          component: 'select',
          label: 'AWS 区域',
          deps: ['cloudProvider'],
          visibleIf: (ctx: { form: Record<string, unknown> }) => ctx.form.cloudProvider === 'aws',
          span: { xs: 12, sm: 6 },
          props: {
            placeholder: '请选择 AWS 区域',
            options: [
              { label: 'US East (N. Virginia)', value: 'us-east-1' },
              { label: 'US West (Oregon)', value: 'us-west-2' },
              { label: 'EU West (Ireland)', value: 'eu-west-1' },
            ],
          },
        },
        {
          name: 'gcpRegion',
          component: 'select',
          label: 'GCP 区域',
          deps: ['cloudProvider'],
          visibleIf: (ctx: { form: Record<string, unknown> }) => ctx.form.cloudProvider === 'gcp',
          span: { xs: 12, sm: 6 },
          props: {
            placeholder: '请选择 GCP 区域',
            options: [
              { label: 'us-central1 (Iowa)', value: 'us-central1' },
              { label: 'europe-west1 (Belgium)', value: 'europe-west1' },
              { label: 'asia-east1 (Taiwan)', value: 'asia-east1' },
            ],
          },
        },
        {
          name: 'azureRegion',
          component: 'select',
          label: 'Azure 区域',
          deps: ['cloudProvider'],
          visibleIf: (ctx: { form: Record<string, unknown> }) => ctx.form.cloudProvider === 'azure',
          span: { xs: 12, sm: 6 },
          props: {
            placeholder: '请选择 Azure 区域',
            options: [
              { label: 'East US', value: 'eastus' },
              { label: 'West Europe', value: 'westeurope' },
              { label: 'Southeast Asia', value: 'southeastasia' },
            ],
          },
        },
      ],
    },

    // ── Card 2: 数据库配置 — disabledIf ──
    {
      type: 'card',
      name: 'group_disabled',
      label: '2. 数据库配置 — disabledIf',
      layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 6 } },
      children: [
        {
          name: 'needDatabase',
          component: 'switch',
          label: '启用数据库',
          span: 12,
        },
        {
          name: 'databaseType',
          component: 'select',
          label: '数据库类型',
          deps: ['needDatabase'],
          disabledIf: (ctx: { form: Record<string, unknown> }) => !ctx.form.needDatabase,
          span: { xs: 12, sm: 6 },
          props: {
            placeholder: '请选择数据库类型',
            options: [
              { label: 'MySQL', value: 'mysql' },
              { label: 'PostgreSQL', value: 'postgresql' },
              { label: 'MongoDB', value: 'mongodb' },
            ],
          },
        },
      ],
    },

    // ── Card 3: 计算资源与定价 — computed ──
    {
      type: 'card',
      name: 'group_computed',
      label: '3. 计算资源与定价 — computed',
      layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 6 } },
      children: [
        {
          name: 'cpuCores',
          component: 'number',
          label: 'CPU 核心数',
          span: { xs: 12, sm: 6 },
          props: { min: 1, max: 64, showButtons: true, placeholder: '1 - 64' },
        },
        {
          name: 'ramGb',
          component: 'number',
          label: '内存 (GB)',
          span: { xs: 12, sm: 6 },
          props: { min: 1, max: 512, showButtons: true, placeholder: '1 - 512' },
        },
        {
          name: 'basePrice',
          component: 'number',
          label: '预估月费 (USD)',
          description: '自动计算：CPU × $10 + 内存 × $5',
          deps: ['cpuCores', 'ramGb'],
          disabledIf: () => true,
          computed: (ctx: { form: Record<string, unknown> }) => {
            const cpu: number = Number(ctx.form.cpuCores) || 0
            const ram: number = Number(ctx.form.ramGb) || 0
            return cpu * 10 + ram * 5
          },
          span: 12,
          props: {
            mode: 'currency',
            currency: 'USD',
            locale: 'en-US',
          },
        },
      ],
    },

    // ── Card 4: 存储配置 — Cross-field validation ──
    {
      type: 'card',
      name: 'group_validation',
      label: '4. 存储配置 — 跨字段校验',
      layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 6 } },
      children: [
        {
          name: 'diskSizeGb',
          component: 'number',
          label: '磁盘大小 (GB)',
          description: '磁盘容量不得超过内存的 50 倍',
          deps: ['ramGb'],
          span: 12,
          props: { min: 10, showButtons: true, placeholder: '最小 10 GB' },
          rules: [
            {
              message: '磁盘容量不得超过内存 × 50',
              validator: (value: unknown): boolean => {
                const disk: number = Number(value) || 0
                const ram: number = Number(formRef.value?.getFormState().values.ramGb) || 1
                return disk <= ram * 50
              },
            },
          ],
        },
      ],
    },

    // ── Card 5: transform / requiredIf / async options / setFieldProps 演示 ──
    {
      type: 'card',
      name: 'group_advanced',
      label: '5. transform · requiredIf · 异步 options · setFieldProps',
      layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 6 } },
      children: [
        {
          name: 'startDate',
          component: 'date',
          label: `开始日期 (transform → ${DateFormatEnum.Date})`,
          description: `提交时自动转为 ${DateFormatEnum.Date} 字符串`,
          span: 12,
          transform: (value: unknown): unknown => {
            if (value instanceof Date) {
              return isInitialized.value ? formatDate(value, DateFormatEnum.Date) : ''
            }
            return value
          },
          props: { placeholder: '选择日期' },
        },
        {
          name: 'databaseInstanceName',
          component: 'input',
          label: '数据库实例名',
          deps: ['needDatabase'],
          requiredIf: (ctx: { form: Record<string, unknown> }) => ctx.form.needDatabase === true,
          span: 12,
          props: { placeholder: '仅当启用数据库时必填' },
        },
        {
          name: 'city',
          component: 'select',
          label: '城市 (异步 options)',
          description: '模拟接口延迟 600ms 后返回选项',
          span: 12,
          options: async (): Promise<{ label: string; value: string }[]> => {
            await waitFor(600)
            return [
              { label: '北京', value: 'beijing' },
              { label: '上海', value: 'shanghai' },
              { label: '广州', value: 'guangzhou' },
              { label: '深圳', value: 'shenzhen' },
            ]
          },
          props: { placeholder: '请选择城市' },
        },
        {
          name: 'targetField',
          component: 'input',
          label: '目标字段 (setFieldProps 演示)',
          description: '点击下方按钮可动态禁用/启用或修改 placeholder',
          span: 12,
          props: { placeholder: '可被下方按钮动态修改' },
        },
      ],
    },
  ],
})

const targetFieldDisabled = ref<boolean>(false)
function onClickToggleTargetField(): void {
  targetFieldDisabled.value = !targetFieldDisabled.value
  formRef.value?.form?.setFieldProps('targetField', {
    disabled: targetFieldDisabled.value,
    placeholder: targetFieldDisabled.value ? '当前已禁用' : '可被下方按钮动态修改',
  })
}

const formState = computed<FormState<Record<string, unknown>>>(() => {
  return (
    formRef.value?.getFormState() ?? {
      values: {},
      errors: {},
      touched: {},
      dirty: false,
      valid: true,
      submitting: false,
    }
  )
})

const valuesJson = computed<string>(() => {
  return JSON.stringify(formState.value.values, null, 2)
})

async function onSubmit(values: Record<string, unknown>): Promise<void> {
  console.log('ProForm DAG Submit Values:', values)
  window.$toast?.successIn('top-right', '提交成功', '已在控制台输出序列化后的 values')
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
              name="i-lucide-git-branch"
              size="xl"
              class="text-primary"
            />
          </div>
          <div class="col-stretch gap-xs min-w-0">
            <div class="row-start gap-xs min-w-0 flex-wrap">
              <span class="text-lg font-bold text-foreground text-no-wrap">ProForm DAG 工作流</span>
              <span class="surface-success rounded-md px-sm py-xs text-xs font-semibold uppercase">
                PRO-FORM
              </span>
            </div>
            <span class="text-sm text-muted-foreground text-ellipsis-1">
              演示 DAG 引擎的联动模式：visibleIf 条件显隐、disabledIf 条件禁用、computed
              计算字段及跨字段校验。覆盖能力：visibleIf/disabledIf/computed/requiredIf/deps、transform、异步
              options、setFieldProps。
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Content: split layout (form + JSON preview) -->
    <div class="flex-1 min-h-0">
      <div class="row-start items-start gap-lg layout-full min-h-0">
        <div class="flex-1 min-w-0 h-full">
          <CScrollbar class="layout-full">
            <div class="layout-container py-md col-stretch gap-xl pb-xl">
              <section class="material-elevated col-stretch gap-lg">
                <div class="row-center gap-sm pb-sm mb-sm">
                  <Icons
                    name="i-lucide-git-branch"
                    class="text-primary"
                  />
                  <div class="col-stretch gap-xs">
                    <span class="text-md font-semibold text-foreground uppercase tracking-tight">
                      云服务器配置表单
                    </span>
                    <span class="text-xs text-muted-foreground">
                      依赖图驱动：服务商区域显隐、开关禁用控制、资源自动计价、磁盘跨字段校验。
                    </span>
                  </div>
                </div>

                <ProForm
                  ref="formRef"
                  :schema="schema"
                  :initial-values="initialValues"
                  validate-on="change"
                  @submit="onSubmit"
                >
                  <template #footer="{ formState: slotFormState, submit }">
                    <div class="row-end gap-sm pt-md border-border/15 mt-md">
                      <Button
                        :label="targetFieldDisabled ? '启用目标字段' : '禁用目标字段'"
                        severity="secondary"
                        variant="text"
                        size="small"
                        @click="onClickToggleTargetField"
                      />
                      <Button
                        label="立即提交订单"
                        icon="i-lucide-shopping-cart"
                        :loading="slotFormState.submitting"
                        @click="submit"
                      />
                    </div>
                  </template>
                </ProForm>
              </section>

              <!-- Mobile debug panel -->
              <section class="material-elevated col-stretch gap-lg xl:hidden">
                <div class="row-center gap-sm mb-sm">
                  <Icons
                    name="i-lucide-database"
                    class="text-primary"
                  />
                  <span class="text-sm font-semibold text-foreground uppercase">实时 Values</span>
                </div>
                <div
                  class="bg-muted rounded-md p-md border-default border-border/40 text-muted-foreground"
                >
                  <pre class="code-preview">{{ valuesJson }}</pre>
                </div>
              </section>
            </div>
          </CScrollbar>
        </div>

        <div
          class="hidden xl:block layout-sidepanel shrink-0 h-full border-l-default border-border/20"
        >
          <div class="layout-full col-stretch">
            <div class="shrink-0 px-md py-sm border-border/20 row-center gap-sm">
              <Icons
                name="i-lucide-braces"
                size="sm"
                class="text-accent"
              />
              <span class="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Calculated Form State
              </span>
            </div>
            <CScrollbar class="flex-1 min-h-0 bg-muted px-md py-sm">
              <pre class="code-preview text-muted-foreground leading-relaxed">{{ valuesJson }}</pre>
            </CScrollbar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
