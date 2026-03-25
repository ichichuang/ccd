<script setup lang="ts">
import { goToRoute } from '@/router/utils/helper'

const route = useRoute()

const id = computed<string>(() => {
  const p = route.params?.id
  return typeof p === 'string' ? p : ''
})
</script>

<template>
  <div class="p-lg col-stretch gap-md">
    <h2 class="text-xl font-semibold row-start items-center gap-sm">
      <Icons
        name="i-lucide-file-text"
        size="lg"
        class="text-primary"
      />
      <span>DataTable 详情示例（meta.activeMenu）</span>
    </h2>

    <div class="material-elevated col-stretch gap-sm">
      <div class="text-md font-medium">当前 ID：{{ id || '-' }}</div>
      <p class="text-muted-foreground text-sm">
        本路由 meta.activeMenu =
        '/example/tables/data-table'，访问时左侧菜单应高亮「DataTable」而非本详情页（因 showLink:
        false 本页不在菜单中）。
      </p>
    </div>

    <div class="row-start gap-sm">
      <Button
        label="返回 DataTable"
        severity="secondary"
        @click="goToRoute('ExampleDataTable')"
      />
    </div>
  </div>
</template>
