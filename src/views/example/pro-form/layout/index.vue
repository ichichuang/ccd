<script setup lang="ts">
defineOptions({ name: 'ExampleProFormLayoutPage' })

import type { FormSchema, FormState } from '@/components/ProForm'
import { useAppElementSize } from '@/hooks/modules/useAppElementSize'

type ProFormExpose = {
  submit: () => Promise<void>
  validate: () => Promise<boolean>
  getValues: () => Record<string, unknown>
  getFormState: () => FormState<Record<string, unknown>>
}

const containerRef = ref<HTMLDivElement | null>(null)
const { height: containerHeight } = useAppElementSize(containerRef)

// 排版控制状态
const layoutMode = ref<'horizontal' | 'vertical'>('horizontal')
const labelAlign = ref<'left' | 'right'>('right')

// 选项配置
const layoutOptions = [
  { label: '水平 (Horizontal)', value: 'horizontal' },
  { label: '垂直 (Vertical)', value: 'vertical' },
]

const alignOptions = [
  { label: '居左', value: 'left' },
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

// === 自定义拖拽缩放逻辑 ===
const resizableRef = ref<HTMLDivElement | null>(null)
const resizableWidth = ref<number | null>(null)
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
    // 限制最小宽度 320px
    resizableWidth.value = Math.max(320, initialWidth + deltaX)
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
    class="h-full flex flex-col overflow-hidden"
    data-archetype="playground-single-panel"
  >
    <div
      class="shrink-0 px-padding-lg py-padding-md bg-accent/20 dark:bg-accent/12 border-b-default border-accent"
    >
      <div class="gap-scale-xs">
        <div class="fs-xl font-semibold text-foreground">ProForm 响应式与排版引擎</div>
        <div class="fs-sm text-muted-foreground">
          演示动态控制表单 Layout，以及
          <span class="text-primary font-bold">无 CSS 媒体查询的纯容器级自适应栅格</span>
          ，并演示具名插槽覆盖渲染。
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
            <div
              class="sticky top-0 z-1 surface-elevated px-md py-sm rounded-md gap-scale-md flex justify-between flex-wrap"
            >
              <div class="center gap-md">
                <Icons
                  name="i-lucide-layout-template"
                  size="xl"
                  class="text-accent!"
                />
                <div class="flex-col gap-xs">
                  <div class="font-semibold">排版控制台</div>
                  <div class="fs-xs text-muted-foreground">切换布局模式与标签对齐。</div>
                </div>
              </div>

              <div class="flex items-center gap-md flex-wrap">
                <div class="center gap-xs">
                  <span class="fs-sm text-muted-foreground">Layout:</span>
                  <SelectButton
                    v-model="layoutMode"
                    :options="layoutOptions"
                    option-label="label"
                    option-value="value"
                  />
                </div>
                <div class="center gap-xs">
                  <span class="fs-sm text-muted-foreground">Align:</span>
                  <SelectButton
                    v-model="labelAlign"
                    :options="alignOptions"
                    option-label="label"
                    option-value="value"
                    :disabled="layoutMode === 'vertical'"
                  />
                </div>
                <Button
                  label="校验并提交"
                  size="small"
                  :loading="formState.submitting"
                  @click="onClickSubmit"
                />
              </div>
            </div>

            <div class="surface-elevated px-md py-sm rounded-md layout-stack gap-scale-md">
              <div class="flex items-center gap-scale-md">
                <Icons
                  name="i-lucide-move-horizontal"
                  size="xl"
                  class="text-primary!"
                />
                <div class="flex-col gap-xs">
                  <div class="fs-md font-semibold text-foreground">容器级响应式测试区</div>
                  <div class="fs-sm text-muted-foreground">
                    拖拽下方虚线框的右下角改变容器宽度，观察表单如何根据容器宽度丝滑变阵
                    (xs/md/lg)。
                  </div>
                </div>
              </div>

              <div
                ref="resizableRef"
                class="relative overflow-hidden border-default border-dashed p-padding-lg rounded-scale-lg surface-elevated transition-colors"
                :style="{
                  width: resizableWidth ? `${resizableWidth}px` : '100%',
                  minWidth: '320px',
                  maxWidth: '100%',
                }"
              >
                <div
                  class="absolute top-0 right-0 h-full w-[var(--spacing-xs)] cursor-col-resize hover:bg-primary/50 active:bg-primary transition-colors z-10"
                  title="拖拽改变宽度"
                  @mousedown.prevent="startResize"
                ></div>

                <div
                  class="absolute top-0 right-3 bg-primary text-primary-foreground fs-xs px-padding-xs py-padding-xs rounded-b-md opacity-50 pointer-events-none transition-opacity"
                  :class="{ 'opacity-100': isResizing }"
                >
                  ← 拖拽右侧边缘改变容器宽度
                </div>

                <ProForm
                  ref="formRef"
                  :schema="schema"
                  :initial-values="initialValues"
                  :layout="layoutMode"
                  :label-align="labelAlign"
                  label-width="120px"
                  @submit="onSubmit"
                >
                  <template #field-customField="{ state, onUpdate }">
                    <div
                      class="flex items-center gap-scale-sm w-full p-padding-xs border-default border-dashed rounded-scale-md bg-accent/5"
                    >
                      <Icons
                        name="i-lucide-sparkles"
                        class="text-accent"
                      />
                      <InputText
                        :model-value="state.value as string"
                        class="flex-1"
                        placeholder="从插槽注入..."
                        @update:model-value="onUpdate"
                      />
                      <Button
                        severity="success"
                        text
                        @click="onUpdate((state.value as string) + ' √')"
                      >
                        <template #default>
                          <Icons
                            name="i-lucide-check"
                            size="sm"
                          />
                        </template>
                      </Button>
                    </div>
                  </template>

                  <template #footer="{ submit, formState: slotState }">
                    <div class="flex justify-end gap-scale-sm pt-padding-md mt-padding-md">
                      <Button
                        label="保存配置 (Slot)"
                        :loading="slotState.submitting"
                        @click="submit"
                      />
                    </div>
                  </template>
                </ProForm>
              </div>
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
                  <div class="fs-md font-semibold text-foreground">实时 Values</div>
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
