<script setup lang="ts">
defineOptions({ name: 'ExampleProFormDagPage' })
</script>

<template>
  <div
    class="h-full flex flex-col overflow-hidden"
    data-archetype="playground-single-panel"
  >
    <div class="flex-1 min-h-0 px-padding-lg py-padding-lg">
      <div class="surface-elevated rounded-md p-padding-lg layout-stack gap-scale-md">
        <div class="layout-stack gap-scale-xs">
          <div class="fs-lg font-semibold text-foreground">ProForm 动态联动与计算 (DAG)</div>
          <div class="fs-sm text-muted-foreground">
            本页面将展示 DependencyGraph、可视化依赖和计算字段等高级联动能力（建设中）。
          </div>
        </div>
        <div class="fs-sm text-muted-foreground">Work in progress...</div>
      </div>
    </div>
  </div>
</template>
