<script setup lang="ts">
import { infiniteTableColumns } from './columns'

defineOptions({ name: 'ExampleProTableInfinitePage' })
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
              name="i-lucide-arrow-down-to-line"
              class="text-primary text-2xl"
            />
          </div>
          <div class="col-stretch gap-xs">
            <div class="row-start items-center gap-sm flex-wrap">
              <h1 class="text-2xl font-bold text-foreground m-0">ProTable — 无限加载模式</h1>
              <span
                class="bg-accent/15 text-accent rounded-md px-sm py-xs text-xs font-semibold uppercase tracking-wider shrink-0"
              >
                Infinite Scroll
              </span>
            </div>
            <p class="text-muted-foreground text-sm m-0">
              数据来自本地 Hono
              <code class="code-inline text-muted-foreground">GET /api/v1/users</code>
              。滚动到底部自动追加下一页；使用
              <code class="code-inline text-muted-foreground">api-url</code>
              与
              <code class="code-inline text-muted-foreground">request-config.accumulate</code>
              ，无需手写拼接列表状态。
            </p>
          </div>
        </div>

        <div class="bg-muted rounded-md px-md py-xs row-start items-center gap-sm shrink-0">
          <Icons
            name="i-lucide-layers"
            size="xs"
            class="text-accent!"
          />
          <span class="text-xs text-muted-foreground">向下滚动加载更多</span>
        </div>
      </div>
    </header>

    <section class="col-fill min-h-0">
      <ProTable
        api-url="/api/v1/users"
        data-key="data.list"
        total-key="data.total"
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
