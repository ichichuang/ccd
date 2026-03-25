<script setup lang="ts">
defineOptions({ name: 'ExampleProFormPlaygroundPage' })

import type { FormSchema, FormState, ProFormExpose } from '@/components/ProForm'
import { goToRoute } from '@/router/utils/helper'

const quickLinks: { label: string; routeName: string; desc: string }[] = [
  {
    label: '基础字段',
    routeName: 'ExampleProFormBasic',
    desc: 'input/select/date/upload 等字段能力',
  },
  {
    label: '布局与栅格',
    routeName: 'ExampleProFormLayout',
    desc: 'layout/label/span 与插槽接管渲染',
  },
  {
    label: '容器与向导',
    routeName: 'ExampleProFormGroup',
    desc: 'card/collapse/tabs/step/group/section',
  },
  {
    label: '校验与触发',
    routeName: 'ExampleProFormValidation',
    desc: 'sync/async/resolver/validateOn',
  },
  {
    label: 'DAG 联动',
    routeName: 'ExampleProFormDag',
    desc: 'visibleIf/disabledIf/computed/requiredIf',
  },
  {
    label: '数组与草稿',
    routeName: 'ExampleProFormAdvanced',
    desc: 'useFieldArray + persistKey/autoSave',
  },
  { label: '插件扩展', routeName: 'ExampleProFormPlugins', desc: 'registerField + useField' },
  {
    label: 'API 与事件',
    routeName: 'ExampleProFormApiEvents',
    desc: 'expose API + submit/state 可观测',
  },
]

const schema = reactive<FormSchema>({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      name: 'scene',
      component: 'select',
      label: '演示场景',
      required: true,
      options: [
        { label: '用户表单', value: 'user' },
        { label: '订单表单', value: 'order' },
        { label: '系统配置', value: 'settings' },
      ],
      props: { placeholder: '请选择场景' },
      span: { xs: 12, sm: 6 },
    },
    {
      name: 'title',
      component: 'input',
      label: '标题',
      required: true,
      props: { placeholder: '输入标题...' },
      span: { xs: 12, sm: 6 },
    },
    {
      name: 'enableAudit',
      component: 'switch',
      label: '启用审计',
      defaultValue: true,
      span: { xs: 12, sm: 6 },
    },
    {
      name: 'auditDesc',
      component: 'textarea',
      label: '审计说明',
      deps: ['enableAudit'],
      visibleIf: ({ form }) => form['enableAudit'] === true,
      requiredIf: ({ form }) => form['enableAudit'] === true,
      span: { xs: 12, sm: 6 },
      props: { rows: 2, placeholder: '当启用审计时此项必填' },
    },
  ],
})

const formRef = ref<ProFormExpose | null>(null)
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

async function onSubmit(values: Record<string, unknown>): Promise<void> {
  console.log('ProForm Playground Submit:', values)
  window.$toast?.successIn('top-right', '提交成功', '已在控制台输出演示数据')
}

function jumpTo(routeName: string): void {
  goToRoute(routeName)
}
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="col-fill"
  >
    <header class="shrink-0 border-b-default border-border/20 px-md py-sm">
      <h1 class="text-lg text-foreground m-0">ProForm 全量能力总览</h1>
      <p class="text-sm text-muted-foreground m-0">
        这个页面提供能力地图与最小可运行示例，便于快速跳转到专题页深看。
      </p>
    </header>

    <CScrollbar class="col-fill">
      <div class="layout-container col-stretch gap-md py-md">
        <section class="material-elevated col-stretch gap-sm">
          <div class="text-sm text-foreground">能力矩阵（点击跳转）</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-sm">
            <Button
              v-for="item in quickLinks"
              :key="item.routeName"
              text
              class="row-between p-sm rounded-md bg-muted/50 interactive-item"
              @click="jumpTo(item.routeName)"
            >
              <span class="text-sm text-foreground">{{ item.label }}</span>
              <span class="text-xs text-muted-foreground">{{ item.desc }}</span>
            </Button>
          </div>
        </section>

        <section class="material-elevated col-stretch gap-sm">
          <div class="text-sm text-foreground">最小可运行示例（字段 + 联动 + 状态）</div>
          <ProForm
            ref="formRef"
            :schema="schema"
            @submit="onSubmit"
          />
        </section>

        <section class="material-elevated col-stretch gap-sm">
          <div class="text-sm text-foreground">状态观测</div>
          <pre class="text-xs text-muted-foreground m-0">{{ stateJson }}</pre>
        </section>
      </div>
    </CScrollbar>
  </div>
</template>
