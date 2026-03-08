<script setup lang="ts">
// 本页无额外逻辑，主要展示 meta.hideBreadcrumb 效果
</script>

<template>
  <div class="p-padding-lg space-y-margin-md">
    <h2 class="fs-xl font-semibold flex items-center gap-sm">
      <Icons
        name="i-lucide-navigation"
        size="lg"
        class="text-primary"
      />
      <span>隐藏面包屑示例（meta.hideBreadcrumb）</span>
    </h2>

    <div class="component-border rounded-scale p-padding-md space-y-margin-sm">
      <div class="fs-md font-medium">本路由 meta.hideBreadcrumb = true</div>
      <p class="text-muted-foreground fs-sm">
        当前页面顶部面包屑栏应被隐藏。请对比访问其他示例页面，观察面包屑的显隐差异。
      </p>
    </div>
  </div>
</template>
