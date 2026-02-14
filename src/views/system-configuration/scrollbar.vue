<script setup lang="ts">
import { ref } from 'vue'
import type { OverlayScrollbars } from 'overlayscrollbars'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import SelectButton from 'primevue/selectbutton'

const scrollbarRef = ref<InstanceType<typeof CScrollbar> | null>(null)
const logs = ref<string[]>([])

// Visibility options
const visibilityOptions = [
  { label: '自动', value: 'auto' },
  { label: '可见', value: 'visible' },
  { label: '隐藏', value: 'hidden' },
]
const visibility = ref<'auto' | 'visible' | 'hidden'>('auto')

// Mock content
const items = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  title: `Scroll Item ${i + 1}`,
  date: new Date().toLocaleDateString(),
  desc: '这是一个用于测试滚动条功能的示例文本内容，包含足够多的文字以展示换行效果。',
}))
const horizontalItems = Array.from({ length: 20 }, (_, i) => `Column ${i + 1}`)

// Copy to clipboard utility
function copyToClipboard(text: string, label?: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      window.$message?.success(`已复制: ${label || text}`)
    })
    .catch(() => {
      window.$message?.error('复制失败')
    })
}

function addLog(msg: string) {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift(`[${time}] ${msg}`)
  if (logs.value.length > 50) logs.value.pop()
}

function handleInitialized() {
  addLog('🚀 Initialized')
}

function handleUpdated() {
  addLog('🔄 Updated')
}

function handleScroll(_: OverlayScrollbars, event: Event) {
  const target = event.target as HTMLElement
  if (Math.random() > 0.9) {
    addLog(`📜 Scroll: ${target.scrollTop}px`)
  }
}

function scrollToTop() {
  scrollbarRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
  addLog('⬆️ 动作: 滚动至顶部')
}

function scrollToBottom() {
  const instance = scrollbarRef.value?.getInstance()
  if (instance) {
    const { scrollOffsetElement } = instance.elements()
    scrollbarRef.value?.scrollTo({
      top: scrollOffsetElement.scrollHeight,
      behavior: 'smooth',
    })
    addLog('⬇️ 动作: 滚动至底部')
  }
}

function checkState() {
  const state = scrollbarRef.value?.state()
  addLog(`🔍 状态: ${JSON.stringify(state, null, 2)}`)
}

// Code examples
const usageExamples = [
  {
    title: 'Basic Usage',
    code: `<CScrollbar class="h-full">
  <div>Your scrollable content</div>
</CScrollbar>`,
  },
  {
    title: 'With Options',
    code: `<CScrollbar
  :options="{ scrollbars: { autoHide: 'leave' } }"
  visibility="auto"
>
  <div>Content</div>
</CScrollbar>`,
  },
  {
    title: 'With Events',
    code: `<CScrollbar
  ref="scrollbarRef"
  @initialized="onInit"
  @updated="onUpdate"
  @scroll="onScroll"
>
  <div>Content</div>
</CScrollbar>`,
  },
  {
    title: 'Scroll Methods',
    code: `// Scroll to position
scrollbarRef.value?.scrollTo({
  top: 0,
  behavior: 'smooth'
})

// Get instance
const instance = scrollbarRef.value?.getInstance()

// Get state
const state = scrollbarRef.value?.state()`,
  },
]
</script>

<template>
  <CScrollbar class="h-full p-padding-lg bg-background">
    <div class="w-full max-w-[90vw] mx-auto flex flex-col gap-xl">
      <!-- Header -->
      <div class="flex flex-col gap-xs">
        <div class="flex items-center gap-md">
          <div class="p-padding-md bg-primary/10 rounded-scale-lg">
            <Icons
              name="i-lucide-scroll"
              class="text-primary fs-2xl"
            />
          </div>
          <div>
            <h1 class="fs-2xl font-bold text-foreground">CScrollbar 滚动条组件</h1>
            <p class="text-muted-foreground">基于 OverlayScrollbars 的高性能滚动容器组件</p>
          </div>
        </div>
      </div>

      <!-- Control Panel -->
      <Card class="border border-border">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-settings"
              class="text-primary"
            />
            <span>Controls 控制面板</span>
          </div>
        </template>
        <template #content>
          <div class="flex flex-wrap items-center gap-lg">
            <div class="flex flex-col gap-sm">
              <span class="text-muted-foreground fs-sm">可见性模式 (Visibility Mode)</span>
              <SelectButton
                v-model="visibility"
                :options="visibilityOptions"
                option-label="label"
                option-value="value"
              />
            </div>
            <div class="h-8 w-px bg-border mx-gap-md hidden md:block" />
            <div class="flex gap-sm flex-wrap">
              <Button
                label="滚动至顶部"
                icon="i-lucide-arrow-up-to-line"
                severity="secondary"
                outlined
                @click="scrollToTop"
              />
              <Button
                label="滚动至底部"
                icon="i-lucide-arrow-down-to-line"
                severity="secondary"
                outlined
                @click="scrollToBottom"
              />
              <Button
                label="检查状态"
                icon="i-lucide-bug"
                severity="info"
                @click="checkState"
              />
              <Button
                label="清空日志"
                icon="i-lucide-trash-2"
                severity="danger"
                text
                @click="logs = []"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Demo Section -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-lg">
        <!-- Vertical Scroll Demo -->
        <Card class="border border-border lg:col-span-2">
          <template #title>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-sm">
                <Icons
                  name="i-lucide-arrow-up-down"
                  class="text-primary"
                />
                <span>纵向滚动 (Vertical Scroll)</span>
              </div>
              <Tag
                value="h-full"
                severity="secondary"
              />
            </div>
          </template>
          <template #content>
            <div class="scroll-demo-vertical -mt-2">
              <CScrollbar
                ref="scrollbarRef"
                :visibility="visibility"
                class="h-full"
                @initialized="handleInitialized"
                @updated="handleUpdated"
                @scroll="handleScroll"
              >
                <div class="p-padding-sm space-y-3">
                  <div
                    v-for="item in items"
                    :key="item.id"
                    class="p-padding-md rounded-scale-md border border-border bg-card hover:bg-accent/50 transition-colors group cursor-default"
                  >
                    <div class="flex justify-between items-start mb-1">
                      <span class="font-medium fs-sm group-hover:text-primary transition-colors">
                        {{ item.title }}
                      </span>
                      <span class="fs-xs text-muted-foreground">{{ item.date }}</span>
                    </div>
                    <p class="fs-xs text-muted-foreground leading-relaxed">
                      {{ item.desc }}
                    </p>
                  </div>
                </div>
              </CScrollbar>
            </div>
          </template>
        </Card>

        <!-- Right Side -->
        <div class="flex flex-col gap-lg lg:col-span-3">
          <!-- Horizontal Scroll Demo -->
          <Card class="border border-border">
            <template #title>
              <div class="flex items-center gap-sm">
                <Icons
                  name="i-lucide-arrow-left-right"
                  class="text-primary"
                />
                <span>横向滚动 (Horizontal Scroll)</span>
              </div>
            </template>
            <template #content>
              <div class="scroll-demo-horizontal -mt-2">
                <CScrollbar
                  :visibility="visibility"
                  class="h-full"
                >
                  <div class="flex p-padding-sm gap-md w-max h-full items-center">
                    <div
                      v-for="item in horizontalItems"
                      :key="item"
                      class="scroll-demo-tile rounded-scale-md border border-border bg-gradient-to-br from-background to-muted flex items-center justify-center shrink-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                    >
                      <span class="font-medium text-muted-foreground">{{ item }}</span>
                    </div>
                  </div>
                </CScrollbar>
              </div>
            </template>
          </Card>

          <!-- Event Logs -->
          <Card class="border border-border flex-1">
            <template #title>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-sm">
                  <Icons
                    name="i-lucide-terminal"
                    class="text-primary"
                  />
                  <span>事件日志 (Event Logs)</span>
                </div>
                <Tag
                  :value="`${logs.length} events`"
                  severity="secondary"
                />
              </div>
            </template>
            <template #content>
              <div class="scroll-demo-logs bg-card rounded-scale-md -mt-2">
                <CScrollbar class="h-full">
                  <div class="p-padding-md font-mono fs-xs space-y-1">
                    <div
                      v-if="logs.length === 0"
                      class="text-muted-foreground italic select-none py-8 text-center"
                    >
                      等待事件...
                    </div>
                    <div
                      v-for="(log, i) in logs"
                      :key="i"
                      class="break-all border-b border-white/5 pb-0.5 mb-0.5 last:border-0"
                      :class="log.includes('Action') ? 'text-info font-bold' : 'text-success/80'"
                    >
                      {{ log }}
                    </div>
                  </div>
                </CScrollbar>
              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- Code Examples -->
      <Card class="border border-border">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-code"
              class="text-primary"
            />
            <span>Code Examples 代码示例</span>
            <Tag
              value="Click to copy"
              severity="info"
            />
          </div>
        </template>
        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div
              v-for="example in usageExamples"
              :key="example.title"
              class="flex flex-col gap-sm"
            >
              <h4 class="font-semibold text-foreground flex items-center gap-sm">
                {{ example.title }}
                <Button
                  icon="i-lucide-copy"
                  severity="secondary"
                  text
                  size="small"
                  @click="copyToClipboard(example.code, example.title)"
                />
              </h4>
              <div
                class="rounded-scale-md cursor-pointer hover:bg-muted/70 transition-colors"
                @click="copyToClipboard(example.code, example.title)"
              >
                <CScrollbar class="min-w-0">
                  <pre
                    class="m-0 bg-muted/50 p-padding-md fs-sm"
                  ><code class="text-foreground">{{ example.code }}</code></pre>
                </CScrollbar>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Props Reference -->
      <Card class="border border-border">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-book-open"
              class="text-primary"
            />
            <span>Props & Events 属性与事件</span>
          </div>
        </template>
        <template #content>
          <CScrollbar class="w-full min-w-0">
            <table class="w-full border-collapse fs-sm">
              <thead>
                <tr class="border-b border-border">
                  <th class="text-left p-padding-sm text-muted-foreground font-medium">属性名</th>
                  <th class="text-left p-padding-sm text-muted-foreground font-medium">类型</th>
                  <th class="text-left p-padding-sm text-muted-foreground font-medium">默认值</th>
                  <th class="text-left p-padding-sm text-muted-foreground font-medium">描述</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-border/50">
                  <td class="p-padding-sm font-mono text-primary">options</td>
                  <td class="p-padding-sm font-mono text-muted-foreground">
                    OverlayScrollbarsOptions
                  </td>
                  <td class="p-padding-sm font-mono">-</td>
                  <td class="p-padding-sm">OverlayScrollbars 配置对象</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="p-padding-sm font-mono text-primary">visibility</td>
                  <td class="p-padding-sm font-mono text-muted-foreground">
                    'auto' | 'visible' | 'hidden'
                  </td>
                  <td class="p-padding-sm font-mono">'auto'</td>
                  <td class="p-padding-sm">滚动条可见性模式</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="p-padding-sm font-mono text-primary">@initialized</td>
                  <td class="p-padding-sm font-mono text-muted-foreground">(instance) => void</td>
                  <td class="p-padding-sm font-mono">-</td>
                  <td class="p-padding-sm">初始化完成事件</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="p-padding-sm font-mono text-primary">@updated</td>
                  <td class="p-padding-sm font-mono text-muted-foreground">(instance) => void</td>
                  <td class="p-padding-sm font-mono">-</td>
                  <td class="p-padding-sm">更新事件</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="p-padding-sm font-mono text-primary">@scroll</td>
                  <td class="p-padding-sm font-mono text-muted-foreground">
                    (instance, event) => void
                  </td>
                  <td class="p-padding-sm font-mono">-</td>
                  <td class="p-padding-sm">滚动事件</td>
                </tr>
              </tbody>
            </table>
          </CScrollbar>
        </template>
      </Card>
    </div>
  </CScrollbar>
</template>

<style lang="scss" scoped>
/* 演示区固定高度，用于滚动行为展示（仅使用 CSS 变量，便于主题/尺寸系统扩展） */
.scroll-demo-vertical {
  height: var(--scroll-demo-vertical-h, 25rem);
}
.scroll-demo-horizontal {
  height: var(--scroll-demo-horizontal-h, 8.75rem);
}
.scroll-demo-logs {
  height: var(--scroll-demo-logs-h, 11.25rem);
}
.scroll-demo-tile {
  width: var(--scroll-demo-tile-w, 10rem);
  height: var(--scroll-demo-tile-h, 6.25rem);
}

pre {
  margin: 0;
}
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
