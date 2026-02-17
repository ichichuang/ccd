<script setup lang="ts">
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primevue'
import { ref, computed, watch } from 'vue'
import { SchemaForm } from '@/components/SchemaForm'
import { basicSchema } from './schemas/basicSchema'
import { sectionsSchema } from './schemas/sectionsSchema'
import { stepsSchema } from './schemas/stepsSchema'
import { validationSchema } from './schemas/validationSchema'
import { dynamicSchema } from './schemas/dynamicSchema'
import { customSchema } from './schemas/customSchema.tsx'
import { advancedSchema } from './schemas/advancedSchema'
import { layoutStyleSchema } from './schemas/layoutStyleSchema'
import FormActions from './components/FormActions.vue'
import GlobalControls from './components/GlobalControls.vue'
import HeadlessTab from './components/HeadlessTab.vue'
import type { FormValues, LayoutConfig, StyleConfig } from '@/components/SchemaForm'

const formRef = ref()
const activeTab = ref<string | number>('basic')
const formValues = ref<FormValues>({})

// Global Controls State
const globalDisabled = ref(false)
const globalPreview = ref(false)
const globalTTL = ref(60000)

// 布局与样式 Tab：全局覆盖（仅在该 tab 生效）
const layoutOverrides = ref<Partial<LayoutConfig>>({})
const styleOverrides = ref<Partial<StyleConfig>>({})

const mergedLayoutStyleSchema = computed(() => {
  const layoutFiltered = Object.fromEntries(
    Object.entries(layoutOverrides.value).filter(([, v]) => v !== undefined && v !== null)
  ) as Partial<LayoutConfig>
  const styleFiltered = Object.fromEntries(
    Object.entries(styleOverrides.value || {}).filter(([, v]) => v !== undefined && v !== null)
  ) as Partial<StyleConfig>
  return {
    ...layoutStyleSchema,
    layout: { ...layoutStyleSchema.layout, ...layoutFiltered },
    style: { ...layoutStyleSchema.style, ...styleFiltered },
  }
})

// Current Schema
const currentSchema = computed(() => {
  const tab = String(activeTab.value)
  switch (tab) {
    case 'basic':
      return basicSchema
    case 'sections':
      return sectionsSchema
    case 'steps':
      return stepsSchema
    case 'validation':
      return validationSchema
    case 'dynamic':
      return dynamicSchema
    case 'custom':
      return customSchema
    case 'advanced':
      return advancedSchema
    case 'layoutStyle':
      return mergedLayoutStyleSchema.value
    default:
      return basicSchema
  }
})

const isAdvanced = computed(() => String(activeTab.value) === 'advanced')
const isHeadless = computed(() => String(activeTab.value) === 'headless')
const isLayoutStyle = computed(() => String(activeTab.value) === 'layoutStyle')

// 布局与样式：labelAlign 与 Select 绑定需为 string，避免 undefined 类型错误
const labelAlignModel = computed({
  get: (): string => layoutOverrides.value.labelAlign ?? '',
  set: (v: string) => {
    layoutOverrides.value = {
      ...layoutOverrides.value,
      labelAlign: v === 'left' || v === 'right' || v === 'top' ? v : undefined,
    }
  },
})

// 布局与样式：标签文字对齐（左/中/右）→ styleOverrides.labelStyle.textAlign（与 Select 绑定需为 string）
const labelTextAlign = computed({
  get: (): string => styleOverrides.value.labelStyle?.textAlign ?? '',
  set: (v: string) => {
    styleOverrides.value = {
      ...styleOverrides.value,
      labelStyle:
        v && v !== 'inherit' ? { textAlign: v as 'left' | 'center' | 'right' } : undefined,
    }
  },
})

// 布局与样式：showLabel 开关（未覆盖时继承 schema 的 true）
const showLabelSwitch = computed({
  get: () => layoutOverrides.value.showLabel ?? true,
  set: (v: boolean) => {
    layoutOverrides.value = { ...layoutOverrides.value, showLabel: v }
  },
})

// 布局与样式：labelWidth 与 InputText 绑定需为 string，避免 string|number 类型错误
const labelWidthModel = ref<string>('')
watch(
  () => layoutOverrides.value.labelWidth,
  v => {
    labelWidthModel.value = v === undefined || v === null ? '' : String(v)
  },
  { immediate: true }
)
watch(labelWidthModel, val => {
  const trimmed = val.trim()
  layoutOverrides.value = {
    ...layoutOverrides.value,
    labelWidth: trimmed === '' ? undefined : (trimmed as string | number),
  }
})

// Reset values when switching tabs
watch(activeTab, () => {
  formValues.value = {}
})

function triggerSubmit() {
  formRef.value?.submit()
}

function handleSubmit(values: FormValues) {
  console.log('Submitted:', values)
  window.$message?.success('表单已提交！')
}

function handleReset() {
  formRef.value?.reset()
}

function handleClear() {
  formRef.value?.clear()
}
</script>
<template>
  <div class="h-full flex flex-col min-h-0">
    <Tabs
      v-model:value="activeTab"
      class="flex-1 min-h-0 flex flex-col"
    >
      <div class="shrink-0 flex justify-between items-center border-b-default pr-md">
        <TabList class="border-0!">
          <Tab value="basic">基础 (Basic)</Tab>
          <Tab value="sections">分组 (Sections)</Tab>
          <Tab value="steps">分步 (Steps)</Tab>
          <Tab value="validation">校验 (Validation)</Tab>
          <Tab value="dynamic">动态 (Dynamic)</Tab>
          <Tab value="custom">自定义 (Custom)</Tab>
          <Tab value="advanced">高级 (Advanced)</Tab>
          <Tab value="layoutStyle">布局与样式 (Layout & Style)</Tab>
          <Tab value="headless">无头模式 (Hook)</Tab>
        </TabList>
      </div>

      <TabPanels class="flex-1 min-h-0 flex flex-col overflow-hidden p-0">
        <TabPanel
          :value="activeTab"
          class="flex-1 min-h-0 flex flex-col p-padding-md"
        >
          <!-- Special Case for Headless Tab -->
          <template v-if="isHeadless">
            <HeadlessTab />
          </template>

          <template v-else>
            <!-- Global Controls for Standard Tabs -->
            <GlobalControls
              v-model:disabled="globalDisabled"
              v-model:preview="globalPreview"
              v-model:options-cache-t-t-l="globalTTL"
            />

            <!-- 布局与样式 Tab：全局布局/样式控制区 -->
            <div
              v-if="isLayoutStyle"
              class="shrink-0 flex flex-wrap gap-md items-end p-padding-md bg-surface-ground rounded-scale-md component-border mb-md"
            >
              <span class="text-muted-foreground fs-sm self-center">全局布局：</span>
              <div class="flex flex-wrap gap-sm items-center">
                <label class="flex items-center gap-xs fs-xs">标签与输入的位置 (labelAlign)</label>
                <Select
                  v-model="labelAlignModel"
                  :options="[
                    { label: '继承', value: '' },
                    { label: '左', value: 'left' },
                    { label: '右', value: 'right' },
                    { label: '上', value: 'top' },
                  ]"
                  option-label="label"
                  option-value="value"
                  class="w-32"
                />
              </div>
              <div class="flex flex-wrap gap-sm items-center">
                <label class="flex items-center gap-xs fs-xs">标签块内对齐 (左中右)</label>
                <Select
                  v-model="labelTextAlign"
                  :options="[
                    { label: '继承', value: '' },
                    { label: '左', value: 'left' },
                    { label: '中', value: 'center' },
                    { label: '右', value: 'right' },
                  ]"
                  option-label="label"
                  option-value="value"
                  class="w-28"
                />
              </div>
              <div class="flex flex-wrap gap-sm items-center">
                <label class="flex items-center gap-xs fs-xs">labelWidth</label>
                <InputText
                  :model-value="labelWidthModel"
                  placeholder="数字即 px，如 120、8rem、10vw"
                  class="w-36"
                  @update:model-value="labelWidthModel = $event ?? ''"
                />
              </div>
              <div class="flex flex-wrap gap-sm items-center">
                <ToggleSwitch v-model="showLabelSwitch" />
                <span class="fs-xs">showLabel</span>
              </div>
              <p class="w-full fs-xs text-muted-foreground mt-margin-xs mb-0">
                下方表单中「备注」为单项覆盖（顶部标签）、「主题色」为单项覆盖（标签居中），其余字段使用全局配置。
              </p>
            </div>

            <div class="flex-1 min-h-0 flex flex-row gap-lg items-stretch">
              <!-- 左栏：表单示例 + 独立滚动 -->
              <div class="flex-1 min-w-0 min-h-0 flex flex-col">
                <CScrollbar class="flex-1 min-h-0 layout-full pr-padding-md">
                  <div class="flex flex-col gap-xl">
                    <SchemaForm
                      :key="activeTab"
                      ref="formRef"
                      v-model="formValues"
                      :schema="currentSchema"
                      :disabled="globalDisabled"
                      :preview="globalPreview"
                      :options-cache-t-t-l="globalTTL"
                      :remember="isAdvanced"
                      :persist="isAdvanced ? { key: 'advanced-form-persist' } : false"
                      @submit="handleSubmit"
                    />

                    <!-- Actions (Hidden in Preview Mode) -->
                    <FormActions
                      v-if="!globalPreview"
                      @submit="triggerSubmit"
                      @reset="handleReset"
                      @clear="handleClear"
                    />
                  </div>
                </CScrollbar>
              </div>
              <!-- 右栏：实时 Values + 独立滚动 -->
              <div class="w-80 shrink-0 min-h-0 flex flex-col hidden xl:flex">
                <CScrollbar class="flex-1 min-h-0 layout-full">
                  <div class="card bg-card component-border p-padding-md">
                    <h3 class="fs-lg font-medium mb-margin-sm border-b-default pb-2">
                      表单数据 (Values)
                    </h3>
                    <pre class="fs-xs font-mono break-all whitespace-pre-wrap">{{
                      formValues
                    }}</pre>
                  </div>
                </CScrollbar>
              </div>
            </div>
          </template>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
