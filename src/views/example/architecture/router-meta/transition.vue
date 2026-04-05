<script setup lang="ts">
// 本页使用 meta.transition 自定义进场/离场动画
// 配置了 fadeInRight / fadeOutLeft，与其他页面的默认 fade 不同
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
                    <span
                      class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      META
                    </span>
                  </div>
                  <span class="text-sm text-muted-foreground text-ellipsis-1">
                    进出本页时应有「右进左出」的滑动效果，与默认的淡入淡出不同。需确保布局设置中已开启「路由过渡」。
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
                  name: 'fade-slide',
                  enterTransition: 'animate__animated animate__fadeInRight animate__fast',
                  leaveTransition: 'animate__animated animate__fadeOutLeft animate__fast',
                  duration: '400ms',
                },
                null,
                2
              )
            }}</pre>
            <p class="text-muted-foreground text-sm">
              进出本页时应有「右进左出」的滑动效果，与默认的淡入淡出不同。需确保布局设置中已开启「路由过渡」。
            </p>
          </div>
        </div>
      </div>
    </AnimateWrapper>
  </div>
</template>
