<script setup lang="tsx">
defineOptions({ name: 'ExampleProFormLayoutPage' })

import type { PropType, VNode } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import type { FormSchema, FormState, ProFormExpose } from '@/components/ProForm'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Icons from '@/components/Icons/Icons.vue'

/** 插槽内使用的自定义字段组件：提供 stringValue 可写计算属性，消除模板中的类型断言 */
const CustomFieldSlotContent = defineComponent({
  name: 'CustomFieldSlotContent',
  props: {
    state: { type: Object as PropType<{ value: unknown }>, required: true },
    onUpdate: { type: Function as PropType<(v: unknown) => void>, required: true },
  },
  setup(props) {
    const stringValue = computed<string>({
      get: () => (props.state?.value as string) ?? '',
      set: (val: string) => props.onUpdate(val),
    })
    return { stringValue }
  },
  render(): VNode {
    const value = this.stringValue as string
    const onUpdate = this.onUpdate as (v: unknown) => void

    return (
      <div class="row-y-center gap-sm w-full p-xs border-dashed rounded-md bg-accent/5">
        <Icons
          name="i-lucide-sparkles"
          class="text-accent"
        />
        <InputText
          modelValue={value}
          class="flex-1"
          placeholder="从插槽注入..."
          {...{
            'onUpdate:modelValue': (v?: string) => onUpdate(v ?? ''),
          }}
        />
        <Button
          severity="success"
          text
          onClick={() => onUpdate(value + ' √')}
        >
          <Icons
            name="i-lucide-check"
            size="sm"
          />
        </Button>
      </div>
    )
  },
})

// 排版控制状态
const layoutMode = ref<'horizontal' | 'vertical'>('horizontal')
const labelAlign = ref<'left' | 'center' | 'right'>('right')

// 选项配置
const layoutOptions = [
  { label: '水平 (Horizontal)', value: 'horizontal' },
  { label: '垂直 (Vertical)', value: 'vertical' },
]

const alignOptions = [
  { label: '居左', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '居右', value: 'right' },
]

// 包含响应式栅格的 Schema
const schema = reactive<FormSchema>({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      type: 'card',
      name: 'responsive_group',
      label: '自适应与排版展示',
      layout: { type: 'grid', gap: 'var(--spacing-md)', span: 12 },
      children: [
        {
          name: 'username',
          component: 'input',
          label: '用户姓名',
          span: { xs: 12, sm: 6, lg: 4 },
          props: { placeholder: '请输入姓名' },
          // 修复点 1：补齐 validator 函数，防止引擎崩溃
          rules: [
            {
              message: '姓名为必填项',
              validator: v => typeof v === 'string' && v.trim().length > 0,
            },
          ],
        },
        {
          name: 'department',
          component: 'select',
          label: '所属部门',
          span: { xs: 12, sm: 6, lg: 4 },
          props: {
            options: [
              { label: '研发部', value: 'rd' },
              { label: '设计部', value: 'design' },
              { label: '市场部', value: 'marketing' },
            ],
            placeholder: '请选择部门',
          },
        },
        {
          name: 'salary',
          component: 'number',
          label: '期望薪资',
          span: { xs: 12, sm: 12, lg: 4 },
          props: { mode: 'currency', currency: 'CNY', locale: 'zh-CN' },
        },
        {
          name: 'customField',
          component: 'input',
          label: '具名插槽覆盖',
          span: 12,
          description: '这个字段由外部插槽渲染，但完美继承了尺寸和表单引擎状态。',
        },
        {
          name: 'bio',
          component: 'textarea',
          label: '个人简介',
          span: 12,
          props: { rows: 3, placeholder: '聊聊你自己...' },
        },
      ],
    },
  ],
})

const initialValues = reactive<Record<string, unknown>>({
  username: '架构师',
  department: 'rd',
  customField: '我是被插槽接管的值',
})

type ProFormInstance = ComponentPublicInstance<ProFormExpose<Record<string, unknown>>>
const formRef = ref<ProFormInstance | null>(null)

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

// === 自定义拖拽缩放逻辑 ===
const resizableRef = ref<HTMLDivElement | null>(null)
const resizableWidthUnits = ref<number | null>(null)
const isResizing = ref(false)

const startResize = (e: MouseEvent): void => {
  isResizing.value = true
  const startX = e.clientX
  const initialWidth = resizableRef.value?.offsetWidth ?? 0

  // 拖拽时禁用文本选中，提升体验
  document.body.style.userSelect = 'none'

  const onMouseMove = (moveEvent: MouseEvent): void => {
    if (!isResizing.value) return
    const deltaX = moveEvent.clientX - startX
    // 使用 spacing-md (16px) 作为拖拽宽度的语义基准单位，避免直接在样式中出现 px
    const spacingUnitPx = 16
    const initialUnits = initialWidth / spacingUnitPx
    // ARCHITECTURE EXCEPTION: Drag boundary expressed in semantic units (~320px when spacingUnitPx=16)
    const minWidthUnits = 20
    resizableWidthUnits.value = Math.max(minWidthUnits, initialUnits + deltaX / spacingUnitPx)
  }

  const onMouseUp = (): void => {
    isResizing.value = false
    document.body.style.userSelect = ''
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

onBeforeUnmount(() => {
  // 兜底清理
  document.body.style.userSelect = ''
})

async function onSubmit(values: Record<string, unknown>): Promise<void> {
  console.log('ProForm Layout Submit Values:', values)
  window.$toast?.successIn('top-right', '提交成功', '已在控制台输出序列化后的 values')
}

async function onClickSubmit(): Promise<void> {
  await formRef.value?.submit()
}
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="col-fill"
  >
    <!-- Toolbar: Hero Header (Transparent Root Policy: Inherit canvas) -->
    <header class="shrink-0 border-b-default border-primary/20">
      <div class="w-full px-md md:px-lg py-sm row-y-center gap-md">
        <div class="p-md bg-primary/10 rounded-lg shrink-0">
          <Icons
            name="i-lucide-layout-template"
            class="text-primary text-2xl"
          />
        </div>
        <div class="col-stack-xs">
          <h1 class="text-2xl font-bold text-foreground m-0">ProForm 响应式与排版引擎</h1>
          <p class="text-muted text-sm m-0">
            演示动态控制表单 Layout，以及
            <span class="text-primary font-bold">容器级自适应栅格</span>
            (无 CSS 媒体查询)，并演示具名插槽覆盖渲染。
          </p>
        </div>
      </div>
    </header>

    <!-- Content: split layout (form + JSON preview) -->
    <div class="flex-1 min-h-0">
      <div class="row-start items-start gap-lg layout-full min-h-0">
        <div class="flex-1 min-w-0 h-full">
          <CScrollbar class="layout-full">
            <div class="w-full p-md md:p-lg col-stack-xl pb-xl">
              <!-- 排版控制台 -->
              <div
                class="bg-card rounded-md shadow-soft py-md px-lg flex flex-col gap-lg sticky top-0 z-1 bg-background/80 backdrop-blur-md border-primary/20 shadow-sm!"
              >
                <div class="row-between gap-md flex-wrap">
                  <div class="center gap-md">
                    <Icons
                      name="i-lucide-settings-2"
                      size="xl"
                      class="text-accent"
                    />
                    <div class="col-stack-xs">
                      <div class="font-bold text-foreground uppercase tracking-tight">排版配置</div>
                      <div class="text-xs text-muted-foreground">实时切换布局模式与对齐方式。</div>
                    </div>
                  </div>

                  <div class="row-y-center gap-md flex-wrap">
                    <div class="center gap-xs">
                      <span class="text-xs font-bold text-muted uppercase">Layout</span>
                      <SelectButton
                        v-model="layoutMode"
                        :options="layoutOptions"
                        option-label="label"
                        option-value="value"
                        class="scale-90"
                      />
                    </div>
                    <div class="center gap-xs">
                      <span class="text-xs font-bold text-muted uppercase">Align</span>
                      <SelectButton
                        v-model="labelAlign"
                        :options="alignOptions"
                        option-label="label"
                        option-value="value"
                        :disabled="layoutMode === 'vertical'"
                        class="scale-90"
                      />
                    </div>
                    <Button
                      label="提交验证"
                      icon="i-lucide-send"
                      size="small"
                      :loading="formState.submitting"
                      @click="onClickSubmit"
                    />
                  </div>
                </div>
              </div>

              <!-- 容器级响应式测试区 -->
              <div class="bg-card rounded-md shadow-soft py-md px-lg flex flex-col gap-lg">
                <div class="row-y-center gap-sm border-b-default pb-sm mb-padding-sm">
                  <Icons
                    name="i-lucide-move-horizontal"
                    class="text-primary"
                  />
                  <div class="col-stack-xs">
                    <span class="text-md font-semibold text-foreground uppercase tracking-tight">
                      容器级响应式观测
                    </span>
                    <span class="text-xs text-muted-foreground italic">
                      拖拽右侧边缘改变容器宽度，观察表单如何根据容器尺寸丝滑变阵 (xs/md/lg)。
                    </span>
                  </div>
                </div>

                <div
                  ref="resizableRef"
                  class="relative overflow-hidden border-default border-dashed border-primary/30 p-lg rounded-lg surface-sunken transition-colors"
                  :style="{
                    width: resizableWidthUnits
                      ? `calc(var(--spacing-md) * ${resizableWidthUnits})`
                      : '100%',
                    minWidth: '20%',
                    maxWidth: '100%',
                  }"
                >
                  <div
                    class="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-primary/40 active:bg-primary transition-all z-10 group"
                    @mousedown.prevent="startResize"
                  >
                    <div
                      class="absolute inset-y-0 left-1/2 -ml-px w-px bg-primary/20 group-hover:bg-primary/50"
                    ></div>
                  </div>

                  <div
                    class="absolute top-0 right-4 bg-primary/80 text-primary-foreground text-xs px-xs py-1 rounded-b-md opacity-0 pointer-events-none transition-opacity backdrop-blur-sm"
                    :class="{ 'opacity-100': isResizing }"
                  >
                    <Icons
                      name="i-lucide-arrow-left-right"
                      size="xs"
                      class="mr-1"
                    />
                    RESZING...
                  </div>

                  <ProForm
                    ref="formRef"
                    :schema="schema"
                    :initial-values="initialValues"
                    :layout="layoutMode"
                    :label-align="labelAlign"
                    :label-width="'15%'"
                    @submit="onSubmit"
                  >
                    <!-- 插槽签名：{ state, onUpdate } — 重命名避免与上层变量冲突 -->
                    <template #field-customField="{ state: fieldState, onUpdate: onFieldUpdate }">
                      <CustomFieldSlotContent
                        :state="fieldState"
                        :on-update="onFieldUpdate"
                      />
                    </template>

                    <template #footer="{ submit, formState: slotState }">
                      <div
                        class="row-end gap-sm mt-padding-md border-t-default border-border/15 pt-md"
                      >
                        <Button
                          label="保存配置"
                          icon="i-lucide-check-check"
                          :loading="slotState.submitting"
                          @click="submit"
                        />
                      </div>
                    </template>
                  </ProForm>
                </div>
              </div>

              <!-- Mobile JSON preview -->
              <div
                class="bg-card rounded-md shadow-soft py-md px-lg flex flex-col gap-lg xl:hidden"
              >
                <div class="row-y-center gap-sm mb-padding-sm">
                  <Icons
                    name="i-lucide-braces"
                    class="text-primary"
                  />
                  <span class="text-sm font-semibold text-foreground uppercase">
                    Real-time values
                  </span>
                </div>
                <div
                  class="surface-sunken rounded-md p-md border-default border-border/40 text-muted-foreground"
                >
                  <pre class="m-0 whitespace-pre-wrap break-words text-xs">{{ valuesJson }}</pre>
                </div>
              </div>
            </div>
          </CScrollbar>
        </div>

        <!-- Desktop side panel -->
        <div
          class="hidden xl:block layout-sidepanel shrink-0 h-full border-l-default border-border/20"
        >
          <div class="layout-full layout-stack">
            <div class="shrink-0 px-md py-sm border-b-default border-border/20 row-y-center gap-sm">
              <Icons
                name="i-lucide-code-2"
                size="sm"
                class="text-accent"
              />
              <span class="text-xs font-bold text-muted uppercase tracking-widest">
                Calculated Result
              </span>
            </div>
            <CScrollbar class="flex-1 min-h-0 surface-sunken px-md py-sm">
              <pre class="m-0 text-xs text-muted-foreground font-mono leading-relaxed">{{
                valuesJson
              }}</pre>
            </CScrollbar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
