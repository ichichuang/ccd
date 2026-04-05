<script setup lang="ts">
defineOptions({ name: 'AnimatedPupil' })

interface PupilProps {
  size?: string
  maxDistance?: number
}

const props = withDefaults(defineProps<PupilProps>(), {
  size: '12px',
  maxDistance: 5,
})

const sizeStyle = computed<Record<string, string>>(() => ({
  width: props.size,
  height: props.size,
}))

const pupilEl = ref<HTMLElement | null>(null)

watchPostEffect(() => {
  const el = pupilEl.value
  if (el) el.setAttribute('data-max-distance', String(props.maxDistance))
})

defineExpose({ pupilEl })
</script>

<template>
  <div
    ref="pupilEl"
    class="pupil rounded-full bg-foreground will-change-transform"
    :style="sizeStyle"
  />
</template>
