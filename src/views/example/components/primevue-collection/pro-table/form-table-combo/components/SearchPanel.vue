<script setup lang="ts">
import type { ProFormExpose } from '@/components/ProForm'
import { searchFormSchema } from '../config'

defineOptions({ name: 'FormTableComboSearchPanel' })

const emit = defineEmits<{
  search: [values: Record<string, unknown>]
  reset: []
}>()

const formRef = ref<ProFormExpose<Record<string, unknown>> | null>(null)

function onSubmit(values: Record<string, unknown>): void {
  emit('search', values)
}

function onResetClick(): void {
  formRef.value?.form.reset()
  emit('reset')
}
</script>

<template>
  <div class="interactive-card rounded-md p-md">
    <ProForm
      ref="formRef"
      :schema="searchFormSchema"
      :gap="'var(--spacing-md)'"
      @submit="onSubmit"
    >
      <template #footer="{ formState: slotFormState, submit }">
        <div class="row-start gap-md">
          <Button
            type="button"
            severity="primary"
            label="Search / 搜索"
            icon="i-lucide-search"
            class="shrink-0"
            :loading="slotFormState.submitting"
            @click="submit"
          />
          <Button
            type="button"
            severity="secondary"
            outlined
            label="Reset / 重置"
            icon="i-lucide-rotate-ccw"
            class="shrink-0"
            :disabled="slotFormState.submitting"
            @click="onResetClick"
          />
        </div>
      </template>
    </ProForm>
  </div>
</template>
