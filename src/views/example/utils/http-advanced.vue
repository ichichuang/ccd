<script setup lang="ts">
import { jsonPlaceholderPostSchema, type JsonPlaceholderPostDTO } from '@/api/example/httpAdvanced'
import { get, getCacheStats, getRequestStats, clearCache, clearRequests } from '@/utils/http'
import type { CacheStats, RequestStats, RetryConfig } from '@/utils/http'
import { DateUtils } from '@/utils/date/dateUtils'

defineOptions({ name: 'ExampleUtilHttpAdvanced' })

const BASE_URL = 'https://jsonplaceholder.typicode.com'

// ── Shared state ──────────────────────────────────────────────────
const eventLog = ref<string[]>([])
const MAX_LOG = 40

function addLog(msg: string): void {
  eventLog.value.unshift(`[${DateUtils.format(DateUtils.now(), 'HH:mm:ss')}] ${msg}`)
  if (eventLog.value.length > MAX_LOG) eventLog.value.length = MAX_LOG
}

// ── Section 1: Cache Demo ─────────────────────────────────────────
const cacheStats = ref<CacheStats>({ size: 0 })
const cacheResult = ref<string>('')
const cacheLoading = ref<boolean>(false)
const cacheElapsed = ref<number>(0)

function refreshCacheStats(): void {
  cacheStats.value = getCacheStats()
}

async function runCacheDemo(): Promise<void> {
  cacheLoading.value = true
  cacheResult.value = ''
  const start = performance.now()
  try {
    const data = await get<JsonPlaceholderPostDTO>(`${BASE_URL}/posts/1`, {
      enableCache: true,
      cacheTTL: 30000,
      responseSchema: jsonPlaceholderPostSchema,
    })
    cacheElapsed.value = Math.round(performance.now() - start)
    cacheResult.value = JSON.stringify(data, null, 2)
    refreshCacheStats()
    addLog(`Cache GET: ${cacheElapsed.value}ms — stats: size=${cacheStats.value.size}`)
  } catch (err) {
    addLog(`Cache GET error: ${err instanceof Error ? err.message : 'unknown'}`)
  } finally {
    cacheLoading.value = false
  }
}

function onClearCache(): void {
  clearCache()
  refreshCacheStats()
  addLog('Cache cleared')
}

// ── Section 2: Dedup Demo ─────────────────────────────────────────
const dedupResults = ref<string[]>([])
const dedupLoading = ref<boolean>(false)

async function runDedupDemo(): Promise<void> {
  dedupLoading.value = true
  dedupResults.value = []
  addLog('Dedup: firing 5 identical requests concurrently...')

  const promises = Array.from({ length: 5 }, (_, i) =>
    get<JsonPlaceholderPostDTO>(`${BASE_URL}/posts/2`, {
      deduplicate: true,
      responseSchema: jsonPlaceholderPostSchema,
    })
      .then(d => `#${i + 1}: ${d.title?.slice(0, 30) ?? '—'}`)
      .catch(() => `#${i + 1}: error`)
  )
  dedupResults.value = await Promise.all(promises)
  const stats = getRequestStats()
  addLog(`Dedup done — all 5 resolved (only 1 network call). Pending: ${stats.pendingRequests}`)
  dedupLoading.value = false
}

// ── Section 3: Retry Demo ─────────────────────────────────────────
const retryLoading = ref<boolean>(false)
const retryLog = ref<string>('')

async function runRetryDemo(): Promise<void> {
  retryLoading.value = true
  retryLog.value = '请求中...'
  addLog('Retry: requesting invalid endpoint with 2 retries, 500ms delay...')

  const retryConfig: RetryConfig = {
    retries: 2,
    retryDelay: 500,
    retryCondition: (err: Error) => {
      addLog(`Retry condition check: ${err.message}`)
      return true
    },
  }

  const start = performance.now()
  try {
    await get<JsonPlaceholderPostDTO>(`${BASE_URL}/posts/99999`, {
      retry: retryConfig,
      responseSchema: jsonPlaceholderPostSchema,
      globalError: 'silent',
    })
    retryLog.value = '意外成功'
  } catch (err) {
    const elapsed = Math.round(performance.now() - start)
    retryLog.value = `失败 (${elapsed}ms): ${err instanceof Error ? err.message : 'unknown'}`
    addLog(`Retry exhausted after ${elapsed}ms`)
  } finally {
    retryLoading.value = false
  }
}

// ── Section 4: Cancel Demo ────────────────────────────────────────
const cancelLoading = ref<boolean>(false)
const cancelResult = ref<string>('')
let abortController: AbortController | null = null

async function runCancelDemo(): Promise<void> {
  abortController = new AbortController()
  cancelLoading.value = true
  cancelResult.value = '请求已发起...'
  addLog('Cancel: request started (click abort to cancel)')

  try {
    const data = await get<JsonPlaceholderPostDTO>(`${BASE_URL}/posts/3`, {
      signal: abortController.signal,
      responseSchema: jsonPlaceholderPostSchema,
    })
    cancelResult.value = `成功: ${data.title}`
    addLog('Cancel: request completed before abort')
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      cancelResult.value = '请求已被手动中止 (AbortError)'
      addLog('Cancel: request aborted successfully')
    } else {
      cancelResult.value = `错误: ${err instanceof Error ? err.message : 'unknown'}`
    }
  } finally {
    cancelLoading.value = false
    abortController = null
  }
}

function abortRequest(): void {
  if (abortController) {
    abortController.abort()
    addLog('Cancel: abort() called')
  }
}

// ── Section 5: Request Stats ──────────────────────────────────────
const reqStats = ref<RequestStats>({
  pendingRequests: 0,
  queueLength: 0,
  runningCount: 0,
  maxConcurrent: 10,
})

function refreshReqStats(): void {
  reqStats.value = getRequestStats()
}

function onClearRequests(): void {
  clearRequests()
  refreshReqStats()
  addLog('Request queue cleared')
}

// Auto-refresh stats periodically
const { pause: pauseStats, resume: resumeStats } = useIntervalFn(
  () => {
    refreshCacheStats()
    refreshReqStats()
  },
  2000,
  { immediate: true }
)

onUnmounted(() => {
  pauseStats()
})

onMounted(() => {
  resumeStats()
  refreshCacheStats()
  refreshReqStats()
})
</script>

<template>
  <div
    class="col-stretch"
    data-archetype="A1-toolbar-content"
  >
    <div class="col-stretch gap-md min-h-0 min-w-0">
      <div class="layout-narrow col-stretch gap-md min-w-0">
        <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
          <div class="row-between gap-md min-w-0">
            <div class="row-start gap-sm min-w-0 flex-wrap">
              <div class="glass-icon-box shrink-0">
                <Icons
                  name="i-lucide-radar"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">HTTP Advanced</span>
                  <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                    UTIL
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  低层工具示例：演示缓存 / 去重 / 重试 / 中止 / 请求统计，并使用 DTO schema
                  校验响应。
                </span>
              </div>
            </div>
          </div>
          <div class="text-xs text-muted-foreground">
            覆盖能力：enableCache · cacheTTL · getCacheStats · deduplicate · RetryConfig ·
            AbortController · getRequestStats。
          </div>
        </header>

        <!-- Live Stats Bar -->
        <section
          class="material-elevated row-between gap-lg flex-wrap bg-primary/5 border-primary/20 min-w-0"
        >
          <div class="row-center gap-md min-w-0">
            <Icons
              name="i-lucide-activity"
              class="text-primary"
            />
            <span class="font-bold text-foreground uppercase tracking-tight text-sm">实时状态</span>
          </div>
          <div class="row-center gap-lg flex-wrap min-w-0">
            <div class="col-stretch gap-xs items-center">
              <span class="text-xs text-muted-foreground">缓存条目</span>
              <span class="text-lg font-bold text-foreground font-mono">
                {{ cacheStats.size }}
              </span>
            </div>
            <div class="col-stretch gap-xs items-center">
              <span class="text-xs text-muted-foreground">排队</span>
              <span class="text-lg font-bold text-foreground font-mono">
                {{ reqStats.queueLength }}
              </span>
            </div>
            <div class="col-stretch gap-xs items-center">
              <span class="text-xs text-muted-foreground">运行中</span>
              <span class="text-lg font-bold text-foreground font-mono">
                {{ reqStats.runningCount }}
              </span>
            </div>
            <div class="col-stretch gap-xs items-center">
              <span class="text-xs text-muted-foreground">并发上限</span>
              <span class="text-lg font-bold text-foreground font-mono">
                {{ reqStats.maxConcurrent }}
              </span>
            </div>
            <div class="row-center gap-sm min-w-0">
              <Button
                label="清缓存"
                size="small"
                severity="secondary"
                variant="text"
                @click="onClearCache"
              />
              <Button
                label="清队列"
                size="small"
                severity="secondary"
                variant="text"
                @click="onClearRequests"
              />
            </div>
          </div>
        </section>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-md min-w-0">
          <!-- Section 1: Cache -->
          <section class="material-elevated col-stretch gap-lg min-w-0">
            <div class="row-center gap-sm pb-sm mb-sm min-w-0">
              <Icons
                name="i-lucide-database"
                class="text-primary"
              />
              <div class="col-stretch gap-xs min-w-0">
                <span class="font-bold text-foreground uppercase tracking-tight">
                  缓存 / enableCache + cacheTTL
                </span>
                <span class="text-xs text-muted-foreground">
                  第一次请求走网络，第二次命中缓存（30s TTL）。
                </span>
              </div>
            </div>

            <div class="col-stretch gap-md min-w-0">
              <div class="row-start gap-sm min-w-0">
                <Button
                  label="GET /posts/1"
                  size="small"
                  :loading="cacheLoading"
                  @click="runCacheDemo"
                />
                <Tag
                  v-if="cacheElapsed > 0"
                  :value="`${cacheElapsed}ms`"
                  :severity="cacheElapsed < 10 ? 'success' : 'info'"
                />
              </div>
              <pre
                v-if="cacheResult"
                class="code-preview text-xs text-muted-foreground m-0"
                >{{ cacheResult }}</pre
              >
            </div>
          </section>

          <!-- Section 2: Dedup -->
          <section class="material-elevated col-stretch gap-lg min-w-0">
            <div class="row-center gap-sm pb-sm mb-sm min-w-0">
              <Icons
                name="i-lucide-copy-check"
                class="text-primary"
              />
              <div class="col-stretch gap-xs min-w-0">
                <span class="font-bold text-foreground uppercase tracking-tight">
                  去重 / deduplicate
                </span>
                <span class="text-xs text-muted-foreground">
                  同时发起 5 个相同请求，实际仅执行 1 次网络调用。
                </span>
              </div>
            </div>

            <div class="col-stretch gap-md min-w-0">
              <Button
                label="发起 5 个并发 GET /posts/2"
                size="small"
                :loading="dedupLoading"
                @click="runDedupDemo"
              />
              <div
                v-if="dedupResults.length > 0"
                class="col-stretch gap-xs min-w-0"
              >
                <div
                  v-for="(r, i) in dedupResults"
                  :key="i"
                  class="text-xs text-muted-foreground row-center gap-xs min-w-0"
                >
                  <Tag
                    :value="`P${i + 1}`"
                    severity="secondary"
                    class="text-xs"
                  />
                  <span>{{ r }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Section 3: Retry -->
          <section class="material-elevated col-stretch gap-lg min-w-0">
            <div class="row-center gap-sm pb-sm mb-sm min-w-0">
              <Icons
                name="i-lucide-refresh-cw"
                class="text-primary"
              />
              <div class="col-stretch gap-xs min-w-0">
                <span class="font-bold text-foreground uppercase tracking-tight">
                  重试 / RetryConfig
                </span>
                <span class="text-xs text-muted-foreground">
                  请求无效端点，配置 2 次重试 + 500ms 延迟。
                </span>
              </div>
            </div>

            <div class="col-stretch gap-md min-w-0">
              <div class="bg-muted rounded-md px-md py-sm text-xs text-muted-foreground">
                <code>{ retries: 2, retryDelay: 500, retryCondition: () => true }</code>
              </div>
              <Button
                label="GET /posts/99999 (触发重试)"
                size="small"
                severity="warn"
                :loading="retryLoading"
                @click="runRetryDemo"
              />
              <div
                v-if="retryLog"
                class="text-xs text-muted-foreground"
              >
                {{ retryLog }}
              </div>
            </div>
          </section>

          <!-- Section 4: Cancel -->
          <section class="material-elevated col-stretch gap-lg min-w-0">
            <div class="row-center gap-sm pb-sm mb-sm min-w-0">
              <Icons
                name="i-lucide-x-circle"
                class="text-primary"
              />
              <div class="col-stretch gap-xs min-w-0">
                <span class="font-bold text-foreground uppercase tracking-tight">
                  中止 / AbortController
                </span>
                <span class="text-xs text-muted-foreground">
                  发起请求后立即中止，观测 AbortError。
                </span>
              </div>
            </div>

            <div class="col-stretch gap-md min-w-0">
              <div class="row-start gap-sm min-w-0">
                <Button
                  label="发起请求"
                  size="small"
                  :loading="cancelLoading"
                  @click="runCancelDemo"
                />
                <Button
                  label="中止请求"
                  size="small"
                  severity="danger"
                  :disabled="!cancelLoading"
                  @click="abortRequest"
                />
              </div>
              <div
                v-if="cancelResult"
                class="text-xs text-muted-foreground"
              >
                {{ cancelResult }}
              </div>
            </div>
          </section>
        </div>

        <!-- Section 5: API Reference -->
        <section class="material-elevated col-stretch gap-lg min-w-0">
          <div class="row-center gap-sm pb-sm mb-sm min-w-0">
            <Icons
              name="i-lucide-upload"
              class="text-primary"
            />
            <div class="col-stretch gap-xs min-w-0">
              <span class="font-bold text-foreground uppercase tracking-tight">
                文件上传 / 下载 API
              </span>
              <span class="text-xs text-muted-foreground">
                uploadFile / uploadFiles / downloadFile — 需要后端支持，此处展示 API 签名。
              </span>
            </div>
          </div>

          <div class="bg-muted rounded-md p-md border-default border-border/40">
            <pre class="code-preview text-xs text-muted-foreground m-0">
// 单文件上传
uploadFile&lt;T&gt;(url: string, file: File, config?: UploadConfig): Promise&lt;T&gt;

// 多文件上传
uploadFiles&lt;T&gt;(url: string, files: File[], config?: UploadConfig): Promise&lt;T&gt;

// 文件下载（触发浏览器下载）
downloadFile(url: string, filename?: string, config?: RequestConfig): Promise&lt;void&gt;

// 分片上传（大文件）
addUploadTask(file: File, config?: UploadChunkConfig): string  // taskId
pauseUploadTask(taskId: string): void
resumeUploadTask(taskId: string): void
cancelUploadTask(taskId: string): void</pre
            >
          </div>
        </section>

        <!-- Event Log -->
        <section class="material-elevated col-stretch gap-md min-w-0">
          <div class="row-between gap-sm min-w-0">
            <div class="row-center gap-sm min-w-0">
              <Icons
                name="i-lucide-terminal"
                class="text-accent"
              />
              <span class="font-bold text-foreground uppercase tracking-tight text-sm">
                事件日志
              </span>
            </div>
            <Button
              label="清空"
              size="small"
              severity="secondary"
              variant="text"
              @click="eventLog = []"
            />
          </div>
          <div
            class="bg-muted rounded-md p-md border-default border-border/40 max-h-48 overflow-y-auto"
          >
            <div
              v-for="(log, i) in eventLog"
              :key="i"
              class="text-xs text-muted-foreground leading-relaxed"
            >
              {{ log }}
            </div>
            <div
              v-if="eventLog.length === 0"
              class="text-xs text-muted-foreground italic"
            >
              点击上方按钮开始操作...
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
