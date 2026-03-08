<script setup lang="ts">
// 本页在 fullscreen 布局下渲染，parent: 'fullscreen', reuseWindow: true
// 从菜单多次点击会复用同一窗口并聚焦，而非打开多个窗口
</script>

<template>
  <div
    class="p-padding-lg space-y-margin-md flex flex-col items-center justify-center min-h-[60vh]"
  >
    <h2 class="fs-xl font-semibold flex items-center gap-sm">
      <Icons
        name="i-lucide-window"
        size="lg"
        class="text-primary"
      />
      <span>窗口复用示例（meta.reuseWindow）</span>
    </h2>

    <div class="component-border rounded-scale p-padding-md space-y-margin-sm max-w-[80%]">
      <div class="fs-md font-medium">本路由 meta 配置</div>
      <p class="text-muted-foreground fs-sm">meta.parent = 'fullscreen'，meta.reuseWindow = true</p>
      <p class="text-muted-foreground fs-sm">
        从侧边栏多次点击「窗口复用」菜单：若已存在该路由的窗口，会聚焦该窗口而非新开。适合报表、大屏等单实例页面。
      </p>
    </div>
  </div>
</template>
