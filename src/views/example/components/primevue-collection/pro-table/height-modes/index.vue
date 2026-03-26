<script setup lang="tsx">
import { heightModeColumns, makeHeightMockData } from './columns'
import type { HeightModeRow } from './columns'
import type { HeightMode } from '@/components/ProTable/engine/types/props'

defineOptions({ name: 'ExampleProTableHeightModesPage' })

// Creates data sets
const mockData = ref<HeightModeRow[]>(makeHeightMockData(40))

const fixedHeight = '20vh'

const tables: { mode: HeightMode; label: string; desc: string; icon: string }[] = [
  {
    mode: 'fill',
    label: '① fill — 撑满剩余空间',
    desc: '表格容器 flex:1 自动填满父级空间；分页条固定在底部。',
    icon: 'i-lucide-maximize-2',
  },
  {
    mode: 'auto',
    label: '② auto — 随内容自适应',
    desc: '表格高度由数据行数决定；适合行数少（<20）的场景。',
    icon: 'i-lucide-move-vertical',
  },
  {
    mode: 'fixed',
    label: '③ fixed — 固定高度',
    desc: '表格容器高度锁定为指定值；超出部分内部滚动。',
    icon: 'i-lucide-proportions',
  },
]

function getTableContainerClass(mode: HeightMode): string {
  if (mode === 'auto') {
    return ''
  }
  return 'h-40vh min-h-0'
}
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="layout-full px-md md:px-lg col-stretch gap-sm min-h-0"
  >
    <!-- Toolbar: Hero Header (Inherit canvas color) -->
    <header class="shrink-0">
      <div class="w-full py-sm row-between gap-md flex-wrap">
        <div class="row-start items-center gap-md">
          <div class="p-md bg-primary/10 rounded-lg shrink-0">
            <Icons
              name="i-lucide-proportions"
              class="text-primary text-2xl"
            />
          </div>
          <div class="col-stretch gap-xs">
            <h1 class="text-2xl font-bold text-foreground m-0">ProTable — 高度模式</h1>
            <p class="text-muted-foreground text-sm m-0">
              对比演示 fill / auto / fixed 三种高度策略的表现差异。
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <CScrollbar class="flex-1 min-h-0">
      <div class="w-full col-stretch gap-sm py-sm">
        <div
          v-for="table in tables"
          :key="table.mode"
          class="material-elevated col-stretch gap-lg px-lg py-md"
        >
          <div class="row-start items-center gap-sm pb-sm mb-padding-sm">
            <Icons
              :name="table.icon"
              class="text-primary"
              size="sm"
            />
            <div class="col-stretch gap-xs">
              <span class="text-md font-semibold text-foreground">{{ table.label }}</span>
              <span class="text-xs text-muted-foreground">{{ table.desc }}</span>
            </div>
          </div>
          <div :class="getTableContainerClass(table.mode)">
            <ProTable
              :columns="heightModeColumns"
              :data="mockData"
              row-key="id"
              :height-mode="table.mode"
              :height="table.mode === 'fixed' ? fixedHeight : undefined"
              :show-toolbar="false"
              :pagination="{ pageSize: 5 }"
            />
          </div>
        </div>
      </div>
    </CScrollbar>
  </div>
</template>
