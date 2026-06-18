<script setup lang="ts">
import { useFieldArray } from '@ccd/vue-ui'
import { useI18n } from 'vue-i18n'
import type { ProFormDemoValues } from './proFormDemoSchemas'

defineOptions({ name: 'ProFormFieldArrayControls' })

const { t } = useI18n()
const nextMilestone = ref<string | undefined>('')
const milestones = useFieldArray<string, ProFormDemoValues>('milestones')

function appendMilestone(): void {
  const value = (nextMilestone.value ?? '').trim()
  if (!value) return
  milestones.append(value)
  nextMilestone.value = ''
}

function removeMilestone(index: number): void {
  milestones.remove(index)
}

function moveMilestoneUp(index: number): void {
  milestones.move(index, index - 1)
}

function moveMilestoneDown(index: number): void {
  milestones.move(index, index + 1)
}
</script>

<template>
  <section class="demo-well col-stretch min-w-0 gap-md">
    <div class="col-stretch min-w-0 gap-xs">
      <span class="text-sm font-semibold text-foreground">
        {{ t('showcase.proForm.fieldArray.title') }}
      </span>
      <p class="text-sm text-muted-foreground m-0">
        {{ t('showcase.proForm.fieldArray.description') }}
      </p>
    </div>

    <ul
      v-if="milestones.fields.value.length"
      class="col-stretch gap-xs m-0 p-0 list-none"
    >
      <li
        v-for="field in milestones.fields.value"
        :key="field.id"
        class="interactive-item row-between min-w-0 gap-sm"
      >
        <span class="min-w-0 text-sm text-foreground">
          {{ field.index + 1 }}. {{ field.value }}
        </span>
        <span class="row-start gap-xs">
          <Button
            size="small"
            severity="secondary"
            text
            icon="i-lucide-arrow-up"
            :aria-label="t('showcase.proForm.fieldArray.moveUp')"
            :disabled="field.index === 0"
            @click="moveMilestoneUp(field.index)"
          />
          <Button
            size="small"
            severity="secondary"
            text
            icon="i-lucide-arrow-down"
            :aria-label="t('showcase.proForm.fieldArray.moveDown')"
            :disabled="field.index === milestones.fields.value.length - 1"
            @click="moveMilestoneDown(field.index)"
          />
          <Button
            size="small"
            severity="danger"
            text
            icon="i-lucide-trash-2"
            :aria-label="t('showcase.proForm.fieldArray.remove')"
            @click="removeMilestone(field.index)"
          />
        </span>
      </li>
    </ul>

    <div class="grid min-w-0 grid-cols-1 gap-sm md:grid-cols-[minmax(0,1fr)_auto]">
      <InputText
        v-model="nextMilestone"
        :placeholder="t('showcase.proForm.fieldArray.placeholder')"
      />
      <Button
        icon="i-lucide-plus"
        :label="t('showcase.proForm.fieldArray.add')"
        @click="appendMilestone"
      />
    </div>
  </section>
</template>
