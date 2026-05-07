<script setup lang="ts">
import { alovaInstance } from '@/utils/http/instance'

defineOptions({ name: 'UseHttpRequest' })

interface TodoDTO {
  userId: number
  id: number
  title: string
  completed: boolean
}

const SUCCESS_URL = 'https://jsonplaceholder.typicode.com/todos/1'
const ERROR_URL = 'https://jsonplaceholder.typicode.com/todos/invalid-id'

// Card 1: Manual success trigger
const successReq = useHttpRequest<TodoDTO>(
  (client: typeof alovaInstance) => client.Get<TodoDTO>(SUCCESS_URL),
  { immediate: false, globalLoading: false }
)

// Card 2: Manual error trigger
const errorReq = useHttpRequest<TodoDTO>(
  (client: typeof alovaInstance) => client.Get<TodoDTO>(ERROR_URL),
  { immediate: false, globalLoading: false }
)

// Card 3: Immediate fetch on mount (hook-level immediate)
const immediateReq = useHttpRequest<TodoDTO>(
  (client: typeof alovaInstance) => client.Get<TodoDTO>(SUCCESS_URL),
  { immediate: true, globalLoading: false }
)

const successLoading = computed<boolean>(() => successReq.loading.value)
const errorLoading = computed<boolean>(() => errorReq.loading.value)
const immediateLoading = computed<boolean>(() => immediateReq.loading.value)

const successErrorText = computed<string>(() => {
  const err = successReq.error.value
  if (!err) return '—'
  return `${err.type}:${err.message}`
})

const errorErrorText = computed<string>(() => {
  const err = errorReq.error.value
  if (!err) return '—'
  return `${err.type}:${err.message}`
})

const immediateErrorText = computed<string>(() => {
  const err = immediateReq.error.value
  if (!err) return '—'
  return `${err.type}:${err.message}`
})

const successJson = computed<string>(() => {
  const data = successReq.data.value
  return data ? JSON.stringify(data, null, 2) : '—'
})

const errorJson = computed<string>(() => {
  const data = errorReq.data.value
  return data ? JSON.stringify(data, null, 2) : '—'
})

const immediateJson = computed<string>(() => {
  const data = immediateReq.data.value
  return data ? JSON.stringify(data, null, 2) : '—'
})

const runSuccess = async (): Promise<void> => {
  try {
    await successReq.send()
  } catch {
    // error is exposed by successReq.error
  }
}

const runError = async (): Promise<void> => {
  try {
    await errorReq.send()
  } catch {
    // error is exposed by errorReq.error
  }
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
                  <span class="text-lg font-bold text-foreground text-no-wrap">useHttpRequest</span>
                  <span
                    class="surface-success rounded-md px-sm py-xs text-xs font-semibold uppercase"
                  >
                    HOOK
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  教育性 Hook 边界示例：使用绝对 URL 演示 useHttpRequest 行为，并禁用
                  globalLoading；生产业务请求必须放在 API 模块与业务 Hook 中。
                </span>
              </div>
            </div>
            <div class="row-start flex-wrap gap-sm min-w-0">
              <Tag
                value="manual: immediate=false"
                severity="secondary"
              />
              <Tag
                value="immediate card: immediate=true"
                severity="secondary"
              />
              <Tag
                value="globalLoading=false"
                severity="info"
              />
            </div>
          </div>
        </header>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <h3 class="text-md font-semibold text-foreground m-0">
            Card 1 - Manual Trigger (Success)
          </h3>
          <div class="col-stretch gap-md min-w-0">
            <div class="row-start flex-wrap gap-sm min-w-0">
              <Button
                label="请求成功接口"
                size="small"
                severity="primary"
                :loading="successLoading"
                :disabled="successLoading"
                @click="runSuccess"
              />
              <Tag
                :value="successLoading ? 'loading' : 'idle'"
                severity="secondary"
              />
            </div>
            <div class="col-stretch gap-xs min-w-0">
              <div class="text-sm text-muted-foreground">error</div>
              <Tag
                :value="successErrorText"
                :severity="successReq.error.value ? 'warn' : 'secondary'"
              />
            </div>
            <div class="col-stretch gap-xs min-w-0">
              <div class="text-sm text-muted-foreground">data</div>
              <div class="material-elevated col-stretch p-md gap-sm bg-muted/30 rounded-md min-w-0">
                <pre class="text-xs text-foreground text-no-wrap m-0">{{ successJson }}</pre>
              </div>
            </div>
          </div>
        </section>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <h3 class="text-md font-semibold text-foreground m-0">Card 2 - Error Handling (404)</h3>
          <div class="col-stretch gap-md min-w-0">
            <div class="row-start flex-wrap gap-sm min-w-0">
              <Button
                label="触发 404 请求"
                size="small"
                severity="secondary"
                :loading="errorLoading"
                :disabled="errorLoading"
                @click="runError"
              />
              <Tag
                :value="errorLoading ? 'loading' : 'idle'"
                severity="secondary"
              />
            </div>
            <div class="col-stretch gap-xs min-w-0">
              <div class="text-sm text-muted-foreground">error</div>
              <Tag
                :value="errorErrorText"
                :severity="errorReq.error.value ? 'warn' : 'secondary'"
              />
            </div>
            <div class="col-stretch gap-xs min-w-0">
              <div class="text-sm text-muted-foreground">data</div>
              <div class="material-elevated col-stretch p-md gap-sm bg-muted/30 rounded-md min-w-0">
                <pre class="text-xs text-foreground text-no-wrap m-0">{{ errorJson }}</pre>
              </div>
            </div>
          </div>
        </section>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <h3 class="text-md font-semibold text-foreground m-0">
            Card 3 - Immediate Fetch (Hook Immediate)
          </h3>
          <div class="col-stretch gap-md min-w-0">
            <div class="row-start flex-wrap gap-sm min-w-0">
              <Tag
                :value="immediateLoading ? 'loading' : 'idle'"
                severity="secondary"
              />
              <Tag
                value="immediate=true"
                severity="info"
              />
            </div>
            <div class="col-stretch gap-xs min-w-0">
              <div class="text-sm text-muted-foreground">error</div>
              <Tag
                :value="immediateErrorText"
                :severity="immediateReq.error.value ? 'warn' : 'secondary'"
              />
            </div>
            <div class="col-stretch gap-xs min-w-0">
              <div class="text-sm text-muted-foreground">data</div>
              <div class="material-elevated col-stretch p-md gap-sm bg-muted/30 rounded-md min-w-0">
                <pre class="text-xs text-foreground text-no-wrap m-0">{{ immediateJson }}</pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
