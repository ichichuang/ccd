<script setup lang="ts">
import { getRouterCapabilities } from '@/infra/router/routeProvider'

defineOptions({ name: 'ArchitectureInfraRouteProvider' })

const flatRouteCount = computed<number>(() => getRouterCapabilities().getFlatRouteList().length)
const menuTreeCount = computed<number>(() => getRouterCapabilities().getAdminMenuTree().length)
const isInitialized = computed<boolean>(() => flatRouteCount.value > 0 || menuTreeCount.value > 0)
</script>

<template>
  <div class="animate__animated animate__fadeIn col-stretch gap-md">
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">Route Provider</h2>
            <p class="text-sm text-muted-foreground m-0">
              依赖注入 — Store 通过 Provider 查询路由树，无需直接依赖 Vue Router
            </p>
          </div>
          <Tag
            :value="isInitialized ? `${flatRouteCount} routes` : 'Not initialized'"
            :severity="isInitialized ? 'success' : 'warn'"
          />
        </div>
        <Divider />

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-md">
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">getFlatRouteList().length</span>
            <span class="text-xl font-mono font-bold text-primary">{{ flatRouteCount }}</span>
          </div>
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">getAdminMenuTree().length</span>
            <span class="text-xl font-mono font-bold text-foreground">{{ menuTreeCount }}</span>
          </div>
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">status</span>
            <span
              class="text-sm font-semibold"
              :class="isInitialized ? 'text-success' : 'text-muted-foreground'"
            >
              {{ isInitialized ? 'initialized' : 'not initialized' }}
            </span>
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
                name="i-lucide-git-merge"
                size="sm"
                class="text-foreground mx-auto"
              />
              <span class="text-xs font-semibold text-foreground">Router System</span>
              <span class="text-xs text-muted-foreground">vue-router routes</span>
            </div>
            <div class="col-center gap-xs px-xs">
              <span class="text-xs text-muted-foreground font-mono text-ellipsis-1">
                setRouterCapabilities(caps)
              </span>
              <div class="w-full border-t border-border" />
              <Icons
                name="i-lucide-arrow-right"
                size="xs"
                class="text-primary"
              />
              <span class="text-xs text-muted-foreground font-mono text-ellipsis-1">
                getRouterCapabilities()
              </span>
            </div>
            <div class="border border-primary/40 bg-primary/5 rounded-md p-sm col-stretch gap-xs">
              <Icons
                name="i-lucide-route"
                size="sm"
                class="text-primary mx-auto"
              />
              <span class="text-xs font-semibold text-foreground">Route Provider</span>
              <span class="text-xs text-muted-foreground">infra/router/</span>
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
              name="i-lucide-layers"
              size="sm"
              class="text-foreground mx-auto"
            />
            <span class="text-xs font-semibold text-foreground">Pinia Stores</span>
            <span class="text-xs text-muted-foreground">
              permissionStore — 无需直接 import vue-router
            </span>
          </div>
        </div>
        <p class="text-sm text-muted-foreground m-0">
          Store 通过
          <code class="code-inline">getRouterCapabilities()</code>
          查询路由数据，完全不依赖 vue-router。路由系统初始化完成后通过
          <code class="code-inline">setRouterCapabilities()</code>
          注入实际能力，满足 Store → Infra 单向依赖，防止循环引用。
        </p>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">API Reference</h3>
        <Divider />
        <div class="col-stretch gap-md">
          <div class="col-stretch gap-xs">
            <span class="text-xs font-semibold text-muted-foreground">
              setRouterCapabilities(caps)
            </span>
            <pre class="code-block">
// router/index.ts — 路由初始化完成后注入
import { setRouterCapabilities } from '@/infra/router/routeProvider'
setRouterCapabilities({
  getAdminMenuTree: () => generateMenuTree(processedRoutes),
  getFlatRouteList: () => flattenRoutes(processedRoutes),
})</pre
            >
          </div>
          <div class="col-stretch gap-xs">
            <span class="text-xs font-semibold text-muted-foreground">getRouterCapabilities()</span>
            <pre class="code-block">
// permissionStore — Store 消费路由能力
import { getRouterCapabilities } from '@/infra/router/routeProvider'
const routes = getRouterCapabilities().getFlatRouteList()
const menuTree = getRouterCapabilities().getAdminMenuTree()</pre
            >
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
