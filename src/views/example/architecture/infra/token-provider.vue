<script setup lang="ts">
import { getToken } from '@/infra/auth/tokenProvider'

defineOptions({ name: 'ArchitectureInfraTokenProvider' })

const userStore = useUserStoreWithOut()

// Re-read through the provider whenever the store token changes
const tokenValue = computed<string | null | undefined>(() => {
  void userStore.token // reactive dependency
  return getToken()
})
const hasToken = computed<boolean>(() => !!tokenValue.value)
const tokenPreview = computed<string>(() => {
  const t = tokenValue.value
  if (!t) return '—'
  return `${t.slice(0, 8)}…[${t.length} chars]`
})
const pageReady = ref<boolean>(true)
</script>

<template>
  <div
    class="col-stretch"
    data-archetype="A1-toolbar-content"
  >
    <AnimateWrapper
      :show="pageReady"
      enter="fadeInUp"
      leave="fadeOut"
    >
      <div class="col-stretch gap-md min-h-0 min-w-0">
        <div class="layout-narrow col-stretch gap-md min-w-0">
          <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
            <div class="row-between gap-md min-w-0">
              <div class="row-start gap-sm min-w-0 flex-wrap">
                <div class="glass-icon-box shrink-0">
                  <Icons
                    name="i-lucide-key-round"
                    size="xl"
                    class="text-primary"
                  />
                </div>
                <div class="col-stretch gap-xs min-w-0">
                  <div class="row-start gap-xs min-w-0 flex-wrap">
                    <span class="text-lg font-bold text-foreground text-no-wrap">
                      Token Provider
                    </span>
                    <span
                      class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      INFRA
                    </span>
                  </div>
                  <span class="text-sm text-muted-foreground text-ellipsis-1">
                    依赖注入 — HTTP 层通过 Provider 获取 Token，无需直接依赖 Pinia Store
                  </span>
                </div>
              </div>
              <Tag
                :value="hasToken ? 'Token Present' : 'No Token'"
                :severity="hasToken ? 'success' : 'warn'"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-md min-w-0">
              <div class="col-stretch gap-xs bg-muted rounded-lg p-md min-w-0">
                <span class="text-xs text-muted-foreground">getToken() status</span>
                <span
                  class="text-sm font-mono font-bold"
                  :class="hasToken ? 'text-success' : 'text-muted-foreground'"
                >
                  {{ hasToken ? 'present' : 'absent' }}
                </span>
              </div>
              <div class="col-stretch gap-xs bg-muted rounded-lg p-md sm:col-span-2 min-w-0">
                <span class="text-xs text-muted-foreground">getToken() preview</span>
                <span class="text-sm font-mono text-foreground">{{ tokenPreview }}</span>
              </div>
            </div>
          </header>

          <section class="material-elevated col-stretch gap-md min-w-0">
            <h3 class="text-md font-semibold text-foreground m-0">Architecture Diagram</h3>
            <div class="col-stretch gap-xs min-w-0">
              <div class="grid grid-cols-3 gap-sm items-center text-center min-w-0">
                <div class="border border-border rounded-md p-sm col-stretch gap-xs min-w-0">
                  <Icons
                    name="i-lucide-database"
                    size="sm"
                    class="text-foreground mx-auto"
                  />
                  <span class="text-xs font-semibold text-foreground">Pinia Store</span>
                  <span class="text-xs text-muted-foreground">userStore.token</span>
                </div>
                <div class="col-center gap-xs px-xs min-w-0">
                  <span class="text-xs text-muted-foreground font-mono text-ellipsis-1">
                    setTokenProvider(fn)
                  </span>
                  <div class="w-full border-t border-border" />
                  <Icons
                    name="i-lucide-arrow-right"
                    size="xs"
                    class="text-primary"
                  />
                  <span class="text-xs text-muted-foreground font-mono text-ellipsis-1">
                    getToken()
                  </span>
                </div>
                <div
                  class="border border-primary/40 bg-primary/5 rounded-md p-sm col-stretch gap-xs min-w-0"
                >
                  <Icons
                    name="i-lucide-shield"
                    size="sm"
                    class="text-primary mx-auto"
                  />
                  <span class="text-xs font-semibold text-foreground">Token Provider</span>
                  <span class="text-xs text-muted-foreground">infra/auth/</span>
                </div>
              </div>
              <div class="col-center gap-xs py-xs min-w-0">
                <div class="w-px h-6 bg-border" />
                <Icons
                  name="i-lucide-arrow-down"
                  size="xs"
                  class="text-muted-foreground"
                />
              </div>
              <div
                class="border border-border rounded-md p-sm col-stretch gap-xs text-center max-w-sm mx-auto w-full min-w-0"
              >
                <Icons
                  name="i-lucide-network"
                  size="sm"
                  class="text-foreground mx-auto"
                />
                <span class="text-xs font-semibold text-foreground">HTTP Layer</span>
                <span class="text-xs text-muted-foreground">
                  axios interceptor → Authorization header
                </span>
              </div>
            </div>
            <p class="text-sm text-muted-foreground m-0">
              HTTP 层完全不感知 Pinia。应用入口（main.ts）通过
              <code class="code-inline">setTokenProvider()</code>
              注入 getter 函数；HTTP 拦截器调用
              <code class="code-inline">getToken()</code>
              获取当前 Token，满足 Infra → State 单向依赖约束，避免循环导入。
            </p>
          </section>

          <section class="material-elevated col-stretch gap-md min-w-0">
            <h3 class="text-md font-semibold text-foreground m-0">API Reference</h3>
            <div class="col-stretch gap-md min-w-0">
              <div class="col-stretch gap-xs min-w-0">
                <span class="text-xs font-semibold text-muted-foreground">
                  setTokenProvider(fn)
                </span>
                <pre class="code-block">
// main.ts — 应用入口注入
import { setTokenProvider } from '@/infra/auth/tokenProvider'
setTokenProvider(() => useUserStoreWithOut().getToken)</pre
                >
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <span class="text-xs font-semibold text-muted-foreground">getToken()</span>
                <pre class="code-block">
// axios interceptor — HTTP 层消费
import { getToken } from '@/infra/auth/tokenProvider'
const token = getToken()
if (token) config.headers.Authorization = `Bearer ${token}`</pre
                >
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <span class="text-xs font-semibold text-muted-foreground">
                  setOnUnauthorized(fn)
                </span>
                <pre class="code-block">
// main.ts — 注入 401 回调
import { setOnUnauthorized } from '@/infra/auth/tokenProvider'
setOnUnauthorized(() => useUserStoreWithOut().logout())</pre
                >
              </div>
            </div>
          </section>
        </div>
      </div>
    </AnimateWrapper>
  </div>
</template>
