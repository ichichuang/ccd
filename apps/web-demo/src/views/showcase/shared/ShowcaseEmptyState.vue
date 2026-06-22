<script setup lang="ts">
interface ShowcaseEmptyStateProps {
  icon?: `i-${string}`
  title?: string
  description?: string
  actionLabel?: string
}

defineOptions({ name: 'ShowcaseEmptyState' })

const props = withDefaults(defineProps<ShowcaseEmptyStateProps>(), {
  icon: 'i-lucide-inbox',
  title: '',
  description: '',
  actionLabel: '',
})

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="demo-well min-w-0">
    <EmptyState
      :icon="props.icon"
      :title="props.title"
      :description="props.description"
      :action-label="props.actionLabel"
      @action="emit('action')"
    />
  </div>
</template>
