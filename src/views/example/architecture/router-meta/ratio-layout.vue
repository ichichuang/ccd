<script setup lang="ts">
defineOptions({ name: 'ArchitectureRouterMetaRatioLayout' })

const route = useRoute()
const metaParent = computed<string>(() => {
  const p = route.meta?.parent
  return typeof p === 'string' ? p : '—'
})
const metaRatio = computed<string>(() => {
  const r = route.meta?.ratio
  return typeof r === 'string' ? r : '—'
})
</script>

<template>
  <div class="animate__animated animate__fadeIn col-stretch gap-md">
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">Ratio Layout</h2>
            <p class="text-sm text-muted-foreground m-0">
              meta.parent + meta.ratio — 将内容区域锁定为指定宽高比容器
            </p>
          </div>
          <div class="row-center gap-sm">
            <Tag
              value="parent: ratio"
              severity="primary"
            />
            <Tag
              value="ratio: 16:9"
              severity="info"
            />
          </div>
        </div>
        <Divider />

        <div class="grid grid-cols-2 md:grid-cols-4 gap-md">
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">route.meta.parent</span>
            <span class="text-sm font-mono font-bold text-primary">{{ metaParent }}</span>
          </div>
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">route.meta.ratio</span>
            <span class="text-sm font-mono font-bold text-primary">{{ metaRatio }}</span>
          </div>
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">16:9 Content Preview</h3>
        <Divider />
        <p class="text-sm text-muted-foreground m-0">
          <code class="code-inline">LayoutRatio</code>
          将内容区域包裹在固定宽高比容器中。本页面整体渲染于此容器内。下方模拟该容器效果：
        </p>
        <div class="aspect-video bg-muted rounded-xl border border-border col-center gap-md w-full">
          <Icons
            name="i-lucide-ratio"
            size="lg"
            class="text-muted-foreground"
          />
          <span class="text-sm text-muted-foreground font-mono">aspect-ratio: 16 / 9</span>
          <span class="text-xs text-muted-foreground">宽高比固定，内容自适应填充</span>
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">Route Config</h3>
        <Divider />
        <pre class="code-block">{{
          JSON.stringify(
            {
              path: '/example/router-meta/ratio-demo',
              name: 'ExampleRatioDemo',
              meta: {
                titleKey: 'router.example.architecture.routerMeta.ratioLayout',
                rank: 5,
                icon: 'i-lucide-ratio',
                parent: 'ratio',
                ratio: '16:9',
              },
            },
            null,
            2
          )
        }}</pre>
        <p class="text-sm text-muted-foreground m-0">
          <code class="code-inline">parent: 'ratio'</code>
          告知路由系统使用 LayoutRatio 作为外层容器；
          <code class="code-inline">ratio: '16:9'</code>
          设定具体比例。适合大屏展示、演示视频区等场景。
        </p>
      </section>
    </div>
  </div>
</template>
