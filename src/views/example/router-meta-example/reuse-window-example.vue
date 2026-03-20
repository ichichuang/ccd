<script setup lang="ts">
// 本页在 fullscreen 布局下渲染，parent: 'fullscreen', reuseWindow: true
// 从菜单多次点击会复用同一窗口并聚焦，而非打开多个窗口
</script>

<template>
  <div class="p-lg space-y-margin-md column-center min-h-[60vh]">
    <h2 class="text-xl font-semibold row-y-center gap-sm">
      <Icons
        name="i-lucide-window"
        size="lg"
        class="text-primary"
      />
      <span>窗口复用示例（meta.reuseWindow）</span>
    </h2>

    <div class="shadow-sm dark:shadow-md rounded-scale p-md space-y-margin-sm max-w-[80%]">
      <div class="text-md font-medium">本路由 meta 配置</div>
      <p class="text-muted-foreground text-sm">
        meta.parent = 'fullscreen'，meta.reuseWindow = true
      </p>
      <p class="text-muted-foreground text-sm">
        从侧边栏多次点击「窗口复用」菜单：若已存在该路由的窗口，会聚焦该窗口而非新开。适合报表、大屏等单实例页面。
      </p>
    </div>
  </div>
</template>
