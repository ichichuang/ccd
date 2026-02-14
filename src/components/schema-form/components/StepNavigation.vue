<!-- @/components/schema-form/components/StepNavigation.vue -->
<template>
  <div class="col-span-12 row main-between cross-start gap-md">
    <Button
      type="button"
      severity="secondary"
      :label="t('schemaForm.stepPrev')"
      :disabled="activeStep === 0"
      @click="$emit('prev')"
    />
    <div>
      <Button
        v-if="activeStep < totalSteps - 1"
        type="button"
        severity="primary"
        :label="t('schemaForm.stepNext')"
        :disabled="nextEnabled === false"
        @click="() => $emit('next', form)"
      />
      <Button
        v-else
        type="submit"
        severity="primary"
        :label="t('schemaForm.submit')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormApiLike } from '../utils/types'
import Button from 'primevue/button'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  activeStep: number
  totalSteps: number
  form: FormApiLike
  nextEnabled?: boolean
}>()

defineEmits<{
  next: [form: FormApiLike]
  prev: []
}>()
</script>
