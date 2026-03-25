<script setup lang="ts">
/**
 * ParentView
 * 一个简单的路由出口组件，用于多级路由的中间层级渲染
 * 仅包含 router-view，不包含其他布局逻辑
 */
defineOptions({ name: 'ParentView' })
</script>

<template>
  <div class="layout-full min-h-0">
    <router-view />
  </div>
</template>
