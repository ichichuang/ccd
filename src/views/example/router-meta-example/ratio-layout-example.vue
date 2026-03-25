<script setup lang="ts">
// 本页在 ratio 布局下渲染，parent: 'ratio', ratio: '16:9'
// 从菜单点击会新窗口打开，内容区域保持 16:9 比例
</script>

<template>
  <div class="p-lg h-full col-center gap-md">
    <h2 class="text-xl font-semibold row-start items-center gap-sm">
      <Icons
        name="i-lucide-aspect-ratio"
        size="lg"
        class="text-primary"
      />
      <span>比例布局示例（meta.parent + meta.ratio）</span>
    </h2>

    <div class="material-elevated col-stretch gap-sm max-w-[80%]">
      <div class="text-md font-medium">本路由 meta 配置</div>
      <p class="text-muted-foreground text-sm">meta.parent = 'ratio'，meta.ratio = '16:9'</p>
      <p class="text-muted-foreground text-sm">
        当前内容区域在 LayoutRatio 中渲染，保持 16:9
        宽高比，并在新窗口中打开。适合大屏展示、演示等场景。
      </p>
    </div>
  </div>
</template>
