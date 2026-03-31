<script setup lang="ts">
import { serverTableColumns } from './columns'

defineOptions({ name: 'ExampleProTableServerPage' })
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="layout-full px-md md:px-lg col-stretch gap-sm min-h-0"
  >
    <header class="shrink-0">
      <div class="w-full py-sm row-between gap-md flex-wrap">
        <div class="row-start items-center gap-md">
          <div class="p-md bg-primary/10 rounded-lg shrink-0">
            <Icons
              name="i-lucide-cloud"
              class="text-primary text-2xl"
            />
          </div>
          <div class="col-stretch gap-xs">
            <div class="row-start items-center gap-sm flex-wrap">
              <h1 class="text-2xl font-bold text-foreground m-0">ProTable — 真实服务端集成</h1>
              <span
                class="bg-success/15 text-success rounded-md px-sm py-xs text-xs font-semibold uppercase tracking-wider shrink-0"
              >
                Live API
              </span>
            </div>
            <p class="text-muted-foreground text-sm m-0">
              数据来自本地 Hono
              <code class="code-inline text-muted-foreground">GET /api/v1/users</code>
              。分页、排序、全局搜索均为真实 HTTP 请求；表格通过
              <code class="code-inline text-muted-foreground">api-url</code>
              与
              <code class="code-inline text-muted-foreground">data-key</code>
              解包，无需手写 loading / total。
            </p>
          </div>
        </div>
        <div class="bg-muted rounded-md px-md py-xs row-start items-center gap-xs shrink-0 min-w-0">
          <Icons
            name="i-lucide-globe"
            size="xs"
            class="text-accent! shrink-0"
          />
          <code class="code-inline text-muted-foreground text-ellipsis-1">
            /api/v1/users?page=1&limit=12&search=foo
          </code>
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
