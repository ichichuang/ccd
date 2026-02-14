<script setup lang="ts">
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primevue'
import { ref, computed, watch } from 'vue'
import { SchemaForm } from '@/components/schema-form'
import { basicSchema } from './schemas/basicSchema'
import { sectionsSchema } from './schemas/sectionsSchema'
import { stepsSchema } from './schemas/stepsSchema'
import { validationSchema } from './schemas/validationSchema'
import { dynamicSchema } from './schemas/dynamicSchema'
import { customSchema } from './schemas/customSchema.tsx'
import { advancedSchema } from './schemas/advancedSchema'
import FormActions from './components/FormActions.vue'
import GlobalControls from './components/GlobalControls.vue'
import HeadlessTab from './components/HeadlessTab.vue'
import type { FormValues } from '@/components/schema-form'

const formRef = ref()
const activeTab = ref<string | number>('basic')
const formValues = ref<FormValues>({})

// Global Controls State
const globalDisabled = ref(false)
const globalPreview = ref(false)
const globalTTL = ref(60000)

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
    default:
      return basicSchema
  }
})

const isAdvanced = computed(() => String(activeTab.value) === 'advanced')
const isHeadless = computed(() => String(activeTab.value) === 'headless')

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
      <div class="shrink-0 flex justify-between items-center border-b border-border pr-md">
        <TabList class="border-0!">
          <Tab value="basic">基础 (Basic)</Tab>
          <Tab value="sections">分组 (Sections)</Tab>
          <Tab value="steps">分步 (Steps)</Tab>
          <Tab value="validation">校验 (Validation)</Tab>
          <Tab value="dynamic">动态 (Dynamic)</Tab>
          <Tab value="custom">自定义 (Custom)</Tab>
          <Tab value="advanced">高级 (Advanced)</Tab>
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
                  <div class="card bg-card border border-border p-padding-md">
                    <h3 class="fs-lg font-medium mb-margin-sm border-b border-border pb-2">
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
