<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  disabled: boolean
  preview: boolean
  optionsCacheTTL: number
}>()

const emit = defineEmits<{
  (e: 'update:disabled', value: boolean): void
  (e: 'update:preview', value: boolean): void
  (e: 'update:optionsCacheTTL', value: number): void
}>()

const localDisabled = ref(props.disabled)
const localPreview = ref(props.preview)
const localTTL = ref(props.optionsCacheTTL)

watch(
  () => props.disabled,
  v => (localDisabled.value = v)
)
watch(
  () => props.preview,
  v => (localPreview.value = v)
)
watch(
  () => props.optionsCacheTTL,
  v => (localTTL.value = v)
)

// 本地状态变化时立即同步到父组件，避免仅依赖 @change 导致更新滞后
watch(localDisabled, v => emit('update:disabled', v))
watch(localPreview, v => emit('update:preview', v))
watch(localTTL, v => emit('update:optionsCacheTTL', v))

function updateStart() {
  emit('update:disabled', localDisabled.value)
  emit('update:preview', localPreview.value)
  emit('update:optionsCacheTTL', localTTL.value)
}
</script>

<template>
  <div
    class="card bg-card component-border p-padding-md flex flex-row flex-wrap gap-md items-center mb-margin-md"
  >
    <div class="row-center gap-sm">
      <label class="text-sm font-medium">全局禁用 (Disabled):</label>
      <ToggleSwitch
        v-model="localDisabled"
        @change="updateStart"
      />
    </div>

    <div class="w-px h-[var(--spacing-md)] bg-border mx-margin-sm" />

    <div class="row-center gap-sm">
      <label class="text-sm font-medium">全局预览 (Preview):</label>
      <ToggleSwitch
        v-model="localPreview"
        @change="updateStart"
      />
    </div>

    <div class="w-px h-[var(--spacing-md)] bg-border mx-margin-sm" />

    <div class="row-center gap-sm">
      <label class="text-sm font-medium">选项缓存时间 (TTL ms):</label>
      <InputNumber
        v-model="localTTL"
        :min="0"
        :step="1000"
        class="w-32"
        @update:model-value="updateStart"
      />
    </div>
  </div>
</template>
