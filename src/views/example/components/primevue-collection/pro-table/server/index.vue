<script setup lang="ts">
import type { ProTableLoadParams } from '@/components/ProTable'
import { requestDummyUsers } from '@/api/example/dummy'
import type { DummyUserDTO } from '@/api/example/dummy'
import { serverTableColumns } from './columns'

defineOptions({ name: 'ExampleProTableServerPage' })

// ── State ────────────────────────────────────────────────────────────────────

const tableData = ref<DummyUserDTO[]>([])
const totalCount = ref<number>(0)
const isLoading = ref<boolean>(false)
const hasError = ref<boolean>(false)
const errorMessage = ref<string>('')
const lastParams = ref<ProTableLoadParams | null>(null)
const tableContainerRef = ref<HTMLElement | null>(null)
const tableContainerHeight = ref<number | undefined>(undefined)

// ── Data fetching ─────────────────────────────────────────────────────────────

async function loadData(params: ProTableLoadParams): Promise<void> {
  isLoading.value = true
  hasError.value = false
  lastParams.value = params

  try {
    const res = await requestDummyUsers({
      page: params.page,
      pageSize: params.pageSize,
      sortField: params.sort.field ?? undefined,
      sortOrder: params.sort.direction ?? undefined,
      keyword: params.filter.global || undefined,
    })
    tableData.value = res.users
    totalCount.value = res.total
  } catch (err) {
    hasError.value = true
    errorMessage.value = err instanceof Error ? err.message : '请求失败，请检查网络后重试'
    tableData.value = []
    totalCount.value = 0
  } finally {
    isLoading.value = false
  }
}

function handleTableLoad(params: ProTableLoadParams): void {
  void loadData(params)
}

function handleRetry(): void {
  if (lastParams.value) {
    void loadData(lastParams.value)
  }
}

function handleRefresh(): void {
  void loadData(
    lastParams.value ?? {
      page: 1,
      pageSize: 10,
      sort: { field: null, direction: null },
      filter: { global: '', columns: {} },
    }
  )
}

// Trigger initial load on mount — TableController watch has no `immediate` option
onMounted(() => {
  tableContainerHeight.value = tableContainerRef.value?.clientHeight ?? 0
  void loadData({
    page: 1,
    pageSize: 10,
    sort: { field: null, direction: null },
    filter: { global: '', columns: {} },
  })
})

// ── Derived display ───────────────────────────────────────────────────────────

const requestEndpoint = computed<string>(() => {
  if (!lastParams.value) return '—'
  const p = lastParams.value
  const base = p.filter.global ? '/users/search' : '/users'
  const parts: string[] = [`limit=${p.pageSize}`, `skip=${(p.page - 1) * p.pageSize}`]
  if (p.sort.field) parts.push(`sortBy=${p.sort.field}`, `order=${p.sort.direction ?? 'asc'}`)
  if (p.filter.global) parts.push(`q=${p.filter.global}`)
  return `dummyjson.com${base}?${parts.join('&')}`
})
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="layout-full px-md md:px-lg flex flex-col gap-sm min-h-0"
  >
    <!-- Toolbar: Hero Header (Transparent Root Policy: Inherit canvas) -->
    <header class="shrink-0">
      <div class="w-full py-sm row-between gap-md flex-wrap">
        <div class="flex flex-row items-center gap-md">
          <div class="p-md bg-primary/10 rounded-lg shrink-0">
            <Icons
              name="i-lucide-cloud"
              class="text-primary text-2xl"
            />
          </div>
          <div class="flex flex-col gap-xs">
            <div class="flex flex-row items-center gap-sm flex-wrap">
              <h1 class="text-2xl font-bold text-foreground m-0">ProTable — 真实服务端集成</h1>
              <span
                class="bg-success/15 text-success rounded-md px-sm py-xs text-xs font-semibold uppercase tracking-wider shrink-0"
              >
                Live API
              </span>
            </div>
            <p class="text-muted-foreground text-sm m-0">
              数据来自
              <code>dummyjson.com/users</code>
              （208 条）。分页、排序、全局搜索均为真实 HTTP 请求。
            </p>
          </div>
        </div>
        <div
          class="bg-muted rounded-md px-md py-xs flex flex-row items-center gap-xs shrink-0 min-w-0"
        >
          <Icons
            name="i-lucide-globe"
            size="xs"
            class="text-accent! shrink-0"
          />
          <code class="text-xs text-muted-foreground text-single-line-ellipsis">
            {{ requestEndpoint }}
          </code>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 min-h-0 flex flex-col gap-sm">
      <!-- Error banner -->
      <Transition name="error-bar">
        <div
          v-if="hasError"
          class="shrink-0 row-between px-lg py-sm bg-danger/10"
        >
          <div class="flex flex-row items-center gap-sm">
            <Icons
              name="i-lucide-wifi-off"
              size="sm"
              class="text-danger"
            />
            <span class="text-sm text-danger font-bold">{{ errorMessage }}</span>
          </div>
          <Button
            label="重试"
            size="small"
            severity="danger"
            outlined
            @click="handleRetry"
          />
        </div>
      </Transition>

      <!-- ProTable -->
      <section
        ref="tableContainerRef"
        class="col-fill"
      >
        <template v-if="tableContainerHeight && tableContainerHeight > 0">
          <div :style="{ height: tableContainerHeight + 'px' }">
            <ProTable
              :columns="serverTableColumns"
              :data="tableData"
              :loading="isLoading"
              :total="totalCount"
              :server-mode="true"
              row-key="id"
              :pagination="{ pageSize: 12, pageSizeOptions: [12, 24, 48] }"
              @load="handleTableLoad"
              @refresh="handleRefresh"
            />
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.error-bar-enter-active,
.error-bar-leave-active {
  transition:
    opacity var(--transition-md) ease,
    max-height var(--transition-md) ease;
  overflow: hidden;
  max-height: var(--spacing-3xl);
}
.error-bar-enter-from,
.error-bar-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
