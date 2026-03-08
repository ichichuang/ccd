<script setup lang="ts">
import type { FormValues } from '@/components/SchemaForm'
import { wizardSchema } from './schemas/wizardSchema'

defineOptions({ name: 'FormWizardExampleIndex' })

interface FormWizardValues {
  name: string
  email: string
  category: string
  notes: string
  agreed: boolean
}

const initialValues: FormWizardValues = {
  name: '',
  email: '',
  category: '',
  notes: '',
  agreed: false,
}

const formValues = ref<FormValues>({ ...initialValues })

function handleSubmit(values: FormValues): void {
  window.$message?.success('表单已提交')
  console.log('Submitted:', values)
}
</script>

<template>
  <div
    data-archetype="A5-form-wizard"
    class="h-full flex flex-col overflow-hidden"
  >
    <div
      data-region="stepper"
      class="shrink-0"
    />

    <div
      data-region="form-body"
      class="flex-1 min-h-0"
    >
      <CScrollbar class="h-full">
        <div class="p-padding-lg flex flex-col gap-lg layout-content-narrow">
          <SchemaForm
            v-model="formValues"
            :schema="wizardSchema"
            @submit="handleSubmit"
          />
        </div>
      </CScrollbar>
    </div>

    <div
      data-region="actions"
      class="shrink-0"
    />
  </div>
</template>
