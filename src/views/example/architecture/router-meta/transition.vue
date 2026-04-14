<script setup lang="ts">
// 路由级过渡由 AnimateRouterView + meta.transition 驱动
// 支持 name / enterClass / leaveClass / duration(delay) 分阶段控制
</script>

<template>
  <div
    class="col-stretch"
    data-archetype="A1-toolbar-content"
  >
    <div class="col-stretch gap-md min-h-0 min-w-0">
      <div class="layout-narrow col-stretch gap-md min-w-0">
        <header class="shrink-0 glass-panel col-stretch gap-md min-h-0">
          <div class="row-between gap-md min-w-0">
            <div class="row-start gap-sm min-w-0 flex-wrap">
              <div class="glass-icon-box shrink-0">
                <Icons
                  name="i-lucide-sparkles"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">
                    Route Transition
                  </span>
                  <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                    META
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  当前支持在
                  <code class="text-xs">meta.transition</code>
                  中配置
                  <code class="text-xs">name</code>
                  （如
                  <code class="text-xs">fade-slide</code>
                  、
                  <code class="text-xs">cinematic-fade</code>
                  、
                  <code class="text-xs">fade</code>
                  ），也支持
                  <code class="text-xs">enterClass</code>
                  /
                  <code class="text-xs">leaveClass</code>
                  （如
                  <code class="text-xs">zoomIn</code>
                  /
                  <code class="text-xs">zoomOut</code>
                  ）。底层会自动补全
                  <code class="text-xs">animate__animated</code>
                  与
                  <code class="text-xs">animate__</code>
                  前缀，并在 class 模式下启用
                  <code class="text-xs">type=&quot;animation&quot;</code>
                  。此外支持
                  <code class="text-xs">duration</code>
                  /
                  <code class="text-xs">delay</code>
                  的全局或分阶段写法（
                  <code class="text-xs">{ enter, leave }</code>
                  ），引擎会在
                  <code class="text-xs">before-enter / before-leave</code>
                  生命周期把变量注入到真实 DOM 节点。 全局字符串配置会写入
                  <code class="text-xs">--route-transition-duration</code>
                  、
                  <code class="text-xs">--animate-duration</code>
                  、
                  <code class="text-xs">--route-transition-delay</code>
                  与
                  <code class="text-xs">--animate-delay</code>
                  。 当同时配置了 class 时，优先走 animate.css；否则回退到具名过渡链路（meta.name →
                  layout.transitionName → cinematic-fade）。请确保布局设置中已开启「路由过渡」。
                </span>
              </div>
            </div>
          </div>
        </header>

        <div class="material-elevated col-stretch gap-sm min-w-0">
          <div class="text-md font-medium">本路由 meta.transition 配置</div>
          <pre class="text-muted-foreground text-sm font-mono whitespace-pre-wrap">{{
            JSON.stringify(
              {
                transition: {
                  enterClass: 'zoomIn',
                  leaveClass: 'zoomOut',
                  duration: { enter: '600ms', leave: '400ms' },
                },
              },
              null,
              2
            )
          }}</pre>
          <p class="text-muted-foreground text-sm">
            在路由
            <code class="text-xs">meta</code>
            中配置
            <code class="text-xs">transition.name</code>
            可继续使用具名过渡。新增
            <code class="text-xs">transition.enterClass</code>
            /
            <code class="text-xs">transition.leaveClass</code>
            后，将自动切换到 animate.css 过渡模式。并且
            <code class="text-xs">transition.duration</code>
            /
            <code class="text-xs">transition.delay</code>
            支持
            <code class="text-xs">string</code>
            和
            <code class="text-xs">{ enter, leave }</code>
            两种写法，底层引擎会自动按阶段注入变量并接管生命周期。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
