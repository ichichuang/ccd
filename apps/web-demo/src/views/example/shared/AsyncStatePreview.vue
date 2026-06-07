<script setup lang="ts">
defineOptions({ name: 'AsyncStatePreview' })

const props = withDefaults(
  defineProps<{
    content: string
    loading?: boolean
    errorText?: string
    emptyText?: string
  }>(),
  {
    loading: false,
    errorText: '',
    emptyText: 'No response data',
  }
)

const hasError = computed<boolean>(() => props.errorText !== '' && props.errorText !== '—')
const hasContent = computed<boolean>(() => props.content.trim() !== '' && props.content !== '—')
</script>

<template>
  <div class="material-elevated col-stretch p-md gap-sm bg-muted/30 rounded-md min-w-0">
    <div
      v-if="props.loading"
      class="row-start gap-sm text-sm text-muted-foreground"
    >
      <Icons
        name="i-lucide-loader-circle"
        size="sm"
        class="text-primary animate-spin"
      />
      <span>Loading response</span>
    </div>

    <Message
      v-else-if="hasError"
      severity="warn"
    >
      {{ props.errorText }}
    </Message>

    <div
      v-else-if="!hasContent"
      class="row-start gap-sm text-sm text-muted-foreground"
    >
      <Icons
        name="i-lucide-inbox"
        size="sm"
        class="text-muted-foreground"
      />
      <span>{{ props.emptyText }}</span>
    </div>

    <pre
      v-else
      class="text-xs text-foreground text-no-wrap m-0"
      >{{ props.content }}</pre
    >
  </div>
</template>
