<script setup lang="ts">
import { serverTableColumns } from './columns'

defineOptions({ name: 'ExampleProTableServerPage' })
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="layout-full px-md md:px-lg col-stretch gap-sm min-h-0"
  >
    <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
      <div class="row-between gap-md min-w-0">
        <div class="row-start gap-sm min-w-0 flex-wrap">
          <div class="glass-icon-box shrink-0">
            <Icons
              name="i-lucide-server"
              size="xl"
              class="text-primary"
            />
          </div>
          <div class="col-stretch gap-xs min-w-0">
            <div class="row-start gap-xs min-w-0 flex-wrap">
              <span class="text-lg font-bold text-foreground text-no-wrap">
                ProTable 服务端分页
              </span>
              <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                PRO-TABLE
              </span>
            </div>
            <span class="text-sm text-muted-foreground text-ellipsis-1">
              数据来自本地 Hono GET /api/v1/users。分页、排序、全局搜索均为真实 HTTP 请求；表格通过
              api-url 与 data-key 解包，无需手写 loading / total。
            </span>
          </div>
        </div>
      </div>
    </header>

    <section class="col-fill min-h-0">
      <ProTable
        api-url="/api/v1/users"
        data-key="data.list"
        total-key="data.total"
        :columns="serverTableColumns"
        row-key="id"
        server-mode
        :pagination="{ pageSize: 12, pageSizeOptions: [12, 24, 48] }"
        height-mode="fill"
      />
    </section>
  </div>
</template>
