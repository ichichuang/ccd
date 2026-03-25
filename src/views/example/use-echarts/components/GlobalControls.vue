<script setup lang="ts">
/**
 * 图表示例全局控制：主题、透明度、渲染器、Loading
 */
withDefaults(
  defineProps<{
    themeEnabled?: boolean
    lineAreaOpacity?: number
    /** 柱状图 series 的 itemStyle 透明度，对应 ChartOpacityConfig.bar */
    barOpacity?: number
    renderer?: 'canvas' | 'svg'
    chartLoading?: boolean
  }>(),
  {
    lineAreaOpacity: 0.3,
    barOpacity: 1,
    renderer: 'canvas',
  }
)

const emit = defineEmits<{
  'update:themeEnabled': [value: boolean]
  'update:lineAreaOpacity': [value: number]
  'update:barOpacity': [value: number]
  'update:renderer': [value: 'canvas' | 'svg']
  'update:chartLoading': [value: boolean]
}>()
</script>

<template>
  <div class="col-stretch gap-md">
    <h3 class="text-md font-semibold text-foreground border-b-default pb-xs">全局控制</h3>
    <div class="row-between flex-wrap gap-sm">
      <div class="row-start items-center gap-sm">
        <ToggleSwitch
          :model-value="themeEnabled"
          @update:model-value="value => emit('update:themeEnabled', value)"
        />
        <span class="text-foreground text-sm">启用主题</span>
      </div>
    </div>
    <div class="col-stretch gap-xs">
      <span class="text-muted-foreground text-sm">
        lineArea 透明度 {{ lineAreaOpacity }}（仅当 series 含 areaStyle 的面积折线生效）
      </span>
      <Slider
        :model-value="lineAreaOpacity"
        :min="0"
        :max="1"
        :step="0.1"
        class="w-full"
        @update:model-value="emit('update:lineAreaOpacity', Number($event))"
      />
    </div>
    <div class="col-stretch gap-xs">
      <span class="text-muted-foreground text-sm">
        柱状图透明度 {{ barOpacity }}（bar 类型 series 的填充透明度）
      </span>
      <Slider
        :model-value="barOpacity"
        :min="0"
        :max="1"
        :step="0.1"
        class="w-full"
        @update:model-value="emit('update:barOpacity', Number($event))"
      />
    </div>
    <div class="row-start flex-wrap gap-sm">
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
    <div class="row-between">
      <span class="text-foreground text-sm">Loading</span>
      <ToggleSwitch
        :model-value="chartLoading"
        @update:model-value="value => emit('update:chartLoading', value)"
      />
    </div>
  </div>
</template>
