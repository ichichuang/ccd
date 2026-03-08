<!-- @/components/SchemaForm/SchemaForm.vue -->
<template>
  <div
    ref="formContainerRef"
    class="layout-full"
  >
    <Form
      ref="formRef"
      v-slot="$form"
      :initial-values="props.modelValue || formValues"
      :resolver="validationResolver"
      class="layout-full"
      @submit="onValidSubmit"
    >
      <!-- Steps Header -->
      <StepsHeader
        v-if="schema.steps?.length"
        :steps="schema.steps"
        :active-step="activeStep"
        :accessible-steps="stepAccessibility"
        @step-change="handleStepChange"
      />

      <!-- Grid Container -->
      <div
        :class="['grid', `grid-cols-12`]"
        :style="gridGapStyle"
      >
        <!-- Render Fields Based on Schema Type -->
        <template v-if="schema.sections && !schema.steps">
          <SectionsRenderer
            :sections="schema.sections"
            :columns="schema.columns"
            :form="{ ...$form, modelValue: props.modelValue ?? {}, setFieldValue }"
            :disabled="disabled"
            :options-cache-t-t-l="optionsCacheTTL"
            :options-map="optionsMap"
            :loading-map="loadingMap"
            :error-map="errorMap"
            :retry-field="retryField"
            :global-layout="mergedLayout"
            :global-style="mergedStyle"
            :column-by-field="columnByField"
            :col-style="colStyle"
            :preview="preview"
          />
        </template>

        <template v-else-if="schema.steps && schema.steps.length">
          <StepsRenderer
            :current-step="schema.steps[activeStep]"
            :columns="schema.columns"
            :form="{ ...$form, modelValue: props.modelValue ?? {}, setFieldValue }"
            :disabled="disabled"
            :options-cache-t-t-l="optionsCacheTTL"
            :options-map="optionsMap"
            :loading-map="loadingMap"
            :error-map="errorMap"
            :retry-field="retryField"
            :global-layout="mergedLayout"
            :global-style="mergedStyle"
            :column-by-field="columnByField"
            :col-style="colStyle"
            :preview="preview"
          />

          <!-- Step Navigation -->
          <StepNavigation
            :active-step="activeStep"
            :total-steps="schema.steps.length"
            :form="$form"
            :next-enabled="stepAccessibility[activeStep + 1] ?? false"
            @next="_form => nextStep(_form)"
            @prev="prevStep"
          />
        </template>

        <template v-else>
          <DefaultRenderer
            :columns="schema.columns"
            :form="{ ...$form, modelValue: props.modelValue ?? {}, setFieldValue }"
            :disabled="disabled"
            :options-cache-t-t-l="optionsCacheTTL"
            :options-map="optionsMap"
            :loading-map="loadingMap"
            :error-map="errorMap"
            :retry-field="retryField"
            :global-layout="mergedLayout"
            :global-style="mergedStyle"
            :col-style="colStyle"
            :preview="preview"
          />
        </template>
      </div>

      <!-- Actions - 现在由用户自定义，不再预设按钮组 -->

      <!-- Persistence (Implicit) -->
      <div class="hidden">
        {{ persistValues(getPersistableValues($form.values)) }}
      </div>
      <!-- Capture $form API for expose -->
      <div class="hidden">
        {{ captureFormApi($form) }}
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { deepClone } from '@/utils/lodashes'
import { useLayoutStore } from '@/stores/modules/layout'
import { Form } from '@primevue/forms'
import {
  DefaultRenderer,
  SectionsRenderer,
  StepNavigation,
  StepsHeader,
  StepsRenderer,
} from './components'
import {
  useAsyncOptions,
  useFormActions,
  useFormMemory,
  useFormSync,
  useLayout,
  useLifecycle,
  usePersistence,
  useSteps,
  useSubmit,
  useValidation,
} from './hooks'
import { DEFAULT_SCHEMA_FORM_PROPS } from './utils/constants'
import type {
  DebugLogger,
  FormApiLike,
  FormValues,
  SchemaColumnsItem,
  SchemaFormEmits,
  SchemaFormProps,
} from './utils/types'

// ==================== Props & Emits ====================

const props = withDefaults(defineProps<SchemaFormProps<FormValues>>(), {
  ...DEFAULT_SCHEMA_FORM_PROPS,
})

const emit = defineEmits<SchemaFormEmits<FormValues>>()

// ==================== Refs ====================

const layoutStore = useLayoutStore()
// 调试日志禁用
const debugSchemaForm: DebugLogger = (..._args: unknown[]) => {}
const formContainerRef = ref<HTMLElement | null>(null)
/** PrimeVue Form 实例（仅用 fields 与内部 _watcher，类型收窄避免 any） */
const formRef = ref<{ fields?: Record<string, InternalFieldWithWatcher> } | null>(null)
const formApiRef = ref<FormApiLike<FormValues> | null>(null)

const valuesRef = computed(() => props.modelValue || {})
// 用于承载异步缓存（IDB/Shadow）以参与初始值计算
const cachedFormValues = ref<FormValues | null>(null)
// Schema ref（用于 hooks 和模板）
const schemaRef = computed(() => props.schema)
const schema = schemaRef
// ModelValue ref（用于 hooks）
const modelValueRef = computed(() => props.modelValue)
// Preview ref（用于 hooks 和模板）
const previewRef = computed(() => props.preview)
const preview = previewRef
// Disabled ref（用于模板）
const disabled = computed(() => props.disabled)
// OptionsCacheTTL ref（用于模板）
const optionsCacheTTL = computed(() => props.optionsCacheTTL)
// Remember ref（用于 hooks）
const rememberRef = computed(() => props.remember)
// Persist ref（用于 hooks）
const persistRef = computed(() => props.persist)

// ==================== 表单记忆功能 ====================
// 生成表单唯一ID
function getFormId(): string {
  const path = typeof window !== 'undefined' ? window.location.pathname : 'unknown'
  const fieldsSig = Array.isArray(props.schema?.columns)
    ? props.schema.columns.map(c => c.field).join(',')
    : ''
  return `${path}::${fieldsSig}`
}

// 初始化表单记忆功能
const rememberEnabled = computed(() =>
  Boolean(props.remember && !(props.schema.steps && props.schema.steps.length))
)
const formMemory = useFormMemory({
  formId: getFormId(),
  columns: props.schema.columns,
  enabled: rememberEnabled.value,
})
const rememberReady = ref(!rememberEnabled.value)

// ==================== 初始化 Hooks ====================

// 1. 初始化 useFormSync（状态同步）
const {
  formValues,
  captureFormApi,
  syncToModelValue,
  applyExternalValues,
  collectLatestValues,
  syncValuesRefImmediately,
  cleanup: formSyncCleanup,
} = useFormSync({
  schema: schemaRef,
  modelValue: modelValueRef,
  valuesRef,
  formApiRef,
  preview: previewRef,
  emit: (_event: 'update:modelValue', value: FormValues) => {
    emit('update:modelValue', value)
  },
})

// 2. 初始化 useValidation（验证）
const { validationResolver, validateField, markFieldTouched, clearAllFieldValidationStates } =
  useValidation({
    schema: schemaRef,
    formApiRef,
  })

// 2.5. 初始化 useSubmit（提交处理）
const { onValidSubmit } = useSubmit({
  schema: schemaRef,
  formApiRef,
  markFieldTouched,
  submitTransform: props.submitTransform,
  emit: (event: 'update:modelValue' | 'submit' | 'error', ...args: unknown[]) => {
    if (event === 'update:modelValue') {
      emit('update:modelValue', args[0] as FormValues)
    } else if (event === 'submit') {
      emit('submit', args[0] as FormValues)
    } else if (event === 'error') {
      emit('error', args[0] as { errors: Record<string, string> })
    }
  },
})

// 3. 初始化 usePersistence（持久化）
const { persistValues, loadPersistedValues } = usePersistence({
  persist: persistRef,
})

function getPersistableValues(values: unknown): Record<string, unknown> {
  if (values && typeof values === 'object') {
    return values as Record<string, unknown>
  }
  return {}
}

// 4. 初始化 useLayout（布局和样式）
const {
  mergedLayout,
  mergedStyle,
  gridGapStyle,
  colStyle,
  setupResizeObserver,
  updateContainerWidth,
} = useLayout({
  schema: schemaRef,
  formContainerRef,
})

// 4.5 V2 异步选项控制器（optionsMap / loadingMap / errorMap / retryField）
const modelValueForOptions = computed(() => props.modelValue ?? {})
const { optionsMap, loadingMap, errorMap, retryField } = useAsyncOptions({
  schema: schemaRef,
  modelValue: modelValueForOptions,
  optionsCacheTTL: optionsCacheTTL.value ?? 60_000,
})

// ==================== 辅助函数（需要在 hooks 之前定义）====================

/** 快速查找字段 */
function columnByField(field: string): SchemaColumnsItem | undefined {
  return props.schema.columns.find(column => column.field === field)
}

// 持久化相关的函数已从 usePersistence hook 中获取，无需重复定义

/** 构建初始值 */
function buildInitialValues(): FormValues {
  const values: FormValues = {}

  // 🔥 重构：新的 remember 逻辑
  // 1. 如果开启了 remember 且有缓存值，需要合并 defaultValue 和缓存值
  // 2. 如果未开启 remember，直接使用 defaultValue
  if (rememberEnabled.value && cachedFormValues.value !== null) {
    // 开启了 remember 且缓存已初始化
    const cached = cachedFormValues.value

    // 遍历所有字段，合并 defaultValue 和缓存值
    for (const column of props.schema.columns) {
      const field = column.field
      const hasDefaultValue = column.defaultValue !== undefined
      const hasCachedValue =
        Object.prototype.hasOwnProperty.call(cached, field) && cached[field] !== undefined

      if (hasCachedValue) {
        // 缓存中有值，优先使用缓存值（忽略 defaultValue）
        values[field] = cached[field]
      } else if (hasDefaultValue) {
        // 缓存中没有值，但有 defaultValue，使用 defaultValue
        values[field] = column.defaultValue
      }
      // 如果既没有缓存值也没有 defaultValue，不设置（保持 undefined）
    }
  } else if (!rememberEnabled.value) {
    // 未开启 remember，直接设置 defaultValue
    for (const column of props.schema.columns) {
      if (column.defaultValue !== undefined) {
        values[column.field] = column.defaultValue
      }
    }
  }
  // 如果开启了 remember 但缓存为 null（首次加载，还未异步加载完成），先不设置值
  // 等待异步加载完成后，会在 onMounted 中应用缓存值

  // 覆盖持久化数据（优先级低于缓存和 defaultValue）
  if (props.persist && typeof props.persist === 'object') {
    const persisted = loadPersistedValues(props.persist)
    Object.assign(values, persisted)
  }

  // 覆盖 modelValue（优先级最高）
  if (props.modelValue) {
    Object.assign(values, props.modelValue)
  }

  return values
}

// ==================== 初始化 Hooks（依赖已定义）====================

// 5. 初始化 useSteps（步骤管理）
const { activeStep, stepAccessibility, handleStepChange, nextStep, prevStep } = useSteps({
  schema: schemaRef,
  valuesRef,
  formApiRef,
  formContainerRef,
  columnByField,
  validateField,
  markFieldTouched,
  collectLatestValues,
  applyExternalValues,
  clearAllFieldValidationStates,
})

// 6. 初始化 useLifecycle（生命周期）
useLifecycle({
  schema: schemaRef,
  remember: rememberRef,
  formApiRef,
  valuesRef,
  cachedFormValues,
  rememberReady,
  formMemory,
  applyExternalValues,
  collectLatestValues,
  syncToModelValue,
  syncValuesRefImmediately,
  buildInitialValues,
  updateContainerWidth,
  setupResizeObserver,
  formSyncCleanup,
})

// ==================== 辅助函数 ====================

/** 深度克隆工具函数（使用统一导入） */

/** PrimeVue Form 字段上挂载的 watcher（内部 API，非公开类型） */
interface InternalFieldWatcher {
  pause?: () => void
  resume?: () => void
}

interface InternalFieldWithWatcher {
  _watcher?: InternalFieldWatcher
}

/** 暂停字段 watchers 的工具函数 */
async function withPausedFieldWatchers<T>(
  fn: () => Promise<T> | T,
  clearValidationBeforeResume = false
): Promise<T> {
  const watchers: InternalFieldWatcher[] = []
  // 🔥 Fix: Use formRef.value.fields as the primary source for internal fields,
  // as formApiRef (slot scope) might not expose 'fields' directly in all PrimeVue versions.
  // Fallback to formApiRef.value.fields or formApiRef.value (if it is the fields object itself)
  const formFields = formRef.value?.fields || formApiRef.value?.fields

  if (formFields && typeof formFields === 'object') {
    Object.values(formFields).forEach(field => {
      const watcher = (field as InternalFieldWithWatcher)?._watcher
      if (watcher && typeof watcher.pause === 'function') {
        watcher.pause()
        watchers.push(watcher)
      }
    })
  }

  try {
    return await fn()
  } finally {
    if (watchers.length) {
      await nextTick()
      // 🔥 关键：如果需要在恢复前清除校验状态，先清除再恢复
      if (clearValidationBeforeResume) {
        clearAllFieldValidationStates()
      }
      watchers.forEach(watcher => {
        if (watcher && typeof watcher.resume === 'function') {
          watcher.resume()
        }
      })
    }
  }
}

// 7. 初始化 useFormActions（表单操作 API）
const { getFormValues, validate, submit, reset, clear, setFieldValue, setValues } = useFormActions({
  schema: schemaRef,
  formApiRef,
  formContainerRef,
  valuesRef,
  cachedFormValues,
  rememberEnabled,
  formMemory,
  collectLatestValues,
  syncValuesRefImmediately,
  syncToModelValue,
  clearAllFieldValidationStates,
  validateField,
  deepClone,
  withPausedFieldWatchers,
  debugSchemaForm,
})

// ==================== 初始化缓存值 ====================

// 在组件 setup 阶段同步读取缓存，确保 Form 初始计算即可拿到默认值
if (rememberEnabled.value) {
  rememberReady.value = false
  try {
    const cached = formMemory.loadCacheSyncForInit()
    if (cached && typeof cached === 'object' && Object.keys(cached).length > 0) {
      // 🔥 重构：只设置缓存值，不直接更新 valuesRef
      // buildInitialValues 会负责合并 defaultValue 和缓存值
      cachedFormValues.value = cached
      debugSchemaForm('[SchemaForm][init] loaded cache sync', {
        cached,
        cachedKeys: Object.keys(cached),
      })

      // 🔥 P2 重构：不再直接更新 valuesRef，而是通过 emit 更新 modelValue
      // valuesRef 现在由外部（useSchemaForm）通过 v-model 管理
      // 如果需要初始化值，应该通过 emit('update:modelValue') 来更新
      // 但这里只是缓存加载，实际的初始值应该由外部（useSchemaForm）管理
    } else {
      // 缓存为空或不存在，设置为 null，让 buildInitialValues 使用 defaultValue
      cachedFormValues.value = null
    }
  } catch (e) {
    console.error('[SchemaForm][init] cache read error:', e)
    cachedFormValues.value = null
  }
}

// 🔥 P2 重构：统一 remember 存储逻辑：监听 modelValue（由外部管理）
if (rememberEnabled.value) {
  watch(
    () => props.modelValue,
    newValues => {
      if (!rememberReady.value || formMemory.isRestoring.value) {
        return
      }
      const snapshot = deepClone(newValues || {})
      formMemory.saveValues(snapshot)
      try {
        const formId = getFormId()
        if (formMemory.storageKey.value) {
          layoutStore.setFormMemoryPointer(formId, formMemory.storageKey.value)
        }
      } catch {
        /* ignore pointer sync errors */
      }
    },
    { deep: true }
  )
}

// ==================== Lifecycle ====================
// 生命周期逻辑已由 useLifecycle hook 处理，无需重复定义

// 验证相关的函数已从 useValidation hook 中获取，无需重复定义
// 持久化相关的函数已从 usePersistence hook 中获取，无需重复定义

// 提交处理逻辑已从 useSubmit hook 中获取，无需重复定义

// 步骤相关的函数已从 useSteps hook 中获取，无需重复定义
// 同步相关的函数已从 useFormSync hook 中获取，无需重复定义
// 验证相关的函数（包括 clearAllFieldValidationStates）已从 useValidation hook 中获取

// =============== Expose API ===============
// 表单操作相关的函数已从 useFormActions hook 中获取，无需重复定义
defineExpose({
  /** 🔥 P2 重构：valuesRef 现在返回 modelValue 的引用（由外部管理） */
  get valuesRef() {
    return modelValueRef
  },
  /** 步骤可达状态（与头部高亮保持一致） */
  stepAccessibility,
  /** 获取当前值（过滤掉空值字段） */
  get values() {
    return getFormValues()
  },
  /** 触发验证，返回 { valid, errors }（与提交流程一致的校验逻辑） */
  validate,
  /** 提交（走内部 onValidSubmit 流程） */
  submit,
  /** 重置（恢复 defaultValue） */
  reset,
  /** 清空表单（所有字段设置为合适的空值） */
  clear,
  /** 设置某个字段值 */
  setFieldValue,
  /** 批量设置值 */
  setValues,
})
</script>

<style scoped>
/* Fix Password component internal input width */
:deep(.p-password-input) {
  width: 100%;
}

/* Fix InputNumber component internal input width */
:deep(.p-inputnumber-input) {
  width: 100%;
}

/* Fix InputNumber buttons height mismatch and alignment */
:deep(.p-inputnumber-button-group) {
  overflow: hidden; /* Ensure buttons don't bleed past rounded corners */
  border-top-right-radius: var(--radius-md);
  border-bottom-right-radius: var(--radius-md);
}

:deep(.p-inputnumber-button) {
  height: 50% !important; /* 50% 为比例，非固定尺寸 */
  min-height: 0; /* Clear any default min-height */
}

/* 101 例外：表单控件内部增减按钮之间的分隔线，使用极弱边框避免布局偏移 */
:deep(.p-inputnumber-increment-button) {
  border-bottom: 1px solid rgb(var(--border) / 0.15);
}
</style>
