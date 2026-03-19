<script setup lang="tsx">
import { heightModeColumns, makeHeightMockData } from './columns'
import type { HeightModeRow } from './columns'
import type { HeightMode } from '@/components/ProTable/engine/types/props'

defineOptions({ name: 'ExampleProTableHeightModesPage' })

// Creates data sets
const mockData = ref<HeightModeRow[]>(makeHeightMockData(40))

// ── Demo controls ──────────────────────────────────────────────────────────
// 使用语义化 spacing 变量而非 px/vh 作为固定高度值
const fixedHeight = ref<string>('var(--spacing-5xl)')
const showAllThree = ref<boolean>(true)

const HEIGHT_OPTIONS = [
  { label: '短 (≈200px)', value: 'calc(var(--spacing-5xl) * 1.5)' },
  { label: '中 (≈300px)', value: 'calc(var(--spacing-5xl) * 2)' },
  { label: '高 (≈400px)', value: 'calc(var(--spacing-5xl) * 2.5)' },
  { label: '极高 (容器上限)', value: 'calc(var(--spacing-5xl) * 3)' },
]

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
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="layout-full px-padding-md md:px-padding-lg col-stack-sm min-h-0"
  >
    <!-- Toolbar: Hero Header (Inherit canvas color) -->
    <header class="shrink-0 border-b-default">
      <div class="w-full py-padding-sm row-between gap-md flex-wrap">
        <div class="row-y-center gap-md">
          <div class="p-padding-md bg-primary/10 rounded-scale-lg shrink-0">
            <Icons
              name="i-lucide-proportions"
              class="text-primary fs-2xl"
            />
          </div>
          <div class="col-stack-xs">
            <h1 class="fs-2xl font-bold text-foreground m-0">ProTable — 高度模式</h1>
            <p class="text-muted fs-sm m-0">
              对比演示 fill / auto / fixed 三种高度策略的表现差异。
            </p>
          </div>
        </div>

        <!-- Control Area -->
        <div class="row-y-center gap-md flex-wrap shrink-0">
          <div class="row-y-center gap-xs">
            <span class="fs-sm text-muted">固定高度值:</span>
            <Select
              v-model="fixedHeight"
              :options="HEIGHT_OPTIONS"
              option-label="label"
              option-value="value"
              class="w-[var(--spacing-5xl)]"
            />
          </div>
          <div class="row-y-center gap-xs">
            <label
              for="ctrl-show-all"
              class="fs-sm text-muted cursor-pointer"
            >
              同时显示三种
            </label>
            <ToggleSwitch
              v-model="showAllThree"
              input-id="ctrl-show-all"
              class="shrink-0"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <CScrollbar class="flex-1 min-h-0">
      <div class="w-full col-stack-sm py-padding-sm">
        <template v-if="showAllThree">
          <div
            v-for="table in tables"
            :key="table.mode"
            class="panel-base col-stack-sm"
          >
            <div class="row-y-center gap-sm border-b-default pb-padding-sm mb-padding-sm">
              <Icons
                :name="table.icon"
                class="text-primary"
                size="sm"
              />
              <div class="col-stack-xs">
                <span class="fs-md font-semibold text-foreground">{{ table.label }}</span>
                <span class="fs-xs text-muted">{{ table.desc }}</span>
              </div>
            </div>
            <div class="flex-1 min-h-0">
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
        </template>

        <template v-else>
          <div class="panel-base col-stack-sm">
            <div class="row-y-center gap-sm border-b-default pb-padding-sm mb-padding-sm">
              <Icons
                name="i-lucide-proportions"
                class="text-primary"
                size="sm"
              />
              <span class="fs-md font-semibold text-foreground">单独展示 — fill 模式</span>
            </div>
            <div class="flex-1 min-h-0">
              <ProTable
                :columns="heightModeColumns"
                :data="mockData"
                row-key="id"
                height-mode="fill"
                :pagination="{ pageSize: 12 }"
              />
            </div>
          </div>
        </template>
      </div>
    </CScrollbar>
  </div>
</template>
