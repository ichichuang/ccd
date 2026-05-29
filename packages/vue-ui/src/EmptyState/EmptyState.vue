<!--
  Industrial Empty State component.
  Use for tables, charts, overview when no data. Follows EMPTY_STATE_AND_ROBUSTNESS.md.
  Props: icon, title/titleKey, description/descriptionKey, actionLabel.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CcdButton } from '../CcdPrimeControls'
import Icons from '../Icons/Icons.vue'
import type { EmptyStateProps } from './types'

defineOptions({ name: 'EmptyState' })

interface EmptyStateEmits {
  (e: 'action'): void
}

interface EmptyStateSlots {
  icon?: () => unknown
  title?: () => unknown
  description?: () => unknown
  action?: () => unknown
}

const props = withDefaults(defineProps<EmptyStateProps>(), {
  icon: 'i-lucide-inbox',
  title: '',
  titleKey: '',
  description: '',
  descriptionKey: '',
  actionLabel: '',
})

const emit = defineEmits<EmptyStateEmits>()
defineSlots<EmptyStateSlots>()
const { t } = useI18n()

const resolvedTitle = computed<string>(() => {
  if (props.titleKey) return t(props.titleKey)
  return props.title
})

const resolvedDescription = computed<string>(() => {
  if (props.descriptionKey) return t(props.descriptionKey)
  return props.description
})
</script>

<template>
  <div class="col-center gap-md py-2xl px-lg text-center">
    <!-- Watermark icon -->
    <slot name="icon">
      <Icons
        :name="props.icon"
        size="5xl"
        class="text-muted-foreground opacity-25"
      />
    </slot>
    <!-- Primary title -->
    <slot name="title">
      <p
        v-if="resolvedTitle"
        class="text-md font-semibold text-foreground m-0"
      >
        {{ resolvedTitle }}
      </p>
    </slot>
    <!-- Secondary description -->
    <slot name="description">
      <p
        v-if="resolvedDescription"
        class="text-sm text-muted-foreground m-0 max-w-[60ch]"
      >
        {{ resolvedDescription }}
      </p>
    </slot>
    <!-- Optional action button -->
    <slot name="action">
      <CcdButton
        v-if="props.actionLabel"
        :label="props.actionLabel"
        severity="secondary"
        class="mt-md"
        @click="emit('action')"
      />
    </slot>
  </div>
</template>
