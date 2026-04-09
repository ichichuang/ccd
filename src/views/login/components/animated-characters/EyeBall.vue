<script setup lang="ts">
defineOptions({ name: 'AnimatedEyeBall' })

interface EyeBallProps {
  size?: string
  pupilSize?: string
  maxDistance?: number
}

const props = withDefaults(defineProps<EyeBallProps>(), {
  size: '48px',
  pupilSize: '16px',
  maxDistance: 10,
})

const eyeballStyle = computed<Record<string, string>>(() => ({
  width: props.size,
  height: props.size,
}))

const pupilStyle = computed<Record<string, string>>(() => ({
  width: props.pupilSize,
  height: props.pupilSize,
}))

const eyeballEl = useTemplateRef<HTMLElement>('eyeballEl')
const blinkLayerEl = useTemplateRef<HTMLElement>('blinkLayerEl')
const pupilEl = useTemplateRef<HTMLElement>('pupilEl')

watchPostEffect(() => {
  const el = eyeballEl.value
  if (el) el.setAttribute('data-max-distance', String(props.maxDistance))
})

defineExpose({ eyeballEl, blinkLayerEl, pupilEl })
</script>

<template>
  <div
    ref="eyeballEl"
    class="eyeball center overflow-hidden rounded-full bg-card"
    :style="eyeballStyle"
  >
    <div
      ref="blinkLayerEl"
      class="layout-full center overflow-hidden rounded-full will-change-transform"
      style="transform-origin: center center"
    >
      <div
        ref="pupilEl"
        class="eyeball-pupil rounded-full bg-foreground will-change-transform"
        :style="pupilStyle"
      />
    </div>
  </div>
</template>
