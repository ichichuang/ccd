<!-- @/components/schema-form/components/StepsHeader.vue -->
<template>
  <div class="mb-4">
    <div class="flex gap-2">
      <Button
        v-for="(step, index) in steps"
        :key="index"
        :disabled="!(accessibleSteps?.[index] ?? false)"
        :outlined="index !== activeStep && !(accessibleSteps?.[index] ?? false)"
        :severity="
          index === activeStep ? 'primary' : accessibleSteps?.[index] ? 'primary' : 'secondary'
        "
        @click="() => (accessibleSteps?.[index] ? $emit('step-change', index) : undefined)"
      >
        <span class="fs-appFontSizes">{{ index + 1 }}. {{ step.title }}</span>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StepConfig } from '../utils/types'

defineProps<{
  steps: StepConfig[]
  activeStep: number
  accessibleSteps: boolean[]
}>()

defineEmits<{
  'step-change': [index: number]
}>()
</script>
