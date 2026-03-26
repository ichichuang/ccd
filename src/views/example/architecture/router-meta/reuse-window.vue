<script setup lang="ts">
defineOptions({ name: 'ArchitectureRouterMetaReuseWindow' })

const route = useRoute()
const reuseWindow = computed<boolean>(() => route.meta?.reuseWindow === true)
const parentLayout = computed<string>(() => {
  const p = route.meta?.parent
  return typeof p === 'string' ? p : '—'
})
</script>

<template>
  <div class="animate__animated animate__fadeIn col-stretch gap-md">
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between items-center">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">Reuse Window</h2>
            <p class="text-sm text-muted-foreground m-0">
              meta.reuseWindow — 多次点击菜单时复用已有窗口，不重复打开
            </p>
          </div>
          <div class="row-center gap-sm">
            <Tag
              :value="`reuseWindow: ${reuseWindow}`"
              :severity="reuseWindow ? 'success' : 'secondary'"
            />
            <Tag
              :value="`parent: ${parentLayout}`"
              severity="info"
            />
          </div>
        </div>
        <Divider />

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-md">
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">reuseWindow</span>
            <span class="text-xl font-mono font-bold text-primary">{{ reuseWindow }}</span>
          </div>
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">parent layout</span>
            <span class="text-xl font-mono font-bold text-foreground">{{ parentLayout }}</span>
          </div>
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">behavior</span>
            <span class="text-sm font-semibold text-success">Focus existing window</span>
          </div>
        </div>

        <p class="text-sm text-muted-foreground m-0">
          从侧边栏多次点击「窗口复用」菜单 —
          若已存在该路由的浏览器窗口，系统会聚焦该窗口而非重新打开。 本页使用
          <code class="font-mono text-xs text-foreground">parent: 'fullscreen'</code>
          布局，即每次以新窗口全屏呈现。
        </p>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">Route Config</h3>
        <Divider />
        <pre class="text-xs font-mono text-foreground bg-muted rounded-md p-sm overflow-x-auto">{{
          JSON.stringify(
            {
              path: '/example/router-meta/reuse-window',
              name: 'ExampleReuseWindow',
              meta: {
                titleKey: 'router.example.architecture.routerMeta.reuseWindow',
                rank: 6,
                icon: 'i-lucide-app-window',
                parent: 'fullscreen',
                reuseWindow: true,
              },
            },
            null,
            2
          )
        }}</pre>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">适用场景</h3>
        <Divider />
        <div class="col-stretch gap-sm">
          <div class="row-start gap-sm items-start">
            <Icons
              name="i-lucide-bar-chart-3"
              size="xs"
              class="text-primary mt-xs shrink-0"
            />
            <p class="text-sm text-muted-foreground m-0">
              数据大屏 / 看板 — 确保始终只有一个实例在运行，避免资源浪费
            </p>
          </div>
          <div class="row-start gap-sm items-start">
            <Icons
              name="i-lucide-file-bar-chart"
              size="xs"
              class="text-primary mt-xs shrink-0"
            />
            <p class="text-sm text-muted-foreground m-0">
              报表预览页 — 避免同一报表被多次打开造成状态混乱
            </p>
          </div>
          <div class="row-start gap-sm items-start">
            <Icons
              name="i-lucide-maximize"
              size="xs"
              class="text-primary mt-xs shrink-0"
            />
            <p class="text-sm text-muted-foreground m-0">
              全屏工具页 — 用户期望「点击即聚焦」而非「反复新开」
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
