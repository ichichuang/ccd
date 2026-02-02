<script setup lang="ts">
import { ref } from 'vue'
import CScrollbar from '@/components/CScrollbar/CScrollbar.vue'
import type { OverlayScrollbars } from 'overlayscrollbars'

const scrollbarRef = ref<InstanceType<typeof CScrollbar> | null>(null)
const logs = ref<string[]>([])
const visibility = ref<'auto' | 'visible' | 'hidden'>('auto')

// 模拟长内容
const items = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  title: `Scroll Item ${i + 1}`,
  date: new Date().toLocaleDateString(),
  desc: '这是一个用于测试滚动条功能的示例文本内容，包含足够多的文字以展示换行效果。',
}))
const horizontalItems = Array.from({ length: 20 }, (_, i) => `Column ${i + 1}`)

function addLog(msg: string) {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift(`[${time}] ${msg}`)
  if (logs.value.length > 50) logs.value.pop()
}

function handleInitialized() {
  addLog('Initialized')
}

function handleUpdated() {
  addLog('Updated')
}

function handleScroll(_: OverlayScrollbars, event: Event) {
  const target = event.target as HTMLElement
  // 节流日志输出，仅在特定位置或偶尔输出
  if (Math.random() > 0.9) {
    addLog(`Scroll: ${target.scrollTop}px`)
  }
}

function scrollToTop() {
  scrollbarRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
  addLog('Action: Scroll to Top')
}

function scrollToBottom() {
  // 获取滚动内容高度
  const instance = scrollbarRef.value?.getInstance()
  if (instance) {
    const { scrollOffsetElement } = instance.elements()
    scrollbarRef.value?.scrollTo({
      top: scrollOffsetElement.scrollHeight,
      behavior: 'smooth',
    })
    addLog('Action: Scroll to Bottom')
  }
}

function checkState() {
  const state = scrollbarRef.value?.state()
  addLog(`State: ${JSON.stringify(state, null, 2)}`)
}

function toggleVisibility() {
  const modes: ('auto' | 'visible' | 'hidden')[] = ['auto', 'visible', 'hidden']
  const nextIndex = (modes.indexOf(visibility.value) + 1) % modes.length
  visibility.value = modes[nextIndex]
  addLog(`Action: Visibility -> ${visibility.value}`)
}
</script>

<template>
  <div class="h-full w-full p-4 flex flex-col gap-4 overflow-hidden">
    <!-- 头部控制栏 -->
    <div
      class="bg-card rounded-lg border p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between shrink-0"
    >
      <div class="flex items-center gap-2">
        <div class="p-2 bg-primary/10 rounded-full">
          <div class="i-lucide-scroll text-primary text-xl" />
        </div>
        <div>
          <h1 class="text-lg font-bold">CScrollbar 演示</h1>
          <p class="text-sm text-muted-foreground">基于 OverlayScrollbars 的高性能滚动容器</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border shadow-sm bg-background"
          @click="toggleVisibility"
        >
          <div class="i-lucide-eye w-4 h-4" />
          {{ visibility.toUpperCase() }}
        </button>
        <div class="h-4 w-[1px] bg-border mx-2" />
        <button
          class="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border shadow-sm bg-background"
          @click="scrollToTop"
        >
          <div class="i-lucide-arrow-up-to-line w-4 h-4" />
          Top
        </button>
        <button
          class="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border shadow-sm bg-background"
          @click="scrollToBottom"
        >
          <div class="i-lucide-arrow-down-to-line w-4 h-4" />
          Bottom
        </button>
        <button
          class="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          @click="checkState"
        >
          <div class="i-lucide-bug w-4 h-4" />
          Debug
        </button>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="flex items-start gap-4 flex-1 min-h-0">
      <!-- 左侧：垂直滚动 (固定高度容器演示) -->
      <div class="w-2/5 h-full flex flex-col gap-4 min-w-[300px]">
        <div class="bg-card rounded-lg border shadow-sm flex flex-col h-full overflow-hidden">
          <div class="p-4 border-b shrink-0 flex justify-between items-center bg-muted/20">
            <h2 class="font-semibold flex items-center gap-2">
              <div class="i-lucide-arrow-up-down w-4 h-4 text-muted-foreground" />
              Vertical Scroll
            </h2>
            <span class="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">h-full</span>
          </div>

          <div class="flex-1 min-h-0 relative">
            <CScrollbar
              ref="scrollbarRef"
              :visibility="visibility"
              class="h-full"
              @initialized="handleInitialized"
              @updated="handleUpdated"
              @scroll="handleScroll"
            >
              <div class="p-4 space-y-3">
                <div
                  v-for="item in items"
                  :key="item.id"
                  class="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group cursor-default"
                >
                  <div class="flex justify-between items-start mb-1">
                    <span class="font-medium text-sm group-hover:text-primary transition-colors">{{
                      item.title
                    }}</span>
                    <span class="text-xs text-muted-foreground">{{ item.date }}</span>
                  </div>
                  <p class="text-xs text-muted-foreground leading-relaxed">
                    {{ item.desc }}
                  </p>
                </div>
              </div>
            </CScrollbar>
          </div>
        </div>
      </div>

      <!-- 右侧：混合演示 -->
      <div class="flex-1 h-full flex flex-col gap-4 min-w-0">
        <!-- 上部分：水平滚动 -->
        <div class="bg-card rounded-lg border shadow-sm flex flex-col shrink-0 h-[200px]">
          <div class="p-4 border-b shrink-0 flex justify-between items-center bg-muted/20">
            <h2 class="font-semibold flex items-center gap-2">
              <div class="i-lucide-arrow-left-right w-4 h-4 text-muted-foreground" />
              Horizontal Scroll
            </h2>
          </div>
          <div class="flex-1 min-h-0 relative">
            <CScrollbar
              :visibility="visibility"
              class="h-full"
            >
              <div class="flex p-4 gap-4 w-max h-full items-center">
                <div
                  v-for="item in horizontalItems"
                  :key="item"
                  class="w-[180px] h-[120px] rounded-lg border bg-gradient-to-br from-background to-muted flex items-center justify-center shrink-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <span class="font-medium text-muted-foreground">{{ item }}</span>
                </div>
              </div>
            </CScrollbar>
          </div>
        </div>

        <!-- 下部分：日志 -->
        <div
          class="bg-card rounded-lg border shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <div class="p-4 border-b shrink-0 flex justify-between items-center bg-muted/20">
            <h2 class="font-semibold flex items-center gap-2">
              <div class="i-lucide-terminal w-4 h-4 text-muted-foreground" />
              Event Logs
            </h2>
            <button
              class="text-xs px-2 py-1 hover:bg-background rounded border border-transparent hover:border-border transition-colors text-muted-foreground"
              @click="logs = []"
            >
              Clear Logs
            </button>
          </div>
          <div class="flex-1 min-h-0 bg-[#0c0c0c] relative">
            <CScrollbar class="h-full">
              <div class="p-4 font-mono text-xs space-y-1">
                <div
                  v-if="logs.length === 0"
                  class="text-gray-600 italic select-none py-8 text-center"
                >
                  Waiting for events...
                </div>
                <div
                  v-for="(log, i) in logs"
                  :key="i"
                  class="break-all border-b border-white/5 pb-0.5 mb-0.5 last:border-0"
                  :class="log.includes('Action') ? 'text-blue-400 font-bold' : 'text-green-400/80'"
                >
                  {{ log }}
                </div>
              </div>
            </CScrollbar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure the parent of this component allows it to grow */
:deep(.os-scrollbar-handle) {
  /* Optional customization if needed */
}
</style>
