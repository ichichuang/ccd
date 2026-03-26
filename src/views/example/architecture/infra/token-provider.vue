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
</script>

<template>
  <div class="animate__animated animate__fadeIn col-stretch gap-md">
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between items-center">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">Token Provider</h2>
            <p class="text-sm text-muted-foreground m-0">
              依赖注入 — HTTP 层通过 Provider 获取 Token，无需直接依赖 Pinia Store
            </p>
          </div>
          <Tag
            :value="hasToken ? 'Token Present' : 'No Token'"
            :severity="hasToken ? 'success' : 'warn'"
          />
        </div>
        <Divider />

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-md">
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">getToken() status</span>
            <span
              class="text-sm font-mono font-bold"
              :class="hasToken ? 'text-success' : 'text-muted-foreground'"
            >
              {{ hasToken ? 'present' : 'absent' }}
            </span>
          </div>
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md sm:col-span-2">
            <span class="text-xs text-muted-foreground">getToken() preview</span>
            <span class="text-sm font-mono text-foreground">{{ tokenPreview }}</span>
          </div>
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">Architecture Diagram</h3>
        <Divider />
        <div class="col-stretch gap-xs">
          <div class="grid grid-cols-3 gap-sm items-center text-center">
            <div class="border border-border rounded-md p-sm col-stretch gap-xs">
              <Icons
                name="i-lucide-database"
                size="sm"
                class="text-foreground mx-auto"
              />
              <span class="text-xs font-semibold text-foreground">Pinia Store</span>
              <span class="text-xs text-muted-foreground">userStore.token</span>
            </div>
            <div class="col-center gap-xs px-xs">
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
            <div class="border border-primary/40 bg-primary/5 rounded-md p-sm col-stretch gap-xs">
              <Icons
                name="i-lucide-shield"
                size="sm"
                class="text-primary mx-auto"
              />
              <span class="text-xs font-semibold text-foreground">Token Provider</span>
              <span class="text-xs text-muted-foreground">infra/auth/</span>
            </div>
          </div>
          <div class="col-center gap-xs py-xs">
            <div class="w-px h-6 bg-border" />
            <Icons
              name="i-lucide-arrow-down"
              size="xs"
              class="text-muted-foreground"
            />
          </div>
          <div
            class="border border-border rounded-md p-sm col-stretch gap-xs text-center max-w-sm mx-auto w-full"
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
          <code class="font-mono text-xs text-foreground">setTokenProvider()</code>
          注入 getter 函数；HTTP 拦截器调用
          <code class="font-mono text-xs text-foreground">getToken()</code>
          获取当前 Token，满足 Infra → State 单向依赖约束，避免循环导入。
        </p>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">API Reference</h3>
        <Divider />
        <div class="col-stretch gap-md">
          <div class="col-stretch gap-xs">
            <span class="text-xs font-semibold text-muted-foreground">setTokenProvider(fn)</span>
            <pre class="text-xs font-mono text-foreground bg-muted rounded-md p-sm overflow-x-auto">
// main.ts — 应用入口注入
import { setTokenProvider } from '@/infra/auth/tokenProvider'
setTokenProvider(() => useUserStoreWithOut().getToken)</pre
            >
          </div>
          <div class="col-stretch gap-xs">
            <span class="text-xs font-semibold text-muted-foreground">getToken()</span>
            <pre class="text-xs font-mono text-foreground bg-muted rounded-md p-sm overflow-x-auto">
// axios interceptor — HTTP 层消费
import { getToken } from '@/infra/auth/tokenProvider'
const token = getToken()
if (token) config.headers.Authorization = `Bearer ${token}`</pre
            >
          </div>
          <div class="col-stretch gap-xs">
            <span class="text-xs font-semibold text-muted-foreground">setOnUnauthorized(fn)</span>
            <pre class="text-xs font-mono text-foreground bg-muted rounded-md p-sm overflow-x-auto">
// main.ts — 注入 401 回调
import { setOnUnauthorized } from '@/infra/auth/tokenProvider'
setOnUnauthorized(() => useUserStoreWithOut().logout())</pre
            >
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
