<script setup lang="ts">
/**
 * 图表示例全局控制：主题、透明度、渲染器、Loading
 */
defineProps<{
  themeEnabled?: boolean
  lineAreaOpacity?: number
  renderer?: 'canvas' | 'svg'
  chartLoading?: boolean
}>()

const emit = defineEmits<{
  'update:themeEnabled': [value: boolean]
  'update:lineAreaOpacity': [value: number]
  'update:renderer': [value: 'canvas' | 'svg']
  'update:chartLoading': [value: boolean]
}>()
</script>

<template>
  <div class="flex flex-col gap-md">
    <h3 class="fs-md font-semibold text-foreground border-b-default pb-padding-xs">全局控制</h3>
    <div class="flex flex-wrap items-center justify-between gap-sm">
      <div class="flex items-center gap-sm">
        <ToggleSwitch
          :model-value="themeEnabled"
          @update:model-value="value => emit('update:themeEnabled', value)"
        />
        <span class="text-foreground fs-sm">启用主题</span>
      </div>
    </div>
    <div class="flex flex-col gap-xs">
      <span class="text-muted-foreground fs-sm"
        >lineArea 透明度 {{ lineAreaOpacity }}（对带面积填充的折线图生效）</span
      >
      <Slider
        :model-value="lineAreaOpacity"
        :min="0"
        :max="1"
        :step="0.1"
        class="w-full"
        @update:model-value="emit('update:lineAreaOpacity', Number($event))"
      />
    </div>
    <div class="flex flex-wrap gap-sm">
      <Button
        label="Canvas"
        size="small"
        :severity="renderer === 'canvas' ? 'primary' : 'secondary'"
        @click="emit('update:renderer', 'canvas')"
      />
      <Button
        label="SVG"
        size="small"
        :severity="renderer === 'svg' ? 'primary' : 'secondary'"
        @click="emit('update:renderer', 'svg')"
      />
    </div>
    <div class="flex items-center justify-between">
      <span class="text-foreground fs-sm">Loading</span>
      <ToggleSwitch
        :model-value="chartLoading"
        @update:model-value="value => emit('update:chartLoading', value)"
      />
    </div>
  </div>
</template>
