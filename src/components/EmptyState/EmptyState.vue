<!--
  Industrial Empty State component.
  Use for tables, charts, overview when no data. Follows EMPTY_STATE_AND_ROBUSTNESS.md.
  Props: icon, title, description, actionLabel, actionTo (route path or href).
-->
<script setup lang="ts">
const router = useRouter()
const props = withDefaults(
  defineProps<{
    icon?: string
    title: string
    description?: string
    actionLabel?: string
    actionTo?: string
  }>(),
  {
    icon: 'i-lucide-inbox',
    description: '',
    actionLabel: '',
    actionTo: '',
  }
)
</script>

<template>
  <div class="col-center gap-md py-2xl px-lg text-center">
    <!-- Watermark icon -->
    <Icons
      :name="props.icon"
      size="5xl"
      class="text-muted-foreground opacity-25"
    />
    <!-- Primary title -->
    <p class="text-md font-semibold text-foreground m-0">
      {{ props.title }}
    </p>
    <!-- Secondary description -->
    <p
      v-if="props.description"
      class="text-sm text-muted-foreground m-0 max-w-[60ch]"
    >
      {{ props.description }}
    </p>
    <!-- Optional action button -->
    <Button
      v-if="props.actionLabel && props.actionTo"
      :label="props.actionLabel"
      severity="secondary"
      class="mt-md"
      @click="router.push(props.actionTo)"
    />
  </div>
</template>
