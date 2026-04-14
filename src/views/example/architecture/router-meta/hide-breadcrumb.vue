<script setup lang="ts">
defineOptions({ name: 'ArchitectureRouterMetaHideBreadcrumb' })

const route = useRoute()
const hideBreadcrumb = computed<boolean>(() => route.meta?.hideBreadcrumb === true)
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
                  name="i-lucide-navigation-off"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">
                    Hide Breadcrumb
                  </span>
                  <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                    META
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  meta.hideBreadcrumb — 隐藏当前页顶部的面包屑导航栏
                </span>
              </div>
            </div>
            <Tag
              :value="hideBreadcrumb ? 'hideBreadcrumb: true' : 'hideBreadcrumb: false'"
              :severity="hideBreadcrumb ? 'warn' : 'secondary'"
            />
          </div>

          <div class="col-stretch gap-sm min-w-0">
            <div class="row-between min-w-0">
              <span class="text-sm text-muted-foreground">Live: route.meta.hideBreadcrumb</span>
              <Tag
                :value="`${hideBreadcrumb}`"
                :severity="hideBreadcrumb ? 'warn' : 'secondary'"
              />
            </div>
            <p class="text-sm text-muted-foreground m-0">
              观察布局顶部面包屑区域 —
              当前页面的面包屑应已被隐藏。对比访问其他示例页面，可以明显看到差异。
            </p>
          </div>
        </header>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <h3 class="text-md font-semibold text-foreground m-0">Route Config</h3>
          <pre class="code-block">{{
            JSON.stringify(
              {
                path: '/example/router-meta/hide-breadcrumb',
                name: 'ExampleHideBreadcrumb',
                meta: {
                  titleKey: 'router.example.architecture.routerMeta.hideBreadcrumb',
                  rank: 3,
                  icon: 'i-lucide-navigation',
                  hideBreadcrumb: true,
                },
              },
              null,
              2
            )
          }}</pre>
        </section>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <h3 class="text-md font-semibold text-foreground m-0">适用场景</h3>
          <div class="col-stretch gap-sm min-w-0">
            <div class="row-start gap-sm items-start min-w-0">
              <Icons
                name="i-lucide-monitor"
                size="xs"
                class="text-primary mt-xs shrink-0"
              />
              <p class="text-sm text-muted-foreground m-0">
                全屏内容页 — 面包屑占用垂直空间且导航语义冗余
              </p>
            </div>
            <div class="row-start gap-sm items-start min-w-0">
              <Icons
                name="i-lucide-bar-chart-2"
                size="xs"
                class="text-primary mt-xs shrink-0"
              />
              <p class="text-sm text-muted-foreground m-0">
                大屏展示 / 数据看板 — 简洁布局优先，去除所有非核心 UI 元素
              </p>
            </div>
            <div class="row-start gap-sm items-start min-w-0">
              <Icons
                name="i-lucide-link"
                size="xs"
                class="text-primary mt-xs shrink-0"
              />
              <p class="text-sm text-muted-foreground m-0">
                独立嵌入页面 — 自身具有完整导航体系时无需再显示面包屑
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
