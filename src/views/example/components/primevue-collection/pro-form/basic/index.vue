<script setup lang="ts">
defineOptions({ name: 'ExampleProFormBasicPage' })

import type { FormSchema, FormState, ProFormExpose } from '@/components/ProForm'

const isReadonly = ref<boolean>(false)
const isDisabled = ref<boolean>(false)
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

function onClickResetAll(): void {
  formRef.value?.form?.reset()
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
    data-archetype="A1-toolbar-content"
    class="flex flex-col"
  >
    <!-- Toolbar: Hero Header (Transparent Root Policy: Inherit canvas) -->
    <header class="shrink-0 border-primary/20">
      <div class="layout-container py-sm row-center gap-md">
        <div class="p-md bg-primary/10 rounded-lg shrink-0">
          <Icons
            name="i-lucide-form-input"
            class="text-primary text-2xl"
          />
        </div>
        <div class="col-stretch gap-xs">
          <h1 class="text-2xl font-bold text-foreground m-0">ProForm 基础组件与状态联动</h1>
          <p class="text-muted-foreground text-sm m-0">
            展示 ProForm 引擎已注册的全部基础字段，并演示全局 readonly / disabled 联动、校验与提交。
          </p>
        </div>
      </div>
    </header>
    <div class="shrink-0 px-md py-xs text-xs text-muted-foreground border-border/15">
      覆盖能力：全部内置字段、全局 readonly/disabled、提交与校验、实时状态观测。
    </div>

    <!-- Content: split layout (form + JSON preview) -->
    <div class="flex-1 min-h-0">
      <div class="row-start items-start gap-lg layout-full min-h-0">
        <div class="flex-1 min-w-0 h-full">
          <CScrollbar class="layout-full">
            <div class="layout-container py-md col-stretch gap-xl">
              <!-- 吸附到顶部的控制面板 -->
              <div
                class="material-elevated col-stretch gap-lg sticky top-0 z-layout bg-muted/80 backdrop-blur-md border-primary/20"
              >
                <div class="row-between gap-md flex-wrap">
                  <div class="row-center gap-md">
                    <Icons
                      name="i-lucide-sliders-horizontal"
                      size="xl"
                      class="text-accent!"
                    />
                    <div class="col-stretch gap-xs">
                      <div class="font-semibold text-foreground">全局状态控制</div>
                      <div class="text-xs text-muted-foreground">
                        验证 readonly / disabled 对所有字段的影响。
                      </div>
                    </div>
                  </div>

                  <div class="row-center gap-sm flex-wrap">
                    <div class="row-center gap-xs">
                      <span class="text-sm text-muted-foreground">Disabled</span>
                      <ToggleSwitch v-model="isDisabled" />
                    </div>
                    <div class="row-center gap-xs pr-md border-r-default border-border/40">
                      <span class="text-sm text-muted-foreground">Readonly</span>
                      <ToggleSwitch v-model="isReadonly" />
                    </div>
                    <div class="row-center gap-sm flex-wrap">
                      <Button
                        label="重置"
                        severity="secondary"
                        variant="text"
                        size="small"
                        :disabled="formState.submitting"
                        @click="onClickResetAll"
                      />
                      <Button
                        label="仅校验"
                        severity="secondary"
                        variant="text"
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
              </div>

              <!-- 表单区域 -->
              <section class="material-elevated col-stretch gap-lg">
                <div class="row-center gap-sm pb-sm mb-sm">
                  <Icons
                    name="i-lucide-form-input"
                    class="text-primary"
                  />
                  <div class="col-stretch gap-xs">
                    <span class="text-md font-semibold text-foreground uppercase tracking-tight">
                      表单配置与渲染
                    </span>
                    <span class="text-xs text-muted-foreground">
                      组件：input / mask / textarea / select / multiselect / number / slider /
                      switch / checkbox / radio / date / rating / upload。
                    </span>
                  </div>
                </div>

                <ProForm
                  ref="formRef"
                  :schema="schema"
                  :initial-values="initialValues"
                  :gap="'var(--spacing-lg)'"
                  :readonly="isReadonly"
                  :disabled="isDisabled"
                  @submit="onSubmit"
                >
                  <template #footer="{ formState: slotFormState, submit }">
                    <div class="row-end gap-sm pt-md border-t-default border-border/15 mt-md">
                      <Button
                        label="立即提交"
                        icon="i-lucide-send"
                        :loading="slotFormState.submitting"
                        :disabled="isReadonly || isDisabled"
                        @click="submit"
                      />
                    </div>
                  </template>
                </ProForm>
              </section>

              <!-- Mobile JSON preview -->
              <section class="material-elevated col-stretch gap-lg xl:hidden">
                <div class="row-center gap-sm mb-sm">
                  <Icons
                    name="i-lucide-database"
                    class="text-primary"
                  />
                  <span class="text-sm font-semibold text-foreground uppercase">实时 Values</span>
                </div>
                <div class="bg-muted rounded-md p-md border-default border-border/40">
                  <pre class="code-preview text-muted-foreground">{{ valuesJson }}</pre>
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
                Real-time Form State
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
