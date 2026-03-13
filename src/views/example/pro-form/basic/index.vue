<script setup lang="ts">
defineOptions({ name: 'ExampleProFormBasicPage' })

import type { FormSchema, FormState } from '@/components/ProForm'
import { useAppElementSize } from '@/hooks/modules/useAppElementSize'
type ProFormExpose = {
  submit: () => Promise<void>
  validate: () => Promise<boolean>
  getValues: () => Record<string, unknown>
  getFormState: () => FormState<Record<string, unknown>>
}

const isReadonly = ref<boolean>(false)
const isDisabled = ref<boolean>(false)
const containerRef = ref<HTMLDivElement | null>(null)
const { height: containerHeight } = useAppElementSize(containerRef)
const schema = reactive<FormSchema>({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      type: 'card',
      name: 'group_text',
      label: '1. 文本与输入类',
      layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 6 } },
      children: [
        {
          name: 'username',
          component: 'input',
          label: '标准输入 (input)',
          required: true,
          rules: [
            {
              message: '必填项：请输入用户名',
              validator: v => typeof v === 'string' && v.trim().length > 0,
            },
          ],
          span: { xs: 12, sm: 6 },
          props: { placeholder: '请输入用户名' },
        },
        {
          name: 'password',
          component: 'input',
          label: '密码输入 (input[type=password])',
          span: { xs: 12, sm: 6 },
          props: { type: 'password', placeholder: '请输入密码' },
        },
        {
          name: 'phone',
          component: 'mask',
          label: '掩码输入 (mask)',
          span: { xs: 12, sm: 6 },
          props: { mask: '999-9999-9999', placeholder: '138-0000-0000' },
        },
        {
          name: 'bio',
          component: 'textarea',
          label: '多行文本 (textarea)',
          description: '用于展示 autoResize、多行输入与基础校验提示的布局效果。',
          span: 12,
          props: { rows: 3, placeholder: '请输入简介…' },
        },
      ],
    },
    {
      type: 'card',
      name: 'group_select',
      label: '2. 选择与数值类',
      layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 6 } },
      children: [
        {
          name: 'role',
          component: 'select',
          label: '单选下拉 (select)',
          span: 6,
          props: {
            placeholder: '请选择角色',
            options: [
              { label: '管理员', value: 'admin' },
              { label: '普通用户', value: 'user' },
            ],
          },
        },
        {
          name: 'tags',
          component: 'multiselect',
          label: '多选下拉 (multiselect)',
          span: 6,
          props: {
            placeholder: '请选择标签',
            maxSelectedLabels: 2,
            options: [
              { label: 'Vue 3', value: 'vue' },
              { label: 'TypeScript', value: 'ts' },
              { label: 'PrimeVue', value: 'primevue' },
            ],
          },
        },
        {
          name: 'salary',
          component: 'number',
          label: '数字输入 (number)',
          span: { xs: 12, sm: 6 },
          props: {
            mode: 'currency',
            currency: 'CNY',
            locale: 'zh-CN',
            placeholder: '例如：15,000',
          },
        },
        {
          name: 'score',
          component: 'slider',
          label: '滑块 (slider)',
          span: { xs: 12, sm: 6 },
          defaultValue: 50,
          props: { min: 0, max: 100 },
        },
      ],
    },
    {
      type: 'card',
      name: 'group_bool',
      label: '3. 开关 / 单选 / 多选 / 日期',
      layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 6 } },
      children: [
        {
          name: 'isVip',
          component: 'switch',
          label: '开关 (switch)',
          span: { xs: 12, sm: 6 },
          defaultValue: true,
        },
        {
          name: 'joinDate',
          component: 'date',
          label: '日期选择 (date)',
          span: { xs: 12, sm: 6 },
          props: { showIcon: true, placeholder: '选择日期' },
        },
        {
          name: 'gender',
          component: 'radio',
          label: '单选组 (radio)',
          span: { xs: 12, sm: 6 },
          props: {
            options: [
              { label: '男', value: 'M' },
              { label: '女', value: 'F' },
            ],
          },
        },
        {
          name: 'hobbies',
          component: 'checkbox',
          label: '多选组 (checkbox)',
          span: { xs: 12, sm: 6 },
          props: {
            options: [
              { label: '阅读', value: 'read' },
              { label: '运动', value: 'sport' },
              { label: '音乐', value: 'music' },
            ],
          },
        },
      ],
    },
    {
      type: 'card',
      name: 'group_advanced',
      label: '4. 高级组件',
      layout: { type: 'grid', gap: 'var(--spacing-md)', span: 12 },
      children: [
        {
          name: 'satisfaction',
          component: 'rating',
          label: '评分 (rating)',
          span: 12,
          defaultValue: 4,
        },
        {
          name: 'avatar',
          component: 'upload',
          label: '文件上传 (upload)',
          description: '此处使用 basic 模式演示：选择文件后你可以在右侧 JSON 中观察值变化。',
          span: 12,
          props: { accept: 'image/*', chooseLabel: '选择图片' },
        },
      ],
    },
  ],
})

const initialValues = reactive<Record<string, unknown>>({
  username: 'Admin',
  salary: 15000,
  role: 'admin',
  tags: ['vue', 'ts'],
})

const formRef = ref<ProFormExpose | null>(null)

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
  // 这里用 window.$toast 做轻量反馈（布局层已挂载）；真实业务里可替换为请求提交逻辑

  console.log('ProForm Basic Submit Values:', values)
  window.$toast?.successIn('top-right', '提交成功', '已在控制台输出序列化后的 values')
}

async function onClickValidateAndSubmit(): Promise<void> {
  if (isDisabled.value || isReadonly.value) return
  await formRef.value?.submit()
}

async function onClickValidateOnly(): Promise<void> {
  const ok = await (formRef.value?.validate() ?? Promise.resolve(false))
  window.$toast?.infoIn(
    'top-right',
    ok ? '校验通过' : '校验失败',
    ok ? '可以继续提交' : '请检查必填项与错误提示'
  )
}
</script>

<template>
  <div
    class="h-full flex flex-col overflow-hidden"
    data-archetype="playground-single-panel"
  >
    <div
      class="shrink-0 px-padding-lg py-padding-md bg-accent/20 dark:bg-accent/12 border-b-default border-accent"
    >
      <div class="gap-scale-xs">
        <div class="fs-xl font-semibold text-foreground">ProForm 基础组件与状态联动</div>
        <div class="fs-sm text-muted-foreground">
          本页展示 ProForm 引擎已注册的全部基础字段，并演示全局
          <span class="px-padding-xs rounded-scale-md bg-muted">readonly</span>
          /
          <span class="px-padding-xs rounded-scale-md bg-muted">disabled</span>
          联动、校验与提交。
        </div>
      </div>
    </div>

    <div
      ref="containerRef"
      class="gap-xs flex-1"
    >
      <div
        class="layout-full flex gap-xs"
        :style="{ height: `${containerHeight}px` }"
      >
        <CScrollbar>
          <div class="layout-stack gap-scale-md">
            <!-- 吸附到顶部的卡片 -->
            <div
              class="sticky top-0 z-1 surface-elevated px-md py-sm rounded-md gap-scale-md flex justify-between"
            >
              <div class="center gap-md">
                <Icons
                  name="i-lucide-sliders-horizontal"
                  size="xl"
                  class="text-accent!"
                />
                <div class="flex-col gap-xs">
                  <div class="font-semibold">全局状态控制</div>
                  <div class="fs-xs text-muted-foreground">
                    用于快速验证 readonly / disabled 对所有字段的影响。
                  </div>
                </div>
              </div>

              <div class="center gap-sm">
                <div class="center gap-xs">
                  <span class="fs-sm text-muted-foreground">Disabled</span>
                  <ToggleSwitch v-model="isDisabled" />
                </div>
                <div class="center gap-xs">
                  <span class="fs-sm text-muted-foreground">Readonly</span>
                  <ToggleSwitch v-model="isReadonly" />
                </div>
                <div class="center gap-sm">
                  <Button
                    label="仅校验"
                    severity="secondary"
                    size="small"
                    :disabled="formState.submitting"
                    @click="onClickValidateOnly"
                  />
                  <Button
                    label="校验并提交"
                    size="small"
                    :loading="formState.submitting"
                    :disabled="isReadonly || isDisabled"
                    @click="onClickValidateAndSubmit"
                  />
                </div>
              </div>
            </div>

            <div class="surface-elevated px-md py-sm rounded-md layout-stack gap-scale-md">
              <div class="flex items-center gap-scale-md">
                <Icons
                  name="i-lucide-form-input"
                  size="xl"
                  class="text-accent!"
                />
                <div class="flex-col gap-xs">
                  <div class="fs-md font-semibold text-foreground">表单区域</div>
                  <div class="fs-sm text-muted-foreground">
                    组件覆盖：input / mask / textarea / select / multiselect / number / slider /
                    switch / checkbox / radio / date / rating / upload。
                  </div>
                </div>
              </div>

              <ProForm
                ref="formRef"
                :schema="schema"
                :initial-values="initialValues"
                :readonly="isReadonly"
                :disabled="isDisabled"
                @submit="onSubmit"
              >
                <template #footer="{ formState: slotFormState, submit }">
                  <div class="flex justify-end gap-scale-sm pt-padding-md">
                    <Button
                      label="提交（slot.submit）"
                      :loading="slotFormState.submitting"
                      :disabled="isReadonly || isDisabled"
                      @click="submit"
                    />
                  </div>
                </template>
              </ProForm>
            </div>

            <div
              class="xl:hidden surface-elevated px-md py-sm rounded-md layout-stack gap-scale-sm"
            >
              <div class="flex items-center gap-scale-md">
                <Icons
                  name="i-lucide-database"
                  size="xl"
                  class="text-accent!"
                />
                <div class="flex-col gap-xs">
                  <div class="fs-md font-semibold text-foreground">实时 Values（只读）</div>
                  <div class="fs-sm text-muted-foreground">
                    用于观察各字段的 model 序列化结果；提交时同样会把 values 输出到控制台。
                  </div>
                </div>
              </div>

              <div class="surface-sunken rounded-md p-padding-md">
                <pre class="m-0 whitespace-pre-wrap break-words fs-xs">{{ valuesJson }}</pre>
              </div>
            </div>
          </div>
        </CScrollbar>
        <div
          class="hidden xl:block w-30% layout-stack pl-0"
          :style="{ height: `${containerHeight}px` }"
        >
          <div class="layout-full surface-elevated rounded-md layout-stack fs-xs">
            <CScrollbar>
              <pre>{{ valuesJson }}</pre>
            </CScrollbar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
