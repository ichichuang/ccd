<script setup lang="ts">
import { infiniteTableColumns } from './columns'
import { userListApiExecutor } from '../shared/apiExecutor'

defineOptions({ name: 'ExampleProTableInfinitePage' })
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
              name="i-lucide-infinity"
              size="xl"
              class="text-primary"
            />
          </div>
          <div class="col-stretch gap-xs min-w-0">
            <div class="row-start gap-xs min-w-0 flex-wrap">
              <span class="text-lg font-bold text-foreground text-no-wrap">ProTable 无限滚动</span>
              <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                PRO-TABLE
              </span>
            </div>
            <span class="text-sm text-muted-foreground text-ellipsis-1">
              数据来自本地 Hono GET /api/v1/users。滚动到底部自动追加下一页；使用 api-url 与
              request-config.accumulate，无需手写拼接列表状态。
            </span>
          </div>
        </div>
      </div>
    </header>

    <section class="col-fill min-h-0">
      <ProTable
        state-key="example-pro-table-infinite"
        api-url="/api/v1/users"
        data-key="list"
        total-key="total"
        :api-executor="userListApiExecutor"
        :columns="infiniteTableColumns"
        :request-config="{ accumulate: true }"
        :pagination="false"
        infinite-scroll
        server-mode
        row-key="id"
        height-mode="fill"
      />
    </section>
  </div>
</template>
