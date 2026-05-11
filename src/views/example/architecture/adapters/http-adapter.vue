<script setup lang="ts">
import { z } from 'zod'
import { parseSafeObject, parseZodHttpPayload } from '@/adapters/http.adapter'

defineOptions({ name: 'ArchitectureAdapterHttp' })

const adapterUserSchema = z.object({
  userId: z.number(),
  username: z.string(),
  roles: z.array(z.string()),
})

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
  try {
    const result = parseZodHttpPayload(adapterUserSchema, raw)
    return {
      isJsonError: false,
      isAccepted: true,
      result,
      errorMsg: null,
    }
  } catch (e) {
    return {
      isJsonError: false,
      isAccepted: false,
      result: parseSafeObject(raw, {}),
      errorMsg: e instanceof Error ? e.message : 'Schema validation failed',
    }
  }
})

const safeObjectPreview = computed<unknown>(() => {
  try {
    return parseSafeObject(JSON.parse(playgroundInput.value), {})
  } catch {
    return {}
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
                  name="i-lucide-globe"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">HTTP Adapter</span>
                  <span class="surface-warn rounded-md px-sm py-xs text-xs font-semibold uppercase">
                    ADAPTER
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  parseZodHttpPayload() — 使用 Zod 校验 HTTP 响应 DTO，失败抛出 HttpRequestError
                </span>
              </div>
            </div>
            <Tag
              value="@/adapters/http.adapter"
              severity="secondary"
              class="shrink-0"
            />
          </div>
          <p class="text-sm text-muted-foreground m-0">
            HTTP 数据进入业务逻辑前必须经过边界校验。
            <code class="code-inline">parseZodHttpPayload</code>
            是当前 DTO schema 边界；
            <code class="code-inline">parseSafeObject</code>
            仅用于需要对象 fallback 的兼容场景。
          </p>
        </header>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <div class="row-start gap-xs min-w-0">
            <Icons
              name="i-lucide-play"
              size="sm"
              class="text-muted-foreground"
            />
            <span class="text-sm font-semibold text-foreground text-no-wrap">Live Playground</span>
          </div>
          <Textarea
            v-model="playgroundInput"
            :rows="6"
            class="font-mono text-sm w-full"
            placeholder="Paste raw JSON here..."
          />
          <div class="row-between min-w-0">
            <span class="text-sm text-muted-foreground">parseZodHttpPayload(schema, raw) →</span>
            <Tag
              :value="
                playgroundResult.isJsonError
                  ? 'JSON Parse Error'
                  : playgroundResult.isAccepted
                    ? 'Accepted — schema valid'
                    : 'Rejected — HttpRequestError(VALIDATION)'
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
            class="code-block"
            >{{ JSON.stringify(playgroundResult.result, null, 2) }}</pre
          >
          <Message
            v-if="!playgroundResult.isJsonError && !playgroundResult.isAccepted"
            severity="warn"
            :closable="false"
          >
            {{ playgroundResult.errorMsg }}
          </Message>
        </section>

        <section class="glass-card col-stretch gap-md min-w-0">
          <div class="row-start gap-xs min-w-0">
            <Icons
              name="i-lucide-test-tubes"
              size="sm"
              class="text-muted-foreground"
            />
            <span class="text-sm font-semibold text-foreground text-no-wrap">Test Cases</span>
          </div>
          <div class="col-stretch gap-xs min-w-0">
            <div
              v-for="tc in testCases"
              :key="tc.label"
              class="row-between py-xs border-b border-border last:border-0"
            >
              <div class="col-stretch gap-xs min-w-0">
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

        <section class="glass-card col-stretch gap-md min-w-0">
          <div class="row-start gap-xs min-w-0">
            <Icons
              name="i-lucide-code"
              size="sm"
              class="text-muted-foreground"
            />
            <span class="text-sm font-semibold text-foreground text-no-wrap">Source</span>
          </div>
          <pre class="code-block">
const userSchema = z.object({
  userId: z.number(),
  username: z.string(),
  roles: z.array(z.string()),
})

export function parseZodHttpPayload&lt;T&gt;(schema: ZodType&lt;T&gt;, raw: unknown): T {
  const result = schema.safeParse(raw)
  if (result.success) return result.data
  throw new HttpRequestError(
    'HTTP adapter schema validation failed',
    ErrorType.VALIDATION,
    undefined,
    undefined,
    { issues: normalizeZodIssues(result.error.issues) },
    false
  )
}</pre
          >
          <p class="text-sm text-muted-foreground m-0">
            当前 HTTP DTO 边界优先使用 Zod schema，并在失败时抛出
            <code class="code-inline">HttpRequestError(ErrorType.VALIDATION)</code>
            。对象兜底仍可通过
            <code class="code-inline">parseSafeObject(raw, fallback)</code>
            获取：{{ JSON.stringify(safeObjectPreview) }}
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
