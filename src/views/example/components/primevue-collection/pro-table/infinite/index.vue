<script setup lang="ts">
import type { DummyProductDTO } from '@/api/example/dummy'
import { requestDummyProducts } from '@/api/example/dummy'
import { productColumns } from './columns'

defineOptions({ name: 'ExampleProTableInfinitePage' })

// ── State ────────────────────────────────────────────────────────────────────

const allProducts = ref<DummyProductDTO[]>([])
const totalCount = ref<number>(0)
const isLoading = ref<boolean>(false)
const hasError = ref<boolean>(false)
const errorMessage = ref<string>('')
const hasMore = ref<boolean>(true)
const tableContainerRef = ref<HTMLElement | null>(null)
const tableContainerHeight = ref<number | undefined>(undefined)

let currentPage = 1
const PAGE_SIZE = 20

// ── Data fetching ─────────────────────────────────────────────────────────────

async function loadMore(): Promise<void> {
  if (isLoading.value || !hasMore.value) return

  isLoading.value = true
  hasError.value = false

  try {
    const res = await requestDummyProducts({ page: currentPage, pageSize: PAGE_SIZE })
    allProducts.value.push(...res.products)
    totalCount.value = res.total
    hasMore.value = allProducts.value.length < res.total
    currentPage++
  } catch (err) {
    hasError.value = true
    errorMessage.value = err instanceof Error ? err.message : '请求失败，请检查网络后重试'
  } finally {
    isLoading.value = false
  }
}

function handleRetry(): void {
  void loadMore()
}

function handleRefresh(): void {
  currentPage = 1
  allProducts.value = []
  hasMore.value = true
  void loadMore()
}

onMounted(() => {
  tableContainerHeight.value = tableContainerRef.value?.clientHeight ?? 0
  void loadMore()
})

// ── Derived ───────────────────────────────────────────────────────────────────

const progressText = computed<string>(() => {
  if (totalCount.value === 0) return ''
  return `已加载 ${allProducts.value.length} / ${totalCount.value} 条`
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
              name="i-lucide-arrow-down-to-line"
              class="text-primary text-2xl"
            />
          </div>
          <div class="flex flex-col gap-xs">
            <div class="flex flex-row items-center gap-sm flex-wrap">
              <h1 class="text-2xl font-bold text-foreground m-0">ProTable — 无限加载模式</h1>
              <span
                class="bg-accent/15 text-accent rounded-md px-sm py-xs text-xs font-semibold uppercase tracking-wider shrink-0"
              >
                Infinite Scroll
              </span>
            </div>
            <p class="text-muted-foreground text-sm m-0">
              数据来自
              <code>dummyjson.com/products</code>
              （194 件）。滚动到底部自动加载下一页，数据追加到列表末尾。
            </p>
          </div>
        </div>

        <!-- Progress badge -->
        <div
          v-if="totalCount > 0"
          class="bg-muted rounded-md px-md py-xs flex flex-row items-center gap-sm shrink-0"
        >
          <div class="flex flex-row items-center gap-xs">
            <Icons
              name="i-lucide-layers"
              size="xs"
              class="text-accent!"
            />
            <span class="text-xs text-muted-foreground">{{ progressText }}</span>
          </div>
          <span
            v-if="!hasMore"
            class="bg-success text-success-foreground rounded-sm px-xs py-0.5 text-xs font-semibold uppercase tracking-tighter"
          >
            全部加载完毕
          </span>
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

      <!-- ProTable with infiniteScroll -->
      <section
        ref="tableContainerRef"
        class="col-fill"
      >
        <template v-if="tableContainerHeight && tableContainerHeight > 0">
          <div :style="{ height: tableContainerHeight + 'px' }">
            <ProTable
              :columns="productColumns"
              :data="allProducts"
              :loading="isLoading"
              :total="totalCount"
              :server-mode="true"
              :pagination="false"
              :infinite-scroll="true"
              row-key="id"
              @load-more="loadMore"
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
