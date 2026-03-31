<script setup lang="ts">
defineOptions({ name: 'ExampleProFormApiEventsPage' })

import type { FormSchema, FormState, ProFormExpose } from '@/components/ProForm'

const formRef = ref<ProFormExpose | null>(null)
const eventLogs = ref<string[]>([])
const validateOn = ref<'change' | 'blur' | 'submit'>('blur')
const dynamicDisabled = ref<boolean>(false)

const schema = reactive<FormSchema>({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      name: 'username',
      component: 'input',
      label: '用户名',
      required: true,
      props: { placeholder: '请输入用户名' },
      span: { xs: 12, sm: 6 },
    },
    {
      name: 'role',
      component: 'select',
      label: '角色',
      required: true,
      options: [
        { label: '管理员', value: 'admin' },
        { label: '编辑', value: 'editor' },
        { label: '访客', value: 'viewer' },
      ],
      props: { placeholder: '请选择角色' },
      span: { xs: 12, sm: 6 },
    },
    {
      name: 'targetField',
      component: 'input',
      label: '目标字段（setFieldProps）',
      props: { placeholder: '可被动态禁用与改写 placeholder' },
      span: 12,
    },
  ],
})

const state = computed<FormState<Record<string, unknown>>>(() => {
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

const stateJson = computed<string>(() => JSON.stringify(state.value, null, 2))

function addLog(message: string): void {
  eventLogs.value.unshift(`#${eventLogs.value.length + 1} ${message}`)
}

async function onSubmit(values: Record<string, unknown>): Promise<void> {
  addLog(`submit: ${JSON.stringify(values)}`)
  window.$toast?.successIn('top-right', '提交成功', '已记录到事件日志')
}

async function onClickValidate(): Promise<void> {
  const ok = await (formRef.value?.validate() ?? Promise.resolve(false))
  addLog(`validate: ${ok ? 'pass' : 'fail'}`)
}

function onClickGetValues(): void {
  const values = formRef.value?.getValues() ?? {}
  addLog(`getValues: ${JSON.stringify(values)}`)
}

function onClickSetFieldsValue(): void {
  formRef.value?.form.setFieldsValue({
    username: 'demo_user',
    role: 'editor',
  })
  addLog('setFieldsValue: username/demo_user role/editor')
}

function onClickSetValue(): void {
  formRef.value?.form.setValue('username', 'single_update')
  addLog('setValue: username/single_update')
}

function onClickResetFields(): void {
  formRef.value?.form.resetFields(['username'])
  addLog('resetFields: username')
}

function onClickClearValidate(): void {
  formRef.value?.form.clearValidate()
  addLog('clearValidate')
}

function onClickToggleValidateOn(): void {
  const next =
    validateOn.value === 'blur' ? 'change' : validateOn.value === 'change' ? 'submit' : 'blur'
  validateOn.value = next
  formRef.value?.form.setValidateOn(next)
  addLog(`setValidateOn: ${next}`)
}

function onClickToggleFieldProps(): void {
  dynamicDisabled.value = !dynamicDisabled.value
  formRef.value?.form.setFieldProps('targetField', {
    disabled: dynamicDisabled.value,
    placeholder: dynamicDisabled.value ? '当前已禁用' : '重新启用，可编辑',
  })
  addLog(`setFieldProps: targetField disabled=${String(dynamicDisabled.value)}`)
}

function onClickReset(): void {
  formRef.value?.form.reset()
  addLog('reset all')
}
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="flex flex-col"
  >
    <header class="shrink-0 border-border/20 px-md py-sm">
      <h1 class="text-lg text-foreground m-0">ProForm API 与事件观测</h1>
      <p class="text-sm text-muted-foreground m-0">
        演示 expose
        API：validate/getValues/setValue/setFieldProps/resetFields/clearValidate/setValidateOn。
      </p>
    </header>

    <CScrollbar class="col-fill">
      <div class="layout-container col-stretch gap-md py-md">
        <section class="material-elevated col-stretch gap-sm">
          <div class="row-start gap-sm flex-wrap">
            <Button
              label="validate"
              size="small"
              text
              @click="onClickValidate"
            />
            <Button
              label="getValues"
              size="small"
              text
              @click="onClickGetValues"
            />
            <Button
              label="setFieldsValue"
              size="small"
              text
              @click="onClickSetFieldsValue"
            />
            <Button
              label="setValue"
              size="small"
              text
              @click="onClickSetValue"
            />
            <Button
              label="resetFields"
              size="small"
              text
              @click="onClickResetFields"
            />
            <Button
              label="clearValidate"
              size="small"
              text
              @click="onClickClearValidate"
            />
            <Button
              label="setValidateOn"
              size="small"
              text
              @click="onClickToggleValidateOn"
            />
            <Button
              label="setFieldProps"
              size="small"
              text
              @click="onClickToggleFieldProps"
            />
            <Button
              label="reset"
              size="small"
              text
              @click="onClickReset"
            />
          </div>

          <ProForm
            ref="formRef"
            :schema="schema"
            :validate-on="validateOn"
            @submit="onSubmit"
          />
        </section>

        <section class="material-elevated col-stretch gap-sm">
          <div class="text-sm text-foreground">FormState</div>
          <pre class="text-xs text-muted-foreground m-0">{{ stateJson }}</pre>
        </section>

        <section class="material-elevated col-stretch gap-sm">
          <div class="text-sm text-foreground">Event Logs</div>
          <div class="col-stretch gap-xs">
            <div
              v-for="item in eventLogs"
              :key="item"
              class="text-xs text-muted-foreground"
            >
              {{ item }}
            </div>
            <div
              v-if="eventLogs.length === 0"
              class="text-xs text-muted-foreground"
            >
              暂无事件，点击上方按钮开始观测。
            </div>
          </div>
        </section>
      </div>
    </CScrollbar>
  </div>
</template>
