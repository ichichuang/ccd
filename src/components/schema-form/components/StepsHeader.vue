<!-- @/components/schema-form/components/StepsHeader.vue -->
<template>
  <div class="mb-margin-md">
    <div class="row-center gap-sm">
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
        <span class="fs-sm">{{ index + 1 }}. {{ step.title }}</span>
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
