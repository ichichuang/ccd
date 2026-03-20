<script setup lang="ts">
defineOptions({ name: 'ExampleProFormPluginsPage' })

import type { FormSchema, ProFormExpose, ProFormPlugin } from '@/components/ProForm'
import { ProFormPlugins } from '@/components/ProForm'
import type { FieldRegistryItem } from '@/components/ProForm/engine/types'
import ColorPickerFieldAdapter from './components/ColorPickerFieldAdapter'
import MyColorCustomInput from './components/MyColorCustomInput'

/**
 * 1) 虚拟插件：注册自定义字段类型 'color-picker'
 *
 * 约束：
 * - ProForm 字段注册要求 `component` 的类型为 `Component<FieldComponentProps<T>>`
 * - 此处严格禁止 `as never` / `as any`，因此用一个适配组件将 emits 模式适配为标准 props 模式
 */
const colorPickerRegistryItem = {
  component: ColorPickerFieldAdapter,
} satisfies FieldRegistryItem

const demoColorPickerPlugin = {
  name: 'demo-color-picker',
  install(ctx) {
    ctx.registerField('color-picker', colorPickerRegistryItem)
  },
} satisfies ProFormPlugin

ProFormPlugins.use(demoColorPickerPlugin)

// ── 3. Schema：含 myColor（slot 渲染）、favoriteColor（插件 color-picker）──
const schema = reactive<FormSchema>({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      name: 'title',
      component: 'input',
      label: '标题',
      props: { placeholder: '表单标题' },
    },
    {
      name: 'myColor',
      component: 'input',
      label: '我的颜色 (useField 演示)',
      description: '由 #field-myColor 插槽渲染，内部使用 useField("myColor")。',
      props: { placeholder: '由自定义组件接管' },
    },
    {
      name: 'favoriteColor',
      component: 'color-picker',
      label: '主题色 (插件 color-picker)',
      description: '由插件注册的 color-picker 类型渲染。',
      defaultValue: '#3b82f6',
      props: {},
    },
  ],
})

const formRef = ref<ProFormExpose | null>(null)
const formState = computed(
  () => formRef.value?.getFormState() ?? { values: {} as Record<string, unknown> }
)

async function onSubmit(values: Record<string, unknown>): Promise<void> {
  console.log('Plugins form submit:', values)
  window.$toast?.successIn('top-right', '提交成功', '已在控制台输出 values')
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
            name="i-lucide-puzzle"
            class="text-primary text-2xl"
          />
        </div>
        <div class="col-stack-xs">
          <h1 class="text-2xl font-bold text-foreground m-0">ProForm 插件与底层 Hooks</h1>
          <p class="text-muted-foreground text-sm m-0">
            演示无头插件系统 (ProFormPlugins.use) 与 useField()
            组合用法；自定义字段类型注册与双向绑定。
          </p>
        </div>
      </div>
    </header>

    <!-- Scrollable content -->
    <CScrollbar class="flex-1 min-h-0">
      <div class="layout-full min-h-0 pt-md pb-xl">
        <div class="row-start items-start gap-lg layout-full min-h-0">
          <!-- Plugin Showcase (Left) -->
          <div class="flex-1 min-w-0 h-full col-stack-md">
            <div
              class="bg-card rounded-md shadow-sm dark:shadow-md py-md px-lg flex flex-col gap-lg"
            >
              <div class="row-y-center gap-sm border-b-default pb-sm mb-padding-sm">
                <Icons
                  name="i-lucide-box"
                  class="text-primary"
                />
                <span class="font-semibold text-foreground uppercase tracking-wider">
                  插件与扩展演示 / Plugin Showcase
                </span>
              </div>

              <div class="col-stack-md">
                <ProForm
                  ref="formRef"
                  :schema="schema"
                  :initial-values="{ title: '', myColor: '', favoriteColor: '#3b82f6' }"
                  @submit="onSubmit"
                >
                  <template #field-myColor>
                    <MyColorCustomInput />
                  </template>
                  <template #footer="{ submit, formState: slotFormState }">
                    <div
                      class="row-end gap-sm pt-md border-t-default border-border/15 mt-padding-md"
                    >
                      <Button
                        label="提交数据"
                        icon="i-lucide-send"
                        :loading="slotFormState.submitting"
                        @click="submit"
                      />
                    </div>
                  </template>
                </ProForm>
              </div>
            </div>
          </div>

          <!-- Right Column (JSON) -->
          <div class="layout-sidepanel shrink-0 h-full">
            <div class="sticky top-4">
              <div
                class="bg-card rounded-md shadow-sm dark:shadow-md py-md px-lg flex flex-col gap-lg"
              >
                <div class="row-y-center gap-sm mb-padding-sm">
                  <Icons
                    name="i-lucide-database"
                    class="text-primary"
                  />
                  <span class="text-sm font-semibold text-foreground uppercase tracking-wider">
                    实时表单数据 (JSON)
                  </span>
                </div>
                <div
                  class="bg-muted rounded-md p-md border-default border-border/40 text-muted-foreground"
                >
                  <pre class="m-0 whitespace-pre-wrap break-words text-xs font-mono">{{
                    JSON.stringify(formState.values, null, 2)
                  }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CScrollbar>
  </div>
</template>
