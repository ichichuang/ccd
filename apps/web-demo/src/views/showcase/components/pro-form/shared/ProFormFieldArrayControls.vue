<script setup lang="ts">
import { useFieldArray, useFormContext } from '@ccd/vue-ui'
import { useI18n } from 'vue-i18n'
import type { ProFormDemoValues } from './proFormDemoSchemas'

defineOptions({ name: 'ProFormFieldArrayControls' })

const { t } = useI18n()
const form = useFormContext<ProFormDemoValues>()
const nextMilestone = ref<string | undefined>('')
const milestones = useFieldArray<string, ProFormDemoValues>('milestones')
const visibleMilestones = ref<string[]>(readMilestonesFromForm())
const milestoneItems = computed(() =>
  visibleMilestones.value.map((value, index) => ({
    id: `visible-milestone-${index}-${value}`,
    value,
    index,
  }))
)

function readMilestonesFromForm(): string[] {
  const values = form.getValues().milestones
  return Array.isArray(values)
    ? values.filter((value): value is string => typeof value === 'string')
    : []
}

function writeMilestones(values: string[]): void {
  form.setFieldsValue({ milestones: values })
  visibleMilestones.value = [...values]
}

function appendMilestone(): void {
  const value = (nextMilestone.value ?? '').trim()
  if (!value) return
  const nextValues = [...visibleMilestones.value, value]
  milestones.append(value)
  writeMilestones(nextValues)
  nextMilestone.value = ''
}

function removeMilestone(index: number): void {
  const nextValues = visibleMilestones.value.filter(
    (_value, currentIndex) => currentIndex !== index
  )
  milestones.remove(index)
  writeMilestones(nextValues)
}

function moveMilestone(index: number, targetIndex: number): void {
  if (index < 0 || index >= visibleMilestones.value.length) return
  if (targetIndex < 0 || targetIndex >= visibleMilestones.value.length) return

  const nextValues = [...visibleMilestones.value]
  const [movedValue] = nextValues.splice(index, 1)
  if (movedValue === undefined) return

  nextValues.splice(targetIndex, 0, movedValue)
  milestones.move(index, targetIndex)
  writeMilestones(nextValues)
}

function moveMilestoneUp(index: number): void {
  moveMilestone(index, index - 1)
}

function moveMilestoneDown(index: number): void {
  moveMilestone(index, index + 1)
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
      v-if="milestoneItems.length"
      class="col-stretch gap-xs m-0 p-0 list-none"
    >
      <li
        v-for="field in milestoneItems"
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
            :disabled="field.index === milestoneItems.length - 1"
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
