<script setup lang="ts">
import { parseSafeObject } from '@/adapters/http.adapter'

defineOptions({ name: 'ArchitectureAdapterHttp' })

const playgroundInput = ref<string>(`{
  "userId": 42,
  "username": "alice",
  "roles": ["admin", "editor"]
}`)

interface PlaygroundResult {
  isJsonError: boolean
  isAccepted: boolean
  result: unknown
  errorMsg: string | null
}

const playgroundResult = computed<PlaygroundResult>(() => {
  let raw: unknown
  try {
    raw = JSON.parse(playgroundInput.value)
  } catch (e) {
    return {
      isJsonError: true,
      isAccepted: false,
      result: null,
      errorMsg: e instanceof Error ? e.message : 'JSON parse error',
    }
  }
  const isAccepted: boolean = !!raw && typeof raw === 'object' && !Array.isArray(raw)
  return {
    isJsonError: false,
    isAccepted,
    result: parseSafeObject(raw, {}),
    errorMsg: null,
  }
})

interface TestCase {
  label: string
  display: string
  raw: unknown
}

const testCases: TestCase[] = [
  { label: 'Plain Object', display: '{ "id": 1, "name": "Alice" }', raw: { id: 1, name: 'Alice' } },
  { label: 'Array', display: '[1, 2, 3]', raw: [1, 2, 3] },
  { label: 'null', display: 'null', raw: null },
  { label: 'String', display: '"hello"', raw: 'hello' },
]

function isCaseAccepted(raw: unknown): boolean {
  return !!raw && typeof raw === 'object' && !Array.isArray(raw)
}
</script>

<template>
  <div class="animate__animated animate__fadeIn col-stretch gap-md">
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between items-center">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">HTTP Adapter</h2>
            <p class="text-sm text-muted-foreground m-0">
              parseSafeObject&lt;T&gt;() — 校验 HTTP 响应原始 JSON，保证始终返回安全对象
            </p>
          </div>
          <Tag
            value="@/adapters/http.adapter"
            severity="secondary"
          />
        </div>
        <Divider />
        <p class="text-sm text-muted-foreground m-0">
          HTTP 数据进入业务逻辑前必须经过边界校验。
          <code class="font-mono text-xs text-foreground">parseSafeObject</code>
          拒绝数组、null、原始类型，仅接受非数组对象；拒绝时返回 fallback
          默认值，确保下游始终拿到安全结构。
        </p>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">Live Playground</h3>
        <Divider />
        <Textarea
          v-model="playgroundInput"
          :rows="6"
          class="font-mono text-sm w-full"
          placeholder="Paste raw JSON here..."
        />
        <div class="row-between items-center">
          <span class="text-sm text-muted-foreground">parseSafeObject(raw, {}) →</span>
          <Tag
            :value="
              playgroundResult.isJsonError
                ? 'JSON Parse Error'
                : playgroundResult.isAccepted
                  ? 'Accepted — valid object ✓'
                  : 'Rejected — not a plain object ✗'
            "
            :severity="playgroundResult.isAccepted ? 'success' : 'danger'"
          />
        </div>
        <Message
          v-if="playgroundResult.isJsonError"
          severity="error"
          :closable="false"
        >
          {{ playgroundResult.errorMsg }}
        </Message>
        <pre
          v-else
          class="text-xs font-mono text-foreground bg-muted rounded-md p-sm overflow-x-auto"
          >{{ JSON.stringify(playgroundResult.result, null, 2) }}</pre
        >
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">Test Cases</h3>
        <Divider />
        <div class="col-stretch gap-xs">
          <div
            v-for="tc in testCases"
            :key="tc.label"
            class="row-between items-center py-xs border-b border-border last:border-0"
          >
            <div class="col-stretch gap-xs">
              <span class="text-sm font-medium text-foreground">{{ tc.label }}</span>
              <span class="text-xs font-mono text-muted-foreground">{{ tc.display }}</span>
            </div>
            <Tag
              :value="isCaseAccepted(tc.raw) ? 'Accepted ✓' : 'Rejected ✗'"
              :severity="isCaseAccepted(tc.raw) ? 'success' : 'danger'"
            />
          </div>
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">Source</h3>
        <Divider />
        <pre class="text-xs font-mono text-foreground bg-muted rounded-md p-sm overflow-x-auto">
export function parseSafeObject&lt;T extends object&gt;(raw: unknown, fallback: T): T {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return fallback
  }
  return raw as T
}</pre
        >
        <p class="text-sm text-muted-foreground m-0">
          泛型参数
          <code class="font-mono text-xs text-foreground">T</code>
          让 TypeScript 自动推断返回类型。 在 API 边界处使用：
          <code class="font-mono text-xs text-foreground">
            parseSafeObject&lt;UserInfo&gt;(res.data, defaultUserInfo)
          </code>
          。
        </p>
      </section>
    </div>
  </div>
</template>
