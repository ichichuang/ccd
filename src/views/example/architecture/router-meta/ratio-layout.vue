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
                    name="i-lucide-layout-grid"
                    size="xl"
                    class="text-primary"
                  />
                </div>
                <div class="col-stretch gap-xs min-w-0">
                  <div class="row-start gap-xs min-w-0 flex-wrap">
                    <span class="text-lg font-bold text-foreground text-no-wrap">Ratio Layout</span>
                    <span
                      class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      META
                    </span>
                  </div>
                  <span class="text-sm text-muted-foreground text-ellipsis-1">
                    meta.parent + meta.ratio — 将内容区域锁定为指定宽高比容器
                  </span>
                </div>
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

            <div class="grid grid-cols-2 md:grid-cols-4 gap-md min-w-0">
              <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
                <span class="text-xs text-muted-foreground">route.meta.parent</span>
                <span class="text-sm font-mono font-bold text-primary">{{ metaParent }}</span>
              </div>
              <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
                <span class="text-xs text-muted-foreground">route.meta.ratio</span>
                <span class="text-sm font-mono font-bold text-primary">{{ metaRatio }}</span>
              </div>
            </div>
          </header>

          <section class="material-elevated col-stretch gap-md min-w-0">
            <h3 class="text-md font-semibold text-foreground m-0">16:9 Content Preview</h3>
            <p class="text-sm text-muted-foreground m-0">
              <code class="code-inline">LayoutRatio</code>
              将内容区域包裹在固定宽高比容器中。本页面整体渲染于此容器内。下方模拟该容器效果：
            </p>
            <div
              class="aspect-video bg-muted rounded-xl border border-border col-center gap-md w-full"
            >
              <Icons
                name="i-lucide-ratio"
                size="lg"
                class="text-muted-foreground"
              />
              <span class="text-sm text-muted-foreground font-mono">aspect-ratio: 16 / 9</span>
              <span class="text-xs text-muted-foreground">宽高比固定，内容自适应填充</span>
            </div>
          </section>

          <section class="material-elevated col-stretch gap-md min-w-0">
            <h3 class="text-md font-semibold text-foreground m-0">Route Config</h3>
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
    </AnimateWrapper>
  </div>
</template>
