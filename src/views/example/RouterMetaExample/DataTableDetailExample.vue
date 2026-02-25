<script setup lang="ts">
import { goToRoute } from '@/router/utils/helper'

const route = useRoute()

const id = computed<string>(() => {
  const p = route.params?.id
  return typeof p === 'string' ? p : ''
})
</script>

<template>
  <div class="p-padding-lg space-y-margin-md">
    <h2 class="fs-xl font-semibold flex items-center gap-sm">
      <Icons
        name="i-lucide-file-text"
        size="lg"
        class="text-primary"
      />
      <span>DataTable 详情示例（meta.activeMenu）</span>
    </h2>

    <div class="component-border rounded-scale p-padding-md space-y-margin-sm bg-card">
      <div class="fs-md font-medium">当前 ID：{{ id || '-' }}</div>
      <p class="text-muted-foreground fs-sm">
        本路由 meta.activeMenu =
        '/example/ui/data-table'，访问时左侧菜单应高亮「DataTable」而非本详情页（因 showLink: false
        本页不在菜单中）。
      </p>
    </div>

    <div class="flex gap-sm">
      <Button
        label="返回 DataTable"
        severity="secondary"
        @click="goToRoute('ExampleDataTable')"
      />
    </div>
  </div>
</template>
