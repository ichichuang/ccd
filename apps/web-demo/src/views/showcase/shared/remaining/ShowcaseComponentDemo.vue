<script setup lang="ts">
import { CScrollbar } from '@ccd/vue-ui'
import { useI18n } from 'vue-i18n'
import { showcaseFeedbackAdapter } from '@/adapters/showcaseFeedback.adapter'

interface SelectOption {
  label: string
  value: string
}

defineOptions({ name: 'ShowcaseComponentDemo' })

const props = defineProps<{
  kind: string
}>()

const { t } = useI18n()

const severity = ref('primary')
const buttonSize = ref('small')
const disabled = ref(false)
const emptyActions = ref(0)
const selectedIcon = ref('i-lucide-sparkles')

const severityOptions = computed<SelectOption[]>(() => [
  { label: t('showcase.remaining.controls.primary'), value: 'primary' },
  { label: t('showcase.remaining.controls.success'), value: 'success' },
  { label: t('showcase.remaining.controls.warn'), value: 'warn' },
])

const sizeOptions = computed<SelectOption[]>(() => [
  { label: t('showcase.remaining.controls.small'), value: 'small' },
  { label: t('showcase.remaining.controls.normal'), value: 'normal' },
  { label: t('showcase.remaining.controls.large'), value: 'large' },
])

const iconOptions = computed<SelectOption[]>(() => [
  { label: t('showcase.remaining.controls.sparkles'), value: 'i-lucide-sparkles' },
  { label: t('showcase.remaining.controls.layout'), value: 'i-lucide-layout-dashboard' },
  { label: t('showcase.remaining.controls.storage'), value: 'i-lucide-database' },
  { label: t('showcase.remaining.controls.shield'), value: 'i-lucide-shield-check' },
])

const adapterButtonSize = computed(() =>
  buttonSize.value === 'normal' ? undefined : buttonSize.value
)
const scrollRows = computed(() =>
  Array.from({ length: 14 }, (_, index) => ({
    id: `scroll-${index}`,
    label: t('showcase.remaining.component.scrollItem', { index: index + 1 }),
  }))
)

function recordEmptyAction(): void {
  emptyActions.value += 1
  showcaseFeedbackAdapter.showInfoMessage(t('showcase.remaining.component.emptyActionMessage'))
}
</script>

<template>
  <section
    v-if="props.kind === 'component-primevue-adapter'"
    class="grid min-w-0 grid-cols-1 gap-md lg:grid-cols-2"
  >
    <article class="material-solid col-stretch min-w-0 gap-md p-md">
      <div class="grid min-w-0 grid-cols-1 gap-sm md:grid-cols-2">
        <label class="col-stretch min-w-0 gap-xs">
          <span class="text-sm font-medium text-foreground">
            {{ $t('showcase.remaining.controls.severity') }}
          </span>
          <Select
            v-model="severity"
            :options="severityOptions"
            option-label="label"
            option-value="value"
          />
        </label>

        <label class="col-stretch min-w-0 gap-xs">
          <span class="text-sm font-medium text-foreground">
            {{ $t('showcase.remaining.controls.size') }}
          </span>
          <Select
            v-model="buttonSize"
            :options="sizeOptions"
            option-label="label"
            option-value="value"
          />
        </label>
      </div>

      <div class="row-start min-w-0 gap-sm">
        <ToggleSwitch
          v-model="disabled"
          input-id="showcase-primevue-adapter-disabled"
        />
        <label
          for="showcase-primevue-adapter-disabled"
          class="text-sm text-muted-foreground"
        >
          {{ $t('showcase.remaining.controls.disabled') }}
        </label>
      </div>
    </article>

    <article class="material-solid col-center min-w-0 gap-md p-md">
      <Button
        :label="$t('showcase.remaining.controls.adapterAction')"
        :severity="severity"
        :size="adapterButtonSize"
        :disabled="disabled"
      />
      <Tag
        :value="$t('showcase.remaining.controls.adapterTag')"
        :severity="severity"
      />
    </article>
  </section>

  <section
    v-else-if="props.kind === 'component-empty-state'"
    class="material-solid min-w-0 p-md"
  >
    <EmptyState
      icon="i-lucide-inbox"
      :title="$t('showcase.remaining.component.emptyTitle')"
      :description="$t('showcase.remaining.component.emptyDescription')"
      :action-label="$t('showcase.remaining.component.emptyAction')"
      @action="recordEmptyAction"
    />
    <p class="text-sm text-muted-foreground m-0 text-center">
      {{ $t('showcase.remaining.component.emptyCount', { count: emptyActions }) }}
    </p>
  </section>

  <section
    v-else-if="props.kind === 'component-icons'"
    class="col-stretch min-w-0 gap-md"
  >
    <label class="col-stretch min-w-0 gap-xs">
      <span class="text-sm font-medium text-foreground">
        {{ $t('showcase.remaining.controls.icon') }}
      </span>
      <Select
        v-model="selectedIcon"
        :options="iconOptions"
        option-label="label"
        option-value="value"
      />
    </label>

    <div class="grid min-w-0 grid-cols-2 gap-md md:grid-cols-4">
      <article
        v-for="option in iconOptions"
        :key="option.value"
        class="material-solid col-center min-w-0 gap-sm p-md"
      >
        <Icons
          :name="option.value"
          size="2xl"
          class="text-primary"
        />
        <span class="text-sm text-foreground text-center">
          {{ option.label }}
        </span>
      </article>
    </div>

    <div class="demo-stage col-center min-w-0 gap-sm p-md">
      <Icons
        :name="selectedIcon"
        size="4xl"
        class="text-primary"
      />
      <span class="text-sm text-muted-foreground">
        {{ selectedIcon }}
      </span>
    </div>
  </section>

  <section
    v-else
    class="material-solid col-stretch min-w-0 gap-md p-md"
  >
    <div class="col-stretch min-w-0 gap-xs">
      <h3 class="text-base font-semibold text-foreground m-0">
        {{ $t('showcase.remaining.component.scrollTitle') }}
      </h3>
      <p class="text-sm text-muted-foreground m-0">
        {{ $t('showcase.remaining.component.scrollDescription') }}
      </p>
    </div>

    <CScrollbar class="h-[30vh]">
      <ul class="col-stretch gap-xs m-0 p-0 list-none">
        <li
          v-for="row in scrollRows"
          :key="row.id"
          class="interactive-item row-between min-w-0 gap-sm"
        >
          <span class="text-sm text-foreground">{{ row.label }}</span>
          <Icons
            name="i-lucide-arrow-down"
            size="sm"
            class="text-muted-foreground"
          />
        </li>
      </ul>
    </CScrollbar>
  </section>
</template>
